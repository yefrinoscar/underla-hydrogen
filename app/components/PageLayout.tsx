import { Await, Link, Outlet, useLocation } from '@remix-run/react';
import { Suspense, useId } from 'react';
import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';
import { Aside } from '~/components/Aside';
import { Footer } from '~/components/Footer';
import { Header, HeaderMenu } from '~/components/Header';
import { CartMain } from '~/components/CartMain';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import { SearchResultsPredictive } from '~/components/SearchResultsPredictive';
import { Promotion } from '~/types/promotion';
import { PromotionCarousel } from './PromotionCarousel';
import { Modal } from './Modal';
import { RequestForm } from './RequestForm';

interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  children?: React.ReactNode;
  promotions: Promotion[];
}

export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  promotions,
  isLoggedIn,
  publicStoreDomain,
}: PageLayoutProps) {
  const { pathname } = useLocation();
  const isPromotionsPage = pathname.startsWith('/promotions') || pathname.startsWith('/collections/special');
  
  // Debug logging
  console.log('PageLayout: promotions count:', promotions.length);
  console.log('PageLayout: pathname:', pathname);
  console.log('PageLayout: isPromotionsPage:', isPromotionsPage);

  return (
    <Modal.Provider>
      <Aside.Provider>
        <CartAside cart={cart} />
        <Modal type="default" heading="Solicitud de pedido">
          <RequestForm request="" />
        </Modal>
        <SearchAside />
        <MobileMenuAside cart={cart} header={header} publicStoreDomain={publicStoreDomain} isLoggedIn={isLoggedIn} />

        {promotions.length > 0 && !isPromotionsPage && (
          <PromotionCarousel promotions={promotions} />
        )}

        {header && (
          <Header
            header={header}
            cart={cart}
            isLoggedIn={isLoggedIn}
            publicStoreDomain={publicStoreDomain}
          />
        )}
        <main>
          <Outlet context={{ promotions }} />
        </main>
        <Footer />
      </Aside.Provider>
    </Modal.Provider>
  );
}

function CartAside({ cart }: { cart: PageLayoutProps['cart'] }) {
  return (
    <Aside type="cart" heading="CART">
      <Suspense fallback={<p>Loading cart ...</p>}>
        <Await resolve={cart}>
          {(cart) => {
            return <CartMain cart={cart} layout="aside" />;
          }}
        </Await>
      </Suspense>
    </Aside>
  );
}

function SearchAside() {
  const queriesDatalistId = useId();
  return (
    <Aside type="search" heading="SEARCH">
      <div className="predictive-search">
        <br />
        <SearchFormPredictive>
          {({ fetchResults, goToSearch, inputRef }) => (
            <>
              <input
                name="q"
                onChange={fetchResults}
                onFocus={fetchResults}
                placeholder="Search"
                ref={inputRef}
                type="search"
                list={queriesDatalistId}
              />
              &nbsp;
              <button onClick={goToSearch}>Search</button>
            </>
          )}
        </SearchFormPredictive>

        <SearchResultsPredictive>
          {({ items, total, term, state, closeSearch }) => {
            const { articles, collections, pages, products, queries } = items;

            if (state === 'loading' && term.current) {
              return <div>Loading...</div>;
            }

            if (!total) {
              return <SearchResultsPredictive.Empty term={term} />;
            }

            return (
              <>
                <SearchResultsPredictive.Queries
                  queries={queries}
                  queriesDatalistId={queriesDatalistId}
                />
                <SearchResultsPredictive.Products
                  products={products}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Collections
                  collections={collections}
                  closeSearch={closeSearch}
                />
                <SearchResultsPredictive.Pages
                  pages={pages}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Articles
                  articles={articles}
                  closeSearch={closeSearch}
                  term={term}
                />
                {term.current && total ? (
                  <Link
                    onClick={closeSearch}
                    to={`${SEARCH_ENDPOINT}?q=${term.current}`}
                  >
                    <p>
                      View all results for <q>{term.current}</q>
                      &nbsp; →
                    </p>
                  </Link>
                ) : null}
              </>
            );
          }}
        </SearchResultsPredictive>
      </div>
    </Aside>
  );
}

function MobileMenuAside({
  header,
  publicStoreDomain,
  cart,
  isLoggedIn
}: {
  header: PageLayoutProps['header'];
  publicStoreDomain: PageLayoutProps['publicStoreDomain'];
  cart: PageLayoutProps['cart'];
  isLoggedIn: PageLayoutProps['isLoggedIn'];
}) {
  return (
    header.menu &&
    header.shop.primaryDomain?.url && (
      <Aside type="mobile" heading="MENU">
        <HeaderMenu
          menu={header.menu}
          viewport="mobile"
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
          cart={cart}
          isLoggedIn={isLoggedIn}
        />
      </Aside>
    )
  );
}
