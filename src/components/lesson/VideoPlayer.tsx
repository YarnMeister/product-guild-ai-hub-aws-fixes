import { Play } from "lucide-react";

interface VideoPlayerProps {
  thumbnail?: string;
  title: string;
}

export function VideoPlayer({ thumbnail, title }: VideoPlayerProps) {
  return (
    <div className="relative w-full aspect-video bg-muted rounded-xl overflow-hidden group cursor-pointer">
      {/* Placeholder background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20" />
      
      {/* Play button overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg group-hover:scale-110 transition-transform">
          <Play className="h-8 w-8 ml-1" fill="currentColor" />
        </div>
      </div>
      
      {/* Title overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
        <p className="text-white font-medium">{title}</p>
        <p className="text-white/70 text-sm">Click to play video</p>
      </div>
    </div>
  );
}
