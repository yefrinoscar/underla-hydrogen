import type { ProductVariantFragment, ProductMediaFragment } from 'storefrontapi.generated';
import { Image } from '@shopify/hydrogen';
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import type * as StorefrontAPI from '@shopify/hydrogen/storefront-api-types';

// Define a simple type for product images, assuming it's similar to Shopify's Image type
type ProductImageFragment = StorefrontAPI.Maybe<
  { __typename: 'Image' } & Pick<
    StorefrontAPI.Image,
    'id' | 'url' | 'altText' | 'width' | 'height'
  >
>;

// Extended type to support all media types from Shopify
type ProcessedMediaFragment = ProductImageFragment | {
  __typename: 'Video';
  id: string;
  url: string;
  altText?: string;
  width?: number;
  height?: number;
  mimeType?: string;
};

// Helper function to detect if URL is a video
const isVideoUrl = (url: string): boolean => {
  if (!url) return false;
  
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.wmv', '.m4v'];
  const lowerUrl = url.toLowerCase();
  
  return videoExtensions.some(ext => lowerUrl.includes(ext)) || 
         lowerUrl.includes('video') || 
         lowerUrl.includes('.mp4');
};

// Development helper to inject test videos
const getTestVideos = (): ProcessedMediaFragment[] => {
  if (typeof window === 'undefined') return [];
  
  const urlParams = new URLSearchParams(window.location.search);
  const testMode = urlParams.get('test');
  
  if (testMode === 'video') {
    return [
      {
        __typename: 'Video',
        id: 'test-video-1',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        altText: 'Test Video - Big Buck Bunny',
        width: 1920,
        height: 1080,
      },
      {
        __typename: 'Video',
        id: 'test-video-2',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        altText: 'Test Video - Elephants Dream',
        width: 1920,
        height: 1080,
      }
    ];
  }
  
  return [];
};

