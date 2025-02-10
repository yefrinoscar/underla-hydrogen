import whatsapp from '../assets/whatsapp.svg'
import instagram from '../assets/instagram.svg'
import logo from "../assets/underla_logo.svg";

export function Footer() {
  return (
    <footer className="container-app flex items-center gap-10 h-16 justify-between">

      <div className="flex gap-2 items-center text-neutral-600">
        <img src={logo} alt="Logo underla" />
        <strong>UNDERLA</strong>
        © 2025 Todos los derechos reservadors.
      </div>

      <div className="flex gap-4 text-neutral-600">
         
        <div className='flex gap-2'>
          <a href='https://wa.me/+51930259624?text=${message}' rel="noopener noreferrer" target="_blank">
            <img src={whatsapp} className='h-6 w-6' alt="Whatsapp: " />
          </a>
        </div>
        <div className='flex gap-2'>
          <a href='https://www.instagram.com/underla.store' rel="noopener noreferrer" target="_blank">
          <img src={instagram} className='h-6 w-6' alt="IG: " />
          </a>
        </div>
      </div>
    </footer>
  );
}


{/* <div className="flex flex-col gap-4 text-neutral-600">
<div className='flex gap-2'>
  <img src={whatsapp} className='h-6 w-6' alt="Whatsapp: " />
  <span>
    +51 999 999 999
  </span>
</div>
<div className='flex gap-2'>
  <img src={instagram} className='h-6 w-6' alt="IG: " />
  <span>
    underla.store
  </span>
</div>

</div> */}