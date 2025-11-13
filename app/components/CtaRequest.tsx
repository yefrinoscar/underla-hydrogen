import { useState } from 'react';
import { PartyPopperIcon } from 'lucide-react';
import { useModal } from './Modal';

export function CtaRequest() {
  const [requestText, setRequestText] = useState('');
  const { open } = useModal();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requestText.trim()) {
      open('default', requestText);
    }
  };

  return (
    <div className='container-app py-20 md:py-24 flex flex-col items-center gap-4'>
      <h3 className='font-bold text-center text-2xl md:text-5xl text-neutral-700 motion-preset-blur-down'>
        ¿Necesitas algo único y especial?
      </h3>
      
      <form onSubmit={handleSubmit} className='flex flex-col w-full md:w-5/10 gap-4 motion-preset-slide-up motion-delay-200'>
        <div className='w-full md:w-full flex bg-neutral-100 rounded-[20px] has-[textarea:focus-within]:outline-2 has-[textarea:focus-within]:-outline-offset-2 has-[textarea:focus-within]:outline-underla-500'>
          <textarea
            className='w-full h-24 md:h-30 placeholder:text-neutral-400 p-5 focus:outline-none rounded-[20px] resize-none text-sm'
            placeholder='Estamos aquí para ayudarte, dinos qué estás buscando o qué necesitas hacer...'
            value={requestText}
            onChange={(e) => setRequestText(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className='bg-underla-500 h-14 shadow-lg hover:shadow-xl flex justify-center items-center text-center shadow-underla-500/50 transition-shadow duration-200 motion-ease-bounce px-8 cursor-pointer rounded-default text-md md:text-lg font-medium text-white motion-preset-up motion-delay-400'
        >
          <PartyPopperIcon className='w-5 h-5 mr-2' />
          <span>Enviar</span>
        </button>
      </form>
      
      <p className='text-xl text-neutral-500 motion-preset-fade motion-delay-600'>
        Te conseguimos todo, <strong>SÍ</strong>, todo.
      </p>
    </div>
  );
}
