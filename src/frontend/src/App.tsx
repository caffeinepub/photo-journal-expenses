import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { BookImage, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Entry } from "./backend.d";
import { AddEntryModal } from "./components/AddEntryModal";
import { EntryDetail } from "./components/EntryDetail";
import { GalleryGrid } from "./components/GalleryGrid";
import { PinLock } from "./components/PinLock";
import {
  useAddEntry,
  useDeleteEntry,
  useListEntries,
} from "./hooks/useQueries";

type View = "gallery" | "detail";

export default function App() {
  const [locked, setLocked] = useState(true);
  const [view, setView] = useState<View>("gallery");
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const { data: entries = [], isLoading } = useListEntries();
  const addEntry = useAddEntry();
  const deleteEntry = useDeleteEntry();

  function handleEntryClick(entry: Entry) {
    setSelectedEntry(entry);
    setView("detail");
  }

  function handleBackToGallery() {
    setView("gallery");
    setSelectedEntry(null);
  }

  async function handleSaveEntry(data: {
    date: bigint;
    note: string;
    photoBytes: Uint8Array<ArrayBuffer>;
    onProgress: (pct: number) => void;
  }) {
    const id = crypto.randomUUID();
    try {
      await addEntry.mutateAsync({
        id,
        date: data.date,
        note: data.note,
        photoBytes: data.photoBytes,
        onProgress: data.onProgress,
      });
      setAddModalOpen(false);
      toast.success("Entry saved");
    } catch {
      toast.error("Failed to save entry");
    }
  }

  async function handleDeleteEntry(id: string) {
    try {
      await deleteEntry.mutateAsync(id);
      setView("gallery");
      setSelectedEntry(null);
      toast.success("Entry deleted");
    } catch {
      toast.error("Failed to delete entry");
    }
  }

  const currentYear = new Date().getFullYear();
  const caffeineLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  if (locked) {
    return (
      <>
        <Toaster theme="dark" />
        <PinLock onUnlock={() => setLocked(false)} />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Toaster theme="dark" />

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
              <BookImage className="w-4 h-4 text-primary" strokeWidth={1.5} />
            </div>
            <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">
              Photo Journal
            </h1>
          </div>

          <Button
            onClick={() => setAddModalOpen(true)}
            className="gap-2 font-body bg-primary text-primary-foreground hover:bg-primary/90 shadow-photo"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Entry</span>
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        {view === "gallery" ? (
          <div className="animate-fade-in">
            {/* Gallery heading */}
            <div className="mb-6 flex items-baseline justify-between">
              <div>
                <h2 className="font-display text-3xl font-semibold text-foreground">
                  Your Moments
                </h2>
                {!isLoading && entries.length > 0 && (
                  <p className="font-body text-sm text-muted-foreground mt-1">
                    {entries.length}{" "}
                    {entries.length === 1 ? "entry" : "entries"}
                  </p>
                )}
              </div>
            </div>

            {/* Loading skeleton */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {Array.from({ length: 8 }, (_, i) => `skeleton-${i}`).map(
                  (key, i) => (
                    <Skeleton
                      key={key}
                      className="aspect-square rounded-lg bg-muted/50"
                      style={{ animationDelay: `${i * 60}ms` }}
                    />
                  ),
                )}
              </div>
            ) : (
              <GalleryGrid entries={entries} onEntryClick={handleEntryClick} />
            )}
          </div>
        ) : selectedEntry ? (
          <EntryDetail
            key={selectedEntry.id}
            entry={selectedEntry}
            onBack={handleBackToGallery}
            onDelete={handleDeleteEntry}
            isDeleting={deleteEntry.isPending}
          />
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 text-center">
          <p className="font-body text-xs text-muted-foreground">
            © {currentYear}. Built with{" "}
            <span className="text-destructive/80">♥</span> using{" "}
            <a
              href={caffeineLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary/70 hover:text-primary transition-colors underline underline-offset-2"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      {/* Add Entry Modal */}
      <AddEntryModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleSaveEntry}
        isSaving={addEntry.isPending}
      />
    </div>
  );
}
