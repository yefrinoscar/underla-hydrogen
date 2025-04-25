import { X } from 'lucide-react';
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

type ModalType = 'default' | 'alert' | 'confirm' | 'info' | 'closed';
type ModalContextValue = {
  type: ModalType;
  open: (mode: ModalType) => void;
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
  const {type: activeType, close, isCloseDisabled} = useModal();
  const expanded = type === activeType;

  useEffect(() => {
    const abortController = new AbortController();

    if (expanded) {
      // Lock body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      document.addEventListener(
        'keydown',
        function handler(event: KeyboardEvent) {
          if (event.key === 'Escape' && !isCloseDisabled) {
            close();
          }
        },
        {signal: abortController.signal},
      );
    } else {
      // Restore scroll when modal is closed
      document.body.style.overflow = '';
    }
    
    return () => {
      abortController.abort();
      // Ensure scroll is restored on unmount
      document.body.style.overflow = '';
    };
  }, [close, expanded, isCloseDisabled]);

  const handleCloseAttempt = () => {
    if (!isCloseDisabled) {
      close();
    }
  };

  return (
    <div
      aria-modal
      className={`fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 bg-black/65 transition-opacity duration-300 ${
        expanded ? 'opacity-100' : 'opacity-0 pointer-events-none bg-red-300'
      }`}
      role="dialog"
    >
      <button 
        className={`absolute inset-0 w-full h-full ${isCloseDisabled ? 'cursor-not-allowed' : 'cursor-default'}`}
        onClick={handleCloseAttempt} 
        disabled={isCloseDisabled}
      />
      <div className="w-full max-w-md bg-white rounded-[20px] shadow-xl transform transition-all duration-300 z-10 overflow-hidden mt-16 md:mt-0 max-h-[80vh] md:max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between p-5">
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
        <main className="p-5 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

const ModalContext = createContext<ModalContextValue | null>(null);

Modal.Provider = function ModalProvider({children}: {children: ReactNode}) {
  const [type, setType] = useState<ModalType>('closed');
  const [isCloseDisabled, setCloseDisabled] = useState(false);

  return (
    <ModalContext.Provider
      value={{
        type,
        open: setType,
        close: () => setType('closed'),
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