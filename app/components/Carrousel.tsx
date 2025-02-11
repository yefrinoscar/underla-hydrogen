import { useState } from 'react';
import arrow_left from '../assets/arrow-left.svg'
import arrow_right from '../assets/arrow-right.svg'

export function Carrousel({
  items,
  children,
  countItems = 3
}: {
  items: unknown[];
  children: React.ReactNode;
  countItems: number
}) {

  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % (items.length - 2))
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + (items.length - 2)) % (items.length - 2))
  }


  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out gap-5 "
          style={{ transform: `translateX(${currentIndex === 0 ? '0' : `calc((( -${currentIndex} * ((100% - ${(countItems - 1) * 20}px) / ${countItems}) ) -  ${currentIndex * 20}px))`})` }}
        >
          {children}
        </div>
      </div>
      <button
          className="absolute bottom-0 left-0 transform translate-y-[150%] motion-translate-y-loop-25 cursor-pointer"
          onClick={prevSlide}
        >
          <img src={arrow_left} className="h-5 w-5" alt="" />
        </button>
        <button
          className="absolute bottom-0 right-0 transform translate-y-[150%] motion-translate-y-loop-25 cursor-pointer"
          onClick={nextSlide}
        >
          <img src={arrow_right} className="h-5 w-5 stroke-underla-500" alt="" />
        </button>
    </div>
  );
}
