import { useState } from 'react';
import { PackageIcon, PlaneIcon, ShieldCheckIcon, ClockIcon } from 'lucide-react';
import { useModal } from './Modal';

type CtaVariant = 'main' | 'emoji' | 'hero';

interface CtaRequestProps {
  variant?: CtaVariant;
}

export function CtaRequest({ variant = 'main' }: CtaRequestProps) {
  const [requestText, setRequestText] = useState('');
  const { open } = useModal();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requestText.trim()) {
      open('default', requestText);
    }
  };

  // Render Main CTA (Full Version)
  if (variant === 'main') {
    return (
      <div>
        <div className='container-app'>
          <div className='rounded-3xl border border-[#1a1240] bg-gradient-to-br from-[#12092d] via-[#1a0f45] to-[#2b1672] p-6 md:p-8 shadow-2xl shadow-purple-900/30'>
          <div className='grid md:grid-cols-2 gap-8 md:gap-10'>
            {/* Content Section */}
            <div className='space-y-4 text-white'>
              <span className='inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-[10px] tracking-[0.3em] uppercase font-medium'>
                Envíos internacionales a Perú
              </span>
              
              <h3 className='font-bold text-xl md:text-2xl leading-tight'>
                Traemos tus pedidos del extranjero directo a Perú
              </h3>
              
              <p className='text-sm text-white/80 leading-relaxed'>
                Compramos por ti en el extranjero y gestionamos el envío hasta tu puerta. Precios transparentes y seguimiento en tiempo real.
              </p>

              <div className='flex flex-wrap gap-2 pt-2'>
                <div className='inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs backdrop-blur'>
                  <PackageIcon className='w-4 h-4 text-underla-200' />
                  <span>Tracking en vivo</span>
                </div>
                <div className='inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs backdrop-blur'>
                  <ClockIcon className='w-4 h-4 text-underla-200' />
                  <span>Respuesta en minutos</span>
                </div>
                <div className='inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs backdrop-blur'>
                  <ShieldCheckIcon className='w-4 h-4 text-underla-200' />
                  <span>Compra segura</span>
                </div>
                <div className='inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs backdrop-blur'>
                  <PlaneIcon className='w-4 h-4 text-underla-200' />
                  <span>Envío internacional</span>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='space-y-3'>
                <label className='sr-only' htmlFor='cta-request-textarea'>
                  Describe tu pedido
                </label>
                
                <div className='relative'>
                  <textarea
                    id='cta-request-textarea'
                    className='w-full h-32 rounded-2xl border border-white/30 bg-white/10 px-4 py-3 placeholder:text-white/50 text-white text-sm md:text-base leading-relaxed focus:border-white/60 focus:bg-white/15 focus:outline-none resize-none transition-all duration-200'
                    placeholder='¿Qué quieres traer? Producto, cantidad y ciudad.'
                    value={requestText}
                    onChange={(e) => setRequestText(e.target.value)}
                    required
                  />
                  <span className='absolute bottom-3 right-4 text-[10px] text-white/50 font-medium'>
                    Ej: MacBook · 2 und · Lima
                  </span>
                </div>

                <p className='text-xs text-white/70'>
                  Respondemos en minutos con costos y tracking estimado.
                </p>
              </div>

              <button
                type='submit'
                className='w-full inline-flex items-center justify-center gap-2 bg-white text-neutral-900 hover:bg-neutral-50 active:scale-[0.98] h-11 px-5 rounded-2xl text-sm font-semibold shadow-lg shadow-black/30 transition-all duration-200'
              >
                <PlaneIcon className='w-5 h-5 text-underla-500' />
                <span>Recibir mi cotización</span>
              </button>
            </form>
          </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Emoji Variant
  if (variant === 'emoji') {
    return (
      <div>
        <div className='container-app'>
        <div className='rounded-2xl border border-[#1a1240] bg-gradient-to-br from-[#12092d] via-[#1a0f45] to-[#2b1672] p-6 md:p-7 shadow-xl shadow-purple-900/30'>
          <div className='space-y-4'>
            <div className='text-white'>
              <h4 className='font-bold text-lg md:text-xl mb-2'>
                ¿Quieres algo de USA, China o Europa? Lo traemos por ti
              </h4>
              <div className='flex flex-wrap gap-2'>
                <span className='inline-flex items-center gap-1.5 rounded-full bg-underla-500/20 border border-underla-400/30 px-3 py-1 text-[10px] text-underla-100 font-medium'>
                  📦 Tracking
                </span>
                <span className='inline-flex items-center gap-1.5 rounded-full bg-green-500/20 border border-green-400/30 px-3 py-1 text-[10px] text-green-100 font-medium'>
                  ✓ Seguro
                </span>
                <span className='inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 px-3 py-1 text-[10px] text-blue-100 font-medium'>
                  ⚡ Rápido
                </span>
              </div>
            </div>
            <form onSubmit={handleSubmit} className='flex gap-3'>
              <input
                type='text'
                className='flex-1 h-12 rounded-xl border border-white/30 bg-white/10 px-4 placeholder:text-white/50 text-white text-sm focus:border-underla-400/60 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-underla-500/20 transition-all'
                placeholder='Ej: AirPods Pro, 2 pares, Arequipa'
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                required
              />
              <button type='submit' className='inline-flex items-center justify-center gap-2 bg-white text-neutral-900 hover:bg-neutral-50 active:scale-[0.98] h-12 px-6 rounded-xl text-sm font-semibold shadow-lg transition-all'>
                <PlaneIcon className='w-4 h-4 text-underla-600' />
                <span>Cotizar</span>
              </button>
            </form>
          </div>
        </div>

        </div>
      </div>
    );
  }

  // Render Hero Variant
  if (variant === 'hero') {
    return (
      <div>
        <div className='container-app'>
        <div className='rounded-2xl border border-[#1a1240] bg-gradient-to-br from-[#12092d] via-[#1a0f45] to-[#2b1672] p-8 md:p-10 shadow-xl shadow-purple-900/30 text-center'>
          <div className='max-w-2xl mx-auto space-y-5'>
            <div className='inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-[10px] text-white font-medium backdrop-blur mb-2'>
              <div className='w-2 h-2 rounded-full bg-green-400 animate-pulse'></div>
              Servicio activo 24/7
            </div>
            <h4 className='font-bold text-xl md:text-2xl text-white'>
              Trae lo que quieras del extranjero
            </h4>
            <div className='flex flex-wrap justify-center gap-3'>
              <span className='inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-underla-500/20 to-underla-600/20 border border-underla-400/30 px-3 py-1.5 text-[10px] text-underla-100 font-medium'>
                <PackageIcon className='w-3 h-3' /> Tracking en vivo
              </span>
              <span className='inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-600/20 border border-green-400/30 px-3 py-1.5 text-[10px] text-green-100 font-medium'>
                <ShieldCheckIcon className='w-3 h-3' /> 100% Seguro
              </span>
              <span className='inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-600/20 border border-blue-400/30 px-3 py-1.5 text-[10px] text-blue-100 font-medium'>
                <ClockIcon className='w-3 h-3' /> Envío rápido
              </span>
            </div>
            <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-3 max-w-xl mx-auto'>
              <input
                type='text'
                className='flex-1 h-12 rounded-xl border border-white/30 bg-white/10 px-4 placeholder:text-white/50 text-white text-sm focus:border-underla-400/60 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-underla-500/20 transition-all'
                placeholder='Ej: PS5, 1 consola, Lima'
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                required
              />
              <button type='submit' className='inline-flex items-center justify-center gap-2 bg-white text-neutral-900 hover:bg-neutral-50 active:scale-[0.98] h-12 px-8 rounded-xl text-sm font-semibold shadow-lg transition-all whitespace-nowrap'>
                <PlaneIcon className='w-4 h-4 text-underla-600' />
                Cotizar ahora
              </button>
            </form>
          </div>
        </div>
        </div>
      </div>
    );
  }

  // Default fallback
  return null;
}
