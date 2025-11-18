import { useState } from 'react';
import { Play, X } from 'lucide-react';

interface VideoReelItem {
  id: string;
  thumbnail: string;
  videoUrl: string;
  title: string;
}

const SAMPLE_REELS: VideoReelItem[] = [
  {
    id: '1',
    thumbnail: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=700&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk',
    title: 'Nuevos Productos',
  },
  {
    id: '2',
    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=700&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/9bZkp7q19f0',
    title: 'Ofertas Especiales',
  },
  {
    id: '3',
    thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=700&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/aqz-KE-bpKQ',
    title: 'Tendencias 2024',
  },
  {
    id: '4',
    thumbnail: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=700&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/c9F5kMUfFKk',
    title: 'Colección Premium',
  },
  {
    id: '5',
    thumbnail: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=700&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ',
    title: 'Estilo de Vida',
  },
];

export function VideoReel() {
  const [selectedVideo, setSelectedVideo] = useState<VideoReelItem | null>(null);

  return (
    <div className="container-app">
      {/* Section Title */}
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 motion-preset-blur-down">
          Historias Destacadas
        </h2>
        <p className="text-neutral-600 mt-2">Descubre lo último de Underla</p>
      </div>

      {/* Video Reels Grid */}
      <div className="relative">
        <div className="grid grid-cols-2 md:flex gap-3 md:gap-4 md:overflow-x-auto pb-4 md:snap-x md:snap-mandatory scrollbar-hide">
          {SAMPLE_REELS.map((reel, index) => (
            <button
              key={reel.id}
              onClick={() => setSelectedVideo(reel)}
              className={`group relative flex-shrink-0 w-full md:w-[180px] h-[240px] md:h-[320px] rounded-2xl overflow-hidden md:snap-start motion-preset-slide-up motion-delay-${index * 100}`}
            >
              {/* Thumbnail */}
              <img
                src={reel.thumbnail}
                alt={reel.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 transition-all duration-300 group-hover:bg-underla-500 group-hover:scale-110">
                  <Play className="w-6 h-6 md:w-8 md:h-8 text-underla-500 group-hover:text-white fill-current" />
                </div>
              </div>
              
              {/* Title */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-semibold text-sm md:text-base text-center">
                  {reel.title}
                </p>
              </div>
              
              {/* Border Ring */}
              <div className="absolute inset-0 rounded-2xl ring-2 ring-underla-500/50 group-hover:ring-4 group-hover:ring-underla-500 transition-all duration-300" />
            </button>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 motion-preset-fade"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden motion-preset-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-10 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-full p-2 transition-all duration-300"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Video Embed */}
            <iframe
              src={selectedVideo.videoUrl}
              title={selectedVideo.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Custom Scrollbar Hide CSS */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
