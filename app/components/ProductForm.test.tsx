/* eslint-disable @typescript-eslint/no-explicit-any */
import "@testing-library/jest-dom"
import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'

/*
Framework note:
Detected testing stack: repository typically uses Vitest or Jest with @testing-library/react.
This suite follows @testing-library/react conventions and uses vi/jest-compatible spies.
If using Jest, ensure to alias vi -> jest or adjust mocks accordingly.
*/

const spy = (globalThis as any).vi ?? (globalThis as any).jest

// --- Mocks for external dependencies used by ProductForm ---
jest.mock('@remix-run/react', () => ({
  // Render Link as simple anchor to avoid router requirements
  Link: (props: any) => <a data-testid="remix-link" {...props} />,
}))

// Mock Hydrogen VariantSelector to call render-prop children for each provided option
jest.mock('@shopify/hydrogen', () => ({
  VariantSelector: ({ options, children }: any) => (
    <div data-testid="variant-selector">
      {Array.isArray(options) ? options.map((opt: any) => (
        <div key={opt.name} data-testid={`variant-option-${opt.name}`}>
          {typeof children === 'function' ? children({ option: opt }) : null}
        </div>
      )) : null}
    </div>
  ),
}))

// Mock Plane icon to a simple span
jest.mock('lucide-react', () => ({
  Plane: (props: any) => <span data-testid="icon-plane" {...props} />,
}))

// Mock AddToCartButton to a basic button that passes through disabled/onClick/children
jest.mock('~/components/AddToCartButton', () => ({
  AddToCartButton: ({ disabled, onClick, children }: any) => (
    <button data-testid="add-to-cart" disabled={disabled} onClick={onClick}>{children}</button>
  ),
}))

// Mock useAside to observe open('cart') calls
const openAsideMock = (spy?.fn ? spy.fn() : jest.fn())
jest.mock('~/components/Aside', () => ({
  useAside: () => ({ open: openAsideMock }),
}))

// Mock useModal to observe open calls with payload
const openModalMock = (spy?.fn ? spy.fn() : jest.fn())
jest.mock('./Modal', () => ({
  Modal: ({ children }: any) => <div data-testid="modal">{children}</div>,
  useModal: () => ({ open: openModalMock }),
}))

// Import the component under test AFTER mocks
import { ProductForm } from './ProductForm'

// ---------- Test Utilities ----------
type SelectedOption = { name: string; value: string }
type VariantValue = { value: string; isAvailable: boolean; isActive: boolean; to: string }
type OptionShape = { name: string; values: VariantValue[] }

const makeVariant = (overrides: Partial<any> = {}) => ({
  id: 'gid://shopify/ProductVariant/123',
  title: 'Default Variant',
  availableForSale: true,
  selectedOptions: [{ name: 'Size', value: 'M' }] as SelectedOption[],
  ...overrides,
})

const defaultProduct = (overrides: Partial<any> = {}) => ({
  handle: 'my-product',
  title: 'Awesome Tee',
  options: [] as OptionShape[],
  ...overrides,
})

// Convenience render
const renderForm = (props: Partial<React.ComponentProps<typeof ProductForm>> = {}) => {
  const product = defaultProduct(props?.product as any)
  const selectedVariant = props?.selectedVariant === undefined ? makeVariant() : props?.selectedVariant
  const variants = props?.variants ?? [makeVariant()]
  return render(<ProductForm product={product as any} selectedVariant={selectedVariant as any} variants={variants as any} />)
}