export function ProductImage({
  image,
  allImages,
}: {
  image: ProductVariantFragment['image'];
  allImages: ProcessedMediaFragment[];
}) {
  // Filter and process valid media (only if they actually exist)
  const validMedia = useMemo(() => {
    const realMedia = allImages?.filter(Boolean) || [];
    const testVideos = getTestVideos();
    
    // In development mode, prepend test videos
    return testVideos.length > 0 ? [...testVideos, ...realMedia] : realMedia;
  }, [allImages]);

  // Determine initial media to display
  const initialMedia = useMemo(() => {
    if (image) {
      if (isVideoUrl(image.url)) {
        return {
          __typename: 'Video' as const,
          id: image.id || image.url,
          url: image.url,
          altText: image.altText || undefined,
          width: image.width || undefined,
          height: image.height || undefined,
        };
      }
      return image;
    }
    return validMedia.length > 0 ? validMedia[0] : null;
  }, [image, validMedia]);

  // Component state
  const [currentDisplayMedia, setCurrentDisplayMedia] = useState<ProcessedMediaFragment | null>(initialMedia);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [useNativeControls, setUseNativeControls] = useState(false);
  
  // Video ref
  const videoRef = useRef<HTMLVideoElement>(null);

  // Update current media when variant image changes
  useEffect(() => {
    if (image) {
      if (isVideoUrl(image.url)) {
        setCurrentDisplayMedia({
          __typename: 'Video',
          id: image.id || image.url,
          url: image.url,
          altText: image.altText || undefined,
          width: image.width || undefined,
          height: image.height || undefined,
        });
      } else {
        setCurrentDisplayMedia(image);
      }
    } else if (validMedia.length > 0) {
      setCurrentDisplayMedia(validMedia[0]);
    }
    
    // Reset video states when media changes
    setIsPlaying(false);
    setIsVideoReady(false);
    setUseNativeControls(false);
  }, [image, validMedia]);

  // Auto-play video when a video is selected
  useEffect(() => {
    if (currentDisplayMedia?.__typename === 'Video' && videoRef.current) {
      const video = videoRef.current;
      // Small delay to ensure video is loaded
      setTimeout(() => {
        video.play().catch(e => {
          console.log('Autoplay blocked by browser, user interaction required');
        });
      }, 100);
    }
  }, [currentDisplayMedia]);

  // Find current media index
  const currentMediaIndex = useMemo(() => {
    if (!currentDisplayMedia || !validMedia.length) return -1;
    return validMedia.findIndex(
      (item) => item?.id === currentDisplayMedia.id || item?.url === currentDisplayMedia.url,
    );
  }, [currentDisplayMedia, validMedia]);

  // Navigation handlers
  const navigateToMedia = useCallback((direction: 'prev' | 'next') => {
    if (validMedia.length === 0) return;
    
    const currentIndex = currentMediaIndex;
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex <= 0 ? validMedia.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex >= validMedia.length - 1 ? 0 : currentIndex + 1;
    }
    
    setCurrentDisplayMedia(validMedia[newIndex]);
    setIsPlaying(false);
    setIsVideoReady(false);
    setUseNativeControls(false);
  }, [currentMediaIndex, validMedia]);

  const handleThumbnailClick = useCallback((media: ProcessedMediaFragment) => {
    setCurrentDisplayMedia(media);
    setIsPlaying(false);
    setIsVideoReady(false);
    setUseNativeControls(false);
  }, []);

  // Video controls - ROBUST APPROACH
  const toggleVideo = useCallback(async () => {
    const video = videoRef.current;
    if (!video) {
      console.warn('Video ref not available');
      return;
    }

    console.log('Toggle video called. Video state:', {
      paused: video.paused,
      readyState: video.readyState,
      networkState: video.networkState,
      currentTime: video.currentTime,
      duration: video.duration
    });

    try {
      if (video.paused) {
        // Force load if needed
        if (video.readyState === 0) {
          console.log('Video not loaded, loading now...');
          video.load();
          await new Promise(resolve => {
            video.addEventListener('loadeddata', resolve, { once: true });
          });
        }
        
        const playPromise = video.play();
        if (playPromise) {
          await playPromise;
          console.log('Video play successful');
          setIsPlaying(true);
        }
      } else {
        video.pause();
        console.log('Video paused');
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Video playback error:', error);
      setIsPlaying(false);
      
      // Try to recover by reloading
      try {
        video.load();
      } catch (loadError) {
        console.error('Video load error:', loadError);
      }
    }
  }, []);

  // Video event handlers - COMPREHENSIVE
  const handleVideoCanPlay = useCallback(() => {
    console.log('Video can play');
    setIsVideoReady(true);
  }, []);

  const handleVideoPlay = useCallback(() => {
    console.log('Video play event fired');
    setIsPlaying(true);
  }, []);

  const handleVideoPause = useCallback(() => {
    console.log('Video pause event fired');
    setIsPlaying(false);
  }, []);

  const handleVideoEnded = useCallback(() => {
    console.log('Video ended');
    setIsPlaying(false);
  }, []);

  const handleVideoError = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    console.error('Video error:', {
      error: video.error,
      networkState: video.networkState,
      readyState: video.readyState,
      src: video.src
    });
    setIsVideoReady(false);
    setIsPlaying(false);
  }, []);

  const handleVideoLoadStart = useCallback(() => {
    console.log('Video load started');
    setIsVideoReady(false);
  }, []);

  const handleVideoLoadedData = useCallback(() => {
    console.log('Video data loaded');
    setIsVideoReady(true);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        navigateToMedia('prev');
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        navigateToMedia('next');
      } else if (event.key === ' ' && currentDisplayMedia?.__typename === 'Video') {
        event.preventDefault();
        toggleVideo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateToMedia, toggleVideo, currentDisplayMedia]);

  // Early return for no media
  if (!currentDisplayMedia && validMedia.length === 0) {
    return (
      <div className="product-image-placeholder w-full h-full bg-neutral-50 rounded-3xl p-8 flex justify-center items-center text-neutral-400">
        No Media Available
      </div>
    );
  }

  const hasMultipleMedia = validMedia.length > 1;
  const isCurrentVideo = currentDisplayMedia?.__typename === 'Video';
  const isTestMode = getTestVideos().length > 0;

  // Render media (image or video)
  const renderMedia = (media: ProcessedMediaFragment, isMain = false) => {
    if (media?.__typename === 'Video') {
      return (
        <div className="relative w-full h-full bg-black rounded-2xl overflow-hidden">
          <video
            ref={isMain ? videoRef : undefined}
            src={media.url}
            className="w-full h-full object-contain"
            controls={useNativeControls}
            muted={true}
            loop
            playsInline
            preload="metadata"
            autoPlay
            crossOrigin="anonymous"
            onCanPlay={isMain ? handleVideoCanPlay : undefined}
            onPlay={isMain ? handleVideoPlay : undefined}
            onPause={isMain ? handleVideoPause : undefined}
            onEnded={isMain ? handleVideoEnded : undefined}
            onError={isMain ? handleVideoError : undefined}
            onLoadStart={isMain ? handleVideoLoadStart : undefined}
            onLoadedData={isMain ? handleVideoLoadedData : undefined}
          />
          {isMain && !useNativeControls && (
            <>
              {/* Play/Pause Button - Hide when playing, show on hover */}
              <button
                onClick={toggleVideo}
                className={`absolute inset-0 flex items-center justify-center bg-transparent hover:bg-black/10 transition-all duration-300 z-10 ${
                  isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'
                }`}
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
              >
                <div className={`w-20 h-20 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
                  isPlaying ? 'scale-90' : 'scale-100 hover:scale-105'
                }`}>
                  {isPlaying ? (
                    <Pause className="h-8 w-8 text-neutral-800" />
                  ) : (
                    <Play className="h-8 w-8 text-neutral-800 ml-1" />
                  )}
                </div>
              </button>
              
              {/* Loading indicator - show when not ready */}
              {!isVideoReady && (
                <div className="absolute top-4 right-4 flex items-center space-x-2 bg-yellow-500/90 text-white text-xs px-3 py-2 rounded-full">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  <span>Loading...</span>
                </div>
              )}
              
              {/* Playing indicator - Only show when playing */}
              {isPlaying && (
                <div className="absolute top-4 right-4 flex items-center space-x-2 bg-green-500/90 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-full animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                  <span>Playing</span>
                </div>
              )}
            </>
          )}
        </div>
      );
    }

    // Handle image type
    if (media && media.url) {
      return (
        <Image
          alt={media.altText || 'Product Image'}
          aspectRatio="1/1"
          data={media as NonNullable<ProductImageFragment>}
          key={media.id || media.url}
          className="w-full h-full object-contain transition-all duration-700 ease-out transform hover:scale-105"
        />
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center text-neutral-400">
        Invalid Media
      </div>
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Test Mode Indicator */}
      {isTestMode && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm px-4 py-2 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="font-medium">Development Mode: Test Videos Active</span>
          </div>
          <span className="text-xs opacity-75">Remove ?test=video from URL to disable</span>
        </div>
      )}

      {/* Main Media Display with Navigation */}
      <div className="relative group">
        <div className="bg-gradient-to-br from-neutral-50 to-neutral-100/50 rounded-3xl p-8 flex justify-center items-center aspect-square">
          {currentDisplayMedia ? (
            renderMedia(currentDisplayMedia, true)
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400">
              No Media
            </div>
          )}
        </div>

        {/* Navigation Arrows */}
        {hasMultipleMedia && (
          <>
            <button
              onClick={() => navigateToMedia('prev')}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-xl rounded-full shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 group-hover:opacity-100 flex items-center justify-center z-10 hover:scale-110 hover:bg-underla-500 hover:text-white"
              aria-label="Previous media"
            >
              <ChevronLeft className="h-6 w-6 transition-colors duration-200" />
            </button>

            <button
              onClick={() => navigateToMedia('next')}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-xl rounded-full shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 group-hover:opacity-100 flex items-center justify-center z-10 hover:scale-110 hover:bg-underla-500 hover:text-white"
              aria-label="Next media"
            >
              <ChevronRight className="h-6 w-6 transition-colors duration-200" />
            </button>
          </>
        )}

        {/* Video indicator */}
        {isCurrentVideo && (
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Video
          </div>
        )}
      </div>

      {/* Media Thumbnails Carousel */}
      {hasMultipleMedia && (
        <div className="w-full">
          <div className="relative px-2 sm:px-6 py-4 overflow-x-auto scrollbar-hide">
            <div 
              className="flex transition-transform duration-500 ease-out space-x-2 sm:space-x-4"
              style={{
                transform: (() => {
                  // Responsive thumbnail sizing and spacing
                  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
                  const thumbnailWidth = isMobile ? 80 : 96; // w-20 vs w-24
                  const spacing = isMobile ? 8 : 16; // space-x-2 vs space-x-4
                  const visibleCount = isMobile ? 4 : 5;
                  
                  if (validMedia.length <= visibleCount) {
                    return 'translateX(0px)';
                  }
                  
                  // Smart scrolling: keep selected item in center when possible
                  const totalWidth = thumbnailWidth + spacing;
                  const maxTranslate = (validMedia.length - visibleCount) * totalWidth;
                  
                  let targetIndex = currentMediaIndex;
                  
                  // If we're near the end, show the last items
                  if (currentMediaIndex >= validMedia.length - Math.ceil(visibleCount / 2)) {
                    return `translateX(-${maxTranslate}px)`;
                  }
                  
                  // If we're near the beginning, show first items
                  if (currentMediaIndex < Math.floor(visibleCount / 2)) {
                    return 'translateX(0px)';
                  }
                  
                  // Otherwise, center the selected item
                  const centerOffset = Math.floor(visibleCount / 2);
                  const translateX = (targetIndex - centerOffset) * totalWidth;
                  return `translateX(-${Math.min(translateX, maxTranslate)}px)`;
                })(),
              }}
            >
              {validMedia.map((media, index) => {
                const isSelected = currentMediaIndex === index;
                const distance = Math.abs(index - currentMediaIndex);
                const isVideo = media?.__typename === 'Video';

                return (
                  <div
                    key={media?.id || media?.url}
                    className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ease-out ${
                      isSelected 
                        ? 'transform scale-110 border-2 border-underla-500 bg-gradient-to-br from-underla-50 to-underla-100 shadow-lg' 
                        : distance <= 2
                        ? 'transform scale-100 border border-neutral-200 opacity-90 hover:opacity-100 hover:scale-105 hover:border-neutral-300 hover:shadow-md'
                        : 'transform scale-95 border border-neutral-100 opacity-70 hover:opacity-90 hover:border-neutral-200'
                    }`}
                    onClick={() => handleThumbnailClick(media)}
                  >
                    {isSelected && (
                      <div className="absolute -inset-1 bg-gradient-to-r from-underla-400 to-underla-600 rounded-xl sm:rounded-2xl opacity-20 blur-sm" />
                    )}
                    
                    {/* Test video badge */}
                    {isTestMode && isVideo && media?.id?.startsWith('test-video') && (
                      <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 sm:px-1.5 py-0.5 rounded-md z-10">
                        TEST
                      </div>
                    )}
                    
                    <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden">
                      {media && (
                        <>
                          {isVideo ? (
                            <div className="relative w-full h-full">
                              <video
                                src={media.url}
                                className="w-full h-full object-cover"
                                muted
                                playsInline
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <Play className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                              </div>
                            </div>
                          ) : (
                            <Image
                              alt={media.altText || 'Product thumbnail'}
                              aspectRatio="1/1"
                              data={media as NonNullable<ProductImageFragment>}
                              className="w-full h-full object-cover transition-transform duration-300"
                            />
                          )}
                          
                          {isSelected && (
                            <>
                              <div className="absolute inset-0 bg-gradient-to-t from-underla-500/20 via-transparent to-transparent" />
                            </>
                          )}
                          {!isSelected && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-transparent to-white/0 hover:from-black/5 transition-all duration-200" />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress Indicator - Responsive */}
          <div className="flex justify-center items-center mt-2 sm:mt-3 space-x-1 sm:space-x-2">
            <div className="flex space-x-1 sm:space-x-2">
              {validMedia.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentDisplayMedia(validMedia[index])}
                  className={`h-1.5 sm:h-2 rounded-full transition-all cursor-pointer duration-300 ${
                    index === currentMediaIndex
                      ? 'bg-underla-500 w-6 sm:w-8'
                      : 'bg-neutral-300 hover:bg-neutral-400 w-1.5 sm:w-2'
                  }`}
                  aria-label={`Go to media ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
