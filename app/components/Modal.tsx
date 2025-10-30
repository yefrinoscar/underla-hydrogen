import { X } from 'lucide-react';
import React, {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
  cloneElement,
  isValidElement,
  Children,
  useRef,
} from 'react';

type ModalType = 'default' | 'alert' | 'confirm' | 'info' | 'closed';
type ModalContextValue = {
  type: ModalType;
  request: string | undefined;
  open: (mode: ModalType, request?: string) => void;
  close: () => void;
  isCloseDisabled: boolean;
  setCloseDisabled: (disabled: boolean) => void;
};

/**
 * A modal dialog component with Overlay
 * @example
 * ```jsx
 * <Modal type="default" heading="Confirmation">
 *  <p>Are you sure you want to continue?</p>
 *  <div className="flex gap-2 justify-end mt-4">
 *    <button onClick={handleCancel}>Cancel</button>
 *    <button onClick={handleConfirm}>Confirm</button>
 *  </div>
 * </Modal>
 * ```
 */
export function Modal({
  children,
  heading,
  type,
}: {
  children?: React.ReactNode;
  type: ModalType;
  heading: React.ReactNode;
}) {
  const { type: activeType, close, isCloseDisabled, request } = useModal();
  const expanded = type === activeType;
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  
  // Use a ref to track if we're in the process of closing
  const isClosingRef = useRef(false);

  // Handle visibility changes based on expanded state
  useEffect(() => {
    if (expanded) {
      // When opening, first render the component
      setIsRendered(true);
      
      // Use a small timeout for a more consistent animation start
      const showTimer = setTimeout(() => {
        setIsVisible(true);
        isClosingRef.current = false;
      }, 30); // Smaller delay for more immediate response
      
      return () => clearTimeout(showTimer);
    } else if (isRendered) {
      // When closing, first make it invisible (animate out)
      setIsVisible(false);
      isClosingRef.current = true;
      
      // Then remove it from the DOM after animation completes
      const timer = setTimeout(() => {
        if (isClosingRef.current) {
          setIsRendered(false);
        }
      }, 350); // Slightly longer to ensure animation completes
      
      return () => clearTimeout(timer);
    }
  }, [expanded]);

  useEffect(() => {
    const abortController = new AbortController();

    if (expanded) {
      document.addEventListener(
        'keydown',
        function handler(event: KeyboardEvent) {
          if (event.key === 'Escape' && !isCloseDisabled) {
            close();
          }
        },
        {signal: abortController.signal},
      );
    }
    
    return () => {
      abortController.abort();
    };
  }, [close, expanded, isCloseDisabled]);

  const handleCloseAttempt = () => {
    if (!isCloseDisabled) {
      close();
    }
  };

  // Clone children and pass the request prop if they accept it
  const childrenWithProps = Children.map(children, (child) => {
    // Check if the child is a valid React element
    if (isValidElement(child)) {
      // Pass the request prop to the child
      return cloneElement(child, { request } as React.HTMLAttributes<unknown>);
    }
    return child;
  });

  // Don't render anything if the modal shouldn't be in the DOM
  if (!isRendered) return null;

  return (
    <div
      aria-modal
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out ${
        isVisible 
          ? 'bg-black/65 backdrop-blur-[2px]' 
          : 'bg-black/0 backdrop-blur-none pointer-events-none'
      }`}
      role="dialog"
      style={{
        transitionProperty: 'background-color, backdrop-filter',
      }}
    >
      <button 
        className={`absolute inset-0 w-full h-full ${isCloseDisabled ? 'cursor-not-allowed' : 'cursor-default'}`}
        onClick={handleCloseAttempt} 
        disabled={isCloseDisabled}
      />
      <div 
        className={`w-full max-w-md bg-white rounded-[20px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10 transition-all duration-300 ease-out ${
          isVisible 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-12 scale-95'
        }`}
        style={{
          boxShadow: isVisible ? '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' : 'none',
        }}
      >
        <header 
          className={`flex items-center justify-between p-5 transition-opacity duration-300 ease-out ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ 
            transitionDelay: isVisible ? '100ms' : '0ms',
          }}
        >
          <h3 className="text-xl font-semibold text-neutral-800">{heading}</h3>
          <button 
            className={`p-2 -mr-2 text-neutral-500 rounded-full transition-colors ${
              isCloseDisabled 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:text-neutral-800 hover:bg-neutral-100'
            }`}
            onClick={handleCloseAttempt}
            disabled={isCloseDisabled}
          >
            <X className='h-4 w-4' />
          </button>
        </header>
        <main 
          className={`p-5 overflow-y-auto transition-opacity duration-300 ease-out ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ 
            transitionDelay: isVisible ? '150ms' : '0ms',
          }}
        >
          {childrenWithProps}
        </main>
      </div>
    </div>
  );
}

const ModalContext = createContext<ModalContextValue | null>(null);

Modal.Provider = function ModalProvider({children}: {children: ReactNode}) {
  const [type, setType] = useState<ModalType>('closed');
  const [request, setRequest] = useState<string | undefined>(undefined);
  const [isCloseDisabled, setCloseDisabled] = useState(false);

  const openModal = (modalType: ModalType, requestData?: string) => {
    setType(modalType);
    setRequest(requestData);
  };

  return (
    <ModalContext.Provider
      value={{
        type,
        request,
        open: openModal,
        close: () => {
          setType('closed');
          setRequest(undefined);
        },
        isCloseDisabled,
        setCloseDisabled,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export function useModal() {
  const modal = useContext(ModalContext);
  if (!modal) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return modal;
}
