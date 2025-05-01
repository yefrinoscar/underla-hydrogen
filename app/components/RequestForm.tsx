import { useState, useEffect, useRef } from 'react';
import { useAside } from './Aside';
import { useModal } from './Modal';

interface RequestFormData {
  name: string;
  phone: string;
  email: string;
  description: string;
}

export function RequestForm({ request }: { request: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { close, setCloseDisabled, type } = useModal();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousTypeRef = useRef(type);

  const [formData, setFormData] = useState<RequestFormData>({
    name: '',
    phone: '',
    email: '',
    description: ''
  });

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (previousTypeRef.current !== 'closed' && type === 'closed') {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      resetForm();
    }

    previousTypeRef.current = type;
  }, [type]);

  useEffect(() => {
    if (request) {
      setFormData(prev => ({ ...prev, description: request }));
    }
  }, [request]);

  const resetForm = () => {
    setTimeout(() => {
      setFormData({
        name: '',
        phone: '',
        email: '',
        description: ''
      });
      setShowSuccess(false);
      setIsSubmitting(false);
      setCloseDisabled(false);
    }, 400);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setIsSubmitting(true);
    setCloseDisabled(true);

    try {
      const response = await fetch('https://dashboard.underla.lat/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          description: formData.description
        }),
      });

      if (response.ok) {
        setShowSuccess(true);
        timeoutRef.current = setTimeout(() => {
          try {
            close();
            resetForm();
          } finally {
            timeoutRef.current = null;
          }
        }, 3000);
      } else {
        throw new Error('Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
    } finally {
      setIsSubmitting(false);
      setCloseDisabled(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      {showSuccess ? (
        <div className="flex items-center justify-center z-50">
          <div className="p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2">¡Solicitud enviada!</h2>
              <p className="text-gray-600 mb-4">Gracias por tu solicitud. Nos pondremos en contacto contigo pronto.</p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 space-y-4">
          <p className='text-sm md:text-base'>
            Usaremos esta info solo para tu pedido. ¡Tus datos están seguros! 😉
          </p>

          {request && (
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 mb-2">
              <p className="text-sm text-purple-800 font-medium">
                Estás solicitando un pedido especial
                <span className="block text-xs mt-1 text-purple-600">{request}</span>
              </p>
            </div>
          )}

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
                Nombre
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 w-full bg-neutral-100 rounded-[20px] has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-underla-500 h-12 px-4"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-neutral-700">
                Teléfono
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 w-full bg-neutral-100 rounded-[20px] has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-underla-500 h-12 px-4"
              />
            </div>

            <div className='col-span-2'>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 w-full bg-neutral-100 rounded-[20px] has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-underla-500 h-12 px-4"
              />
            </div>

            {/* <div className='col-span-2'>
              <label htmlFor="description" className="block text-sm font-medium text-neutral-700">
                Comentarios adicionales (opcional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="mt-1 w-full bg-neutral-100 rounded-[20px] p-4 has-[textarea:focus-within]:outline-2 has-[textarea:focus-within]:-outline-offset-2 has-[textarea:focus-within]:outline-underla-500"
              />
            </div> */}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-[#6644ff] via-[#4D2DDA] to-[#3620a0] text-white py-2.5 px-6 rounded-xl font-medium text-sm hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
            </button>
          </div>
        </form>
      )}
    </>
  );
}