import { useState } from 'react';
import { useAside } from './Aside';

interface RequestFormData {
  name: string;
  phone: string;
  email: string;
  description: string;
}

export function RequestForm({ request }: { request: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { close } = useAside();

  console.log(request);
  
  const [formData, setFormData] = useState<RequestFormData>({
    name: '',
    phone: '',
    email: '',
    description: request
  });

  console.log(formData);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log(formData);
      console.log(request);
      
      setFormData({ ...formData, description: request })
      
      const response = await fetch('https://dashboard.underla.lat/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, description: request }),
      });

      if (response.ok) {
        close();
        // You might want to show a success message here
      } else {
        throw new Error('Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      // You might want to show an error message here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    console.log(formData);

  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          className="mt-1 w-full rounded-[20px] border-neutral-300 shadow-sm focus:border-underla-500 focus:ring-underla-500 h-12 px-4"
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
          className="mt-1 w-full rounded-[20px] border-neutral-300 shadow-sm focus:border-underla-500 focus:ring-underla-500 h-12 px-4"
        />
      </div>

      <div>
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
          className="mt-1 w-full rounded-[20px] border-neutral-300 shadow-sm focus:border-underla-500 focus:ring-underla-500 h-12 px-4"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-neutral-700">
          Tu solicitud
        </label>
        <textarea
          id="description"
          name="description"
          required
          value={request}
          onChange={handleChange}
          disabled
          rows={4}
          className="mt-1 w-full rounded-[20px] border-neutral-300 shadow-sm focus:border-underla-500 focus:ring-underla-500 p-4"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-underla-500 h-12 shadow-lg hover:shadow-xl shadow-underla-500/50 transition-shadow duration-200 px-8 cursor-pointer rounded-[20px] text-base font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
      </button>
    </form>
  );
} 