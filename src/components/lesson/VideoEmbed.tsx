import { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoEmbedProps {
  url: string;
  title?: string;
}

export function VideoEmbed({ url, title }: VideoEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Detect if this is a SharePoint embed URL
  const isSharePointEmbed = url.includes('sharepoint.com') && url.includes('embed.aspx');

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoadedData = () => {
    setIsLoading(false);
  };

  if (hasError) {
    return (
      <div className="my-6 w-full max-w-full rounded-lg border bg-muted/30 overflow-hidden">
        <div className="aspect-video flex flex-col items-center justify-center text-muted-foreground p-6">
          <AlertCircle className="h-12 w-12 mb-3 text-destructive" />
          <p className="text-sm font-medium mb-1">Failed to load video</p>
          <p className="text-xs text-center">
            {title || "The video could not be loaded. Please check the URL."}
          </p>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline mt-2"
            >
              Open video in new tab
            </a>
          )}
        </div>
      </div>
    );
  }

  // Render SharePoint iframe
  if (isSharePointEmbed) {
    return (
      <div className="my-6 w-full max-w-full rounded-lg border bg-muted/30 overflow-hidden">
        <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
          <iframe
            src={url}
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            allowFullScreen
            className="absolute inset-0"
            title={title || "Video"}
          />
        </div>
      </div>
    );
  }

  // Render direct video element for .mp4 URLs
  return (
    <div className="my-6 w-full max-w-full rounded-lg border bg-muted/30 overflow-hidden">
      <div className="relative aspect-video bg-black group">
        {/* Video element */}
        <video
          ref={videoRef}
          className="w-full h-full"
          onError={handleError}
          onLoadedData={handleLoadedData}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          <source src={url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-sm">Loading video...</div>
          </div>
        )}

        {/* Controls overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2">
            {/* Play/Pause button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePlayPause}
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" fill="currentColor" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
              )}
            </Button>

            {/* Mute/Unmute button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMuteToggle}
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>

            {/* Title */}
            {title && (
              <span className="text-white text-sm font-medium flex-1 ml-2">
                {title}
              </span>
            )}

            {/* Fullscreen button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFullscreen}
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

