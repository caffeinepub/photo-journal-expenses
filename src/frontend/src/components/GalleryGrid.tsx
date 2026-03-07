import { Calendar, FileImage } from "lucide-react";
import type { Entry } from "../backend.d";

interface GalleryGridProps {
  entries: Entry[];
  onEntryClick: (entry: Entry) => void;
}

function formatDate(dateBigInt: bigint): string {
  const date = new Date(Number(dateBigInt));
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function GalleryGrid({ entries, onEntryClick }: GalleryGridProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-6 text-center animate-fade-in">
        <div className="mb-6 w-20 h-20 rounded-full bg-muted/60 flex items-center justify-center">
          <FileImage
            className="w-9 h-9 text-muted-foreground"
            strokeWidth={1.2}
          />
        </div>
        <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
          No moments yet
        </h2>
        <p className="text-muted-foreground text-base max-w-xs leading-relaxed font-body">
          Start capturing your story. Add your first photo entry and it will
          appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {entries.map((entry, idx) => (
        <button
          type="button"
          key={entry.id}
          onClick={() => onEntryClick(entry)}
          className="group relative overflow-hidden rounded-lg aspect-square bg-card shadow-photo cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background text-left animate-fade-in"
          style={{ animationDelay: `${idx * 60}ms`, animationFillMode: "both" }}
        >
          {/* Photo */}
          <img
            src={entry.photo.getDirectURL()}
            alt={entry.note || "Journal entry"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Hover info */}
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className="w-3 h-3 text-primary/90 shrink-0" />
              <span className="text-[11px] text-primary/90 font-body font-medium tracking-wide">
                {formatDate(entry.date)}
              </span>
            </div>
            {entry.note && (
              <p className="text-xs text-foreground/80 font-body line-clamp-2 leading-relaxed">
                {entry.note}
              </p>
            )}
          </div>

          {/* Always-visible date strip */}
          <div className="absolute bottom-0 left-0 right-0 p-2 group-hover:opacity-0 transition-opacity duration-200">
            <div className="text-[10px] text-white/70 font-body font-medium bg-black/50 backdrop-blur-sm rounded px-2 py-1 inline-flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5 shrink-0" />
              {formatDate(entry.date)}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