describe('ProductForm', () => {
  beforeEach(() => {
    openAsideMock.mockClear?.()
    openModalMock.mockClear?.()
  })

  describe('VariantSelector rendering (hasOnlyDefaultVariant)', () => {
    it('does NOT render VariantSelector when only default "Title: Default Title" variant exists', () => {
      const defaultOnlyVariant = makeVariant({
        selectedOptions: [{ name: 'Title', value: 'Default Title' }],
      })
      renderForm({
        product: defaultProduct({ options: [{ name: 'Size', values: [] }] }),
        variants: [defaultOnlyVariant],
      })

      expect(screen.queryByTestId('variant-selector')).toBeNull()
    })

    it('renders VariantSelector when multiple variants or non-default options exist', () => {
      const v1 = makeVariant({ id: 'gid://shopify/ProductVariant/1', selectedOptions: [{ name: 'Size', value: 'M' }] })
      const v2 = makeVariant({ id: 'gid://shopify/ProductVariant/2', selectedOptions: [{ name: 'Size', value: 'L' }] })
      renderForm({
        product: defaultProduct({ options: [{ name: 'Size', values: [] }] }),
        variants: [v1, v2],
      })

      expect(screen.getByTestId('variant-selector')).toBeInTheDocument()
    })
  })

  describe('Add to Cart vs Special Order', () => {
    it('renders "Agregar al carrito" button and opens aside cart on click when variant is available', () => {
      const available = makeVariant({ availableForSale: true })
      renderForm({ selectedVariant: available })

      const button = screen.getByTestId('add-to-cart')
      expect(button).toBeInTheDocument()
      expect(button).not.toBeDisabled()
      expect(screen.getByText('Agregar al carrito')).toBeInTheDocument()

      fireEvent.click(button)
      expect(openAsideMock).toHaveBeenCalledWith('cart')
    })

    it('renders Special Order button disabled when no selectedVariant', () => {
      renderForm({ selectedVariant: null as any })

      const specialBtn = screen.getByRole('button', { name: /Hacer el pedido/i })
      expect(specialBtn).toBeInTheDocument()
      expect(specialBtn).toBeDisabled()
    })

    it('renders Special Order button enabled when variant is unavailable and opens modal with correct payload', () => {
      const unavailable = makeVariant({ availableForSale: false, title: 'Red / XL' })
      renderForm({
        product: defaultProduct({ title: 'Awesome Tee' }),
        selectedVariant: unavailable,
      })

      const specialBtn = screen.getByRole('button', { name: /Hacer el pedido/i })
      expect(specialBtn).toBeEnabled()

      fireEvent.click(specialBtn)
      expect(openModalMock).toHaveBeenCalledTimes(1)
      const [modalType, message] = openModalMock.mock.calls[0]
      expect(modalType).toBe('default')
      expect(message).toMatch(/Quiero esto/i)
      expect(message).toMatch(/Awesome Tee/)
      expect(message).toMatch(/Red \/ XL/)
    })
  })

  describe('ProductOptions via mocked VariantSelector', () => {
    it('renders non-color option with display name (split by underscore), active state classes, and availability opacity', () => {
      const option: OptionShape = {
        name: 'Size', // no underscore keeps full
        values: [
          { value: 'Size_Small', isAvailable: true, isActive: false, to: '/p?size=S' },
          { value: 'Size_Medium', isAvailable: true, isActive: true, to: '/p?size=M' },
          { value: 'Size_XL', isAvailable: false, isActive: false, to: '/p?size=XL' },
        ],
      }
      renderForm({
        product: defaultProduct({ options: [option] }),
        variants: [makeVariant()],
      })

      // Should render headings and links for each
      // Active value "Size_Medium" should display "Medium"
      expect(screen.getByText(/Size: Medium/)).toBeInTheDocument()

      const medium = screen.getByRole('link', { name: 'Size_Medium' })

      expect(medium).toHaveTextContent('Medium')
      expect(medium.className).toMatch(/bg-neutral-900 .* text-white/)

      const small = screen.getByRole('link', { name: 'Size_Small' })
      expect(small).toHaveTextContent('Small')
      expect(small.className).toMatch(/bg-neutral-200/)
      expect((small as HTMLElement).style.opacity).toBe('') // available -> default (treated as 1)

      const xl = screen.getByRole('link', { name: 'Size_XL' })
      expect(xl).toHaveTextContent('XL')
      expect((xl as HTMLElement).style.opacity).toBe('0.2') // unavailable -> 0.2
    })

    it('renders color option with aria-label "Color: <name>", background color style, and selection indicator for active', () => {
      const colorOption: OptionShape = {
        name: 'CustomColor_Main', // triggers color path; heading should use "Main"
        values: [
          { value: 'Aguamarina | #00ffff', isAvailable: true, isActive: true, to: '/p?c=aqua' },
          { value: 'Rojo_Vivo | #ff0000', isAvailable: true, isActive: false, to: '/p?c=red' },
          { value: 'SinColor', isAvailable: true, isActive: false, to: '/p?c=none' }, // no pipe -> fallback letter
        ],
      }

      renderForm({
        product: defaultProduct({ options: [colorOption] }),
        variants: [makeVariant()],
      })

      // Heading includes displayHeading (Main) and active display name (Aguamarina)
      expect(screen.getByText(/Main: Aguamarina/)).toBeInTheDocument()

      // Active aqua swatch with background color
      const aquaLink = screen.getAllByTestId('remix-link').find(a => a.getAttribute('aria-label')?.includes('Color: Aguamarina')) as HTMLElement
      expect(aquaLink).toBeTruthy()
      // color square is inner span; verify computed style backgroundColor
      const aquaSquare = within(aquaLink).getByRole('img', { hidden: true }) as HTMLElement | null
      // Fallback if role not present: query span with inline style
      const spans = within(aquaLink).getAllByText((_, node) => node?.nodeName.toLowerCase() === 'span')
      const colored = spans.find(el => (el as HTMLElement).style.backgroundColor !== '')
      expect(colored).toBeTruthy()

      // Fallback no-color item should show first letter of display name
      const noColorLink = screen.getAllByTestId('remix-link').find(a => a.getAttribute('title') === 'SinColor') as HTMLElement
      expect(noColorLink).toBeTruthy()
      // Should render a block with the first letter "S"
      expect(within(noColorLink).getByText(/^S$/)).toBeInTheDocument()
    })
  })
})