import { useState } from 'react';
import { PackageIcon, PlaneIcon, ShieldCheckIcon, ClockIcon } from 'lucide-react';
import { useModal } from './Modal';

export function CtaRequestVariants() {
  const [requestText, setRequestText] = useState('');
  const { open } = useModal();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requestText.trim()) {
      open('default', requestText);
    }
  };

  return (
    <section className='py-8 md:py-12'>
      <div className='container-app space-y-8'>
        
        {/* Variante 6: Bold Statement with Emoji Tags */}
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

        {/* Variante 7: Minimal with Top Tags Bar */}
        <div className='rounded-2xl border border-[#1a1240] bg-gradient-to-br from-[#12092d] via-[#1a0f45] to-[#2b1672] shadow-xl shadow-purple-900/30 overflow-hidden'>
          <div className='bg-white/5 border-b border-white/10 px-6 py-3'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-semibold text-white/90'>Traemos cualquier producto internacional</span>
              <div className='flex items-center gap-3 text-[10px] text-white/70'>
                <span className='flex items-center gap-1'><PackageIcon className='w-3 h-3 text-underla-300' /> Track</span>
                <span className='flex items-center gap-1'><ShieldCheckIcon className='w-3 h-3 text-green-300' /> Seguro</span>
                <span className='flex items-center gap-1'><ClockIcon className='w-3 h-3 text-blue-300' /> Express</span>
              </div>
            </div>
          </div>
          <div className='p-6'>
            <form onSubmit={handleSubmit} className='flex gap-3'>
              <input
                type='text'
                className='flex-1 h-12 rounded-xl border border-white/30 bg-white/10 px-4 placeholder:text-white/50 text-white text-sm focus:border-underla-400/60 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-underla-500/20 transition-all'
                placeholder='Escribe lo que necesitas...'
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                required
              />
              <button type='submit' className='inline-flex items-center justify-center gap-2 bg-white text-neutral-900 hover:bg-neutral-50 active:scale-[0.98] h-12 px-6 rounded-xl text-sm font-semibold shadow-lg transition-all whitespace-nowrap'>
                <PlaneIcon className='w-4 h-4 text-underla-600' />
                Solicitar
              </button>
            </form>
          </div>
        </div>

        {/* Variante 8: Card Style with Icon Grid */}
        <div className='rounded-2xl border border-[#1a1240] bg-gradient-to-br from-[#12092d] via-[#1a0f45] to-[#2b1672] p-6 md:p-7 shadow-xl shadow-purple-900/30'>
          <div className='grid md:grid-cols-[auto_1fr] gap-6 items-center'>
            <div className='flex md:flex-col gap-3'>
              <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-underla-500/30 to-underla-600/30 border border-underla-400/40 flex items-center justify-center'>
                <PackageIcon className='w-5 h-5 text-underla-200' />
              </div>
              <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/30 to-emerald-600/30 border border-green-400/40 flex items-center justify-center'>
                <ShieldCheckIcon className='w-5 h-5 text-green-200' />
              </div>
              <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-cyan-600/30 border border-blue-400/40 flex items-center justify-center'>
                <ClockIcon className='w-5 h-5 text-blue-200' />
              </div>
            </div>
            <div className='space-y-4'>
              <h4 className='font-bold text-base md:text-lg text-white'>
                Desde gadgets hasta ropa, lo que quieras lo traemos
              </h4>
              <form onSubmit={handleSubmit} className='flex gap-3'>
                <input
                  type='text'
                  className='flex-1 h-12 rounded-xl border border-white/30 bg-white/10 px-4 placeholder:text-white/50 text-white text-sm focus:border-underla-400/60 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-underla-500/20 transition-all'
                  placeholder='Ej: Nintendo Switch, 1 und, Cusco'
                  value={requestText}
                  onChange={(e) => setRequestText(e.target.value)}
                  required
                />
                <button type='submit' className='inline-flex items-center justify-center gap-2 bg-white text-neutral-900 hover:bg-neutral-50 active:scale-[0.98] h-12 px-6 rounded-xl text-sm font-semibold shadow-lg transition-all whitespace-nowrap'>
                  <PlaneIcon className='w-4 h-4 text-underla-600' />
                  Cotizar
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Variante 9: Compact Inline with Colored Tags */}
        <div className='rounded-2xl border border-[#1a1240] bg-gradient-to-br from-[#12092d] via-[#1a0f45] to-[#2b1672] p-5 md:p-6 shadow-xl shadow-purple-900/30'>
          <div className='flex flex-col md:flex-row md:items-center gap-4'>
            <div className='flex-1'>
              <h4 className='font-bold text-base text-white mb-2'>Cualquier producto del mundo a Perú</h4>
              <div className='flex gap-2'>
                <span className='text-[10px] px-2 py-1 rounded-md bg-underla-500/30 text-underla-100 border border-underla-400/40'>📦 Tracking</span>
                <span className='text-[10px] px-2 py-1 rounded-md bg-green-500/30 text-green-100 border border-green-400/40'>🛡️ Protegido</span>
                <span className='text-[10px] px-2 py-1 rounded-md bg-blue-500/30 text-blue-100 border border-blue-400/40'>⚡ Express</span>
              </div>
            </div>
            <form onSubmit={handleSubmit} className='flex gap-3 md:min-w-[420px]'>
              <input
                type='text'
                className='flex-1 h-11 rounded-xl border border-white/30 bg-white/10 px-4 placeholder:text-white/50 text-white text-sm focus:border-underla-400/60 focus:bg-white/15 focus:outline-none transition-all'
                placeholder='¿Qué quieres traer?'
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                required
              />
              <button type='submit' className='inline-flex items-center justify-center gap-2 bg-white text-neutral-900 hover:bg-neutral-50 active:scale-[0.98] h-11 px-5 rounded-xl text-sm font-semibold shadow-lg transition-all whitespace-nowrap'>
                <PlaneIcon className='w-4 h-4 text-underla-600' />
                Pedir
              </button>
            </form>
          </div>
        </div>

        {/* Variante 10: Two Column with Large Tags */}
        <div className='rounded-2xl border border-[#1a1240] bg-gradient-to-br from-[#12092d] via-[#1a0f45] to-[#2b1672] p-6 md:p-7 shadow-xl shadow-purple-900/30 relative overflow-hidden'>
          <div className='absolute -bottom-10 -left-10 w-40 h-40 bg-underla-500/10 rounded-full blur-3xl'></div>
          <div className='relative grid md:grid-cols-2 gap-6'>
            <div className='space-y-4'>
              <h4 className='font-bold text-lg md:text-xl text-white'>
                Amazon, eBay, AliExpress y más
              </h4>
              <div className='grid grid-cols-3 gap-2'>
                <div className='text-center p-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur'>
                  <PackageIcon className='w-5 h-5 text-underla-300 mx-auto mb-1' />
                  <span className='text-[9px] text-white/80 block'>Tracking</span>
                </div>
                <div className='text-center p-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur'>
                  <ShieldCheckIcon className='w-5 h-5 text-green-300 mx-auto mb-1' />
                  <span className='text-[9px] text-white/80 block'>Seguro</span>
                </div>
                <div className='text-center p-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur'>
                  <ClockIcon className='w-5 h-5 text-blue-300 mx-auto mb-1' />
                  <span className='text-[9px] text-white/80 block'>Rápido</span>
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmit} className='space-y-3'>
              <input
                type='text'
                className='w-full h-12 rounded-xl border border-white/30 bg-white/10 px-4 placeholder:text-white/50 text-white text-sm focus:border-underla-400/60 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-underla-500/20 transition-all'
                placeholder='Producto que necesitas...'
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                required
              />
              <button type='submit' className='w-full inline-flex items-center justify-center gap-2 bg-white text-neutral-900 hover:bg-neutral-50 active:scale-[0.98] h-12 px-6 rounded-xl text-sm font-semibold shadow-lg transition-all'>
                <PlaneIcon className='w-4 h-4 text-underla-600' />
                <span>Solicitar cotización</span>
              </button>
            </form>
          </div>
        </div>

        {/* Variante 11: Centered Hero Style */}
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

        {/* Variante 12: Split Design with Accent */}
        <div className='rounded-2xl border border-[#1a1240] bg-gradient-to-br from-[#12092d] via-[#1a0f45] to-[#2b1672] shadow-xl shadow-purple-900/30 overflow-hidden'>
          <div className='grid md:grid-cols-[2fr_3fr]'>
            <div className='bg-gradient-to-br from-underla-600/20 to-purple-600/20 p-6 md:p-7 border-r border-white/10'>
              <h4 className='font-bold text-base md:text-lg text-white mb-4'>
                Tech, moda, hogar, lo que sea
              </h4>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-white text-xs'>
                  <div className='w-6 h-6 rounded-lg bg-underla-500/30 border border-underla-400/40 flex items-center justify-center'>
                    <PackageIcon className='w-3.5 h-3.5 text-underla-200' />
                  </div>
                  <span>Seguimiento en tiempo real</span>
                </div>
                <div className='flex items-center gap-2 text-white text-xs'>
                  <div className='w-6 h-6 rounded-lg bg-green-500/30 border border-green-400/40 flex items-center justify-center'>
                    <ShieldCheckIcon className='w-3.5 h-3.5 text-green-200' />
                  </div>
                  <span>Compra 100% protegida</span>
                </div>
                <div className='flex items-center gap-2 text-white text-xs'>
                  <div className='w-6 h-6 rounded-lg bg-blue-500/30 border border-blue-400/40 flex items-center justify-center'>
                    <ClockIcon className='w-3.5 h-3.5 text-blue-200' />
                  </div>
                  <span>Respuesta inmediata</span>
                </div>
              </div>
            </div>
            <div className='p-6 md:p-7'>
              <form onSubmit={handleSubmit} className='space-y-3'>
                <input
                  type='text'
                  className='w-full h-12 rounded-xl border border-white/30 bg-white/10 px-4 placeholder:text-white/50 text-white text-sm focus:border-underla-400/60 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-underla-500/20 transition-all'
                  placeholder='Ej: Zapatillas Nike, talla 42, Trujillo'
                  value={requestText}
                  onChange={(e) => setRequestText(e.target.value)}
                  required
                />
                <button type='submit' className='w-full inline-flex items-center justify-center gap-2 bg-white text-neutral-900 hover:bg-neutral-50 active:scale-[0.98] h-12 px-6 rounded-xl text-sm font-semibold shadow-lg transition-all'>
                  <PlaneIcon className='w-4 h-4 text-underla-600' />
                  <span>Obtener cotización</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Variante 13: Floating Input with Bottom Tags */}
        <div className='rounded-2xl border border-[#1a1240] bg-gradient-to-br from-[#12092d] via-[#1a0f45] to-[#2b1672] p-6 md:p-7 shadow-xl shadow-purple-900/30'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <h4 className='font-bold text-base md:text-lg text-white'>
              Importa cualquier cosa de USA, Europa o Asia
            </h4>
            <div className='flex gap-3'>
              <input
                type='text'
                className='flex-1 h-12 rounded-xl border border-white/30 bg-white/10 px-4 placeholder:text-white/50 text-white text-sm focus:border-underla-400/60 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-underla-500/20 transition-all'
                placeholder='Describe tu pedido aquí...'
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                required
              />
              <button type='submit' className='inline-flex items-center justify-center gap-2 bg-white text-neutral-900 hover:bg-neutral-50 active:scale-[0.98] h-12 px-6 rounded-xl text-sm font-semibold shadow-lg transition-all whitespace-nowrap'>
                <PlaneIcon className='w-4 h-4 text-underla-600' />
                Cotizar
              </button>
            </div>
            <div className='flex items-center justify-between pt-2 border-t border-white/10'>
              <div className='flex gap-3'>
                <span className='inline-flex items-center gap-1 text-[10px] text-white/70'>
                  <PackageIcon className='w-3 h-3 text-underla-300' /> Tracking
                </span>
                <span className='inline-flex items-center gap-1 text-[10px] text-white/70'>
                  <ShieldCheckIcon className='w-3 h-3 text-green-300' /> Seguro
                </span>
                <span className='inline-flex items-center gap-1 text-[10px] text-white/70'>
                  <ClockIcon className='w-3 h-3 text-blue-300' /> Rápido
                </span>
              </div>
              <span className='text-[10px] text-white/50'>Respuesta en minutos</span>
            </div>
          </form>
        </div>

        {/* Variante 14: Gradient Tags Overlay */}
        <div className='rounded-2xl border border-[#1a1240] bg-gradient-to-br from-[#12092d] via-[#1a0f45] to-[#2b1672] p-6 md:p-7 shadow-xl shadow-purple-900/30 relative overflow-hidden'>
          <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-underla-500 via-purple-500 to-blue-500'></div>
          <div className='space-y-4'>
            <div className='flex items-start justify-between gap-4'>
              <h4 className='font-bold text-base md:text-lg text-white'>
                De Amazon a tu puerta en Perú
              </h4>
              <div className='flex gap-1.5'>
                <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-underla-500/40 to-underla-600/40 border border-underla-400/50 flex items-center justify-center backdrop-blur'>
                  <PackageIcon className='w-4 h-4 text-underla-200' />
                </div>
                <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/40 to-emerald-600/40 border border-green-400/50 flex items-center justify-center backdrop-blur'>
                  <ShieldCheckIcon className='w-4 h-4 text-green-200' />
                </div>
                <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/40 to-cyan-600/40 border border-blue-400/50 flex items-center justify-center backdrop-blur'>
                  <ClockIcon className='w-4 h-4 text-blue-200' />
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmit} className='flex gap-3'>
              <input
                type='text'
                className='flex-1 h-12 rounded-xl border border-white/30 bg-white/10 px-4 placeholder:text-white/50 text-white text-sm focus:border-underla-400/60 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-underla-500/20 transition-all'
                placeholder='Ej: Laptop Dell, 1 und, Piura'
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                required
              />
              <button type='submit' className='inline-flex items-center justify-center gap-2 bg-gradient-to-r from-white to-neutral-50 text-neutral-900 hover:from-neutral-50 hover:to-white active:scale-[0.98] h-12 px-6 rounded-xl text-sm font-semibold shadow-lg transition-all whitespace-nowrap'>
                <PlaneIcon className='w-4 h-4 text-underla-600' />
                Pedir
              </button>
            </form>
          </div>
        </div>

        {/* Variante 15: Compact Pill Style */}
        <div className='rounded-full border border-[#1a1240] bg-gradient-to-r from-[#12092d] via-[#1a0f45] to-[#2b1672] p-3 md:p-4 shadow-xl shadow-purple-900/30'>
          <div className='flex flex-col md:flex-row items-center gap-3 md:gap-4'>
            <div className='flex items-center gap-2'>
              <h4 className='font-bold text-sm md:text-base text-white whitespace-nowrap'>
                Importa lo que quieras
              </h4>
              <div className='flex gap-1'>
                <div className='w-5 h-5 rounded-full bg-underla-500/30 border border-underla-400/40 flex items-center justify-center'>
                  <PackageIcon className='w-2.5 h-2.5 text-underla-200' />
                </div>
                <div className='w-5 h-5 rounded-full bg-green-500/30 border border-green-400/40 flex items-center justify-center'>
                  <ShieldCheckIcon className='w-2.5 h-2.5 text-green-200' />
                </div>
                <div className='w-5 h-5 rounded-full bg-blue-500/30 border border-blue-400/40 flex items-center justify-center'>
                  <ClockIcon className='w-2.5 h-2.5 text-blue-200' />
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmit} className='flex gap-2 flex-1 w-full md:w-auto'>
              <input
                type='text'
                className='flex-1 md:min-w-[320px] h-10 rounded-full border border-white/30 bg-white/10 px-4 placeholder:text-white/50 text-white text-sm focus:border-underla-400/60 focus:bg-white/15 focus:outline-none transition-all'
                placeholder='¿Qué necesitas?'
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                required
              />
              <button type='submit' className='inline-flex items-center justify-center gap-1.5 bg-white text-neutral-900 hover:bg-neutral-50 active:scale-[0.98] h-10 px-5 rounded-full text-sm font-semibold shadow-lg transition-all whitespace-nowrap'>
                <PlaneIcon className='w-3.5 h-3.5 text-underla-600' />
                Cotizar
              </button>
            </form>
          </div>
        </div>

      </div>
    </section>
  );
}
