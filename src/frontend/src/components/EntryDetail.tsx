import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Entry } from "../backend.d";

interface EntryDetailProps {
  entry: Entry;
  onBack: () => void;
  onDelete: (id: string) => Promise<void>;
  isDeleting: boolean;
}

function formatDateFull(dateBigInt: bigint): string {
  const date = new Date(Number(dateBigInt));
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function EntryDetail({
  entry,
  onBack,
  onDelete,
  isDeleting,
}: EntryDetailProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function handleDelete() {
    await onDelete(entry.id);
    setShowDeleteConfirm(false);
  }

  return (
    <>
      <div className="min-h-screen flex flex-col animate-fade-in">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-body text-sm">Back</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 -mr-2"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span className="font-body text-sm">Delete</span>
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center px-4 sm:px-6 py-8 max-w-3xl mx-auto w-full">
          {/* Photo */}
          <div className="w-full rounded-xl overflow-hidden shadow-photo-lg mb-8">
            <img
              src={entry.photo.getDirectURL()}
              alt={entry.note || "Journal entry"}
              className="w-full object-contain max-h-[60vh] bg-black"
            />
          </div>

          {/* Date */}
          <div className="w-full mb-4">
            <div className="flex items-center gap-2 text-primary/80">
              <Calendar className="w-4 h-4 shrink-0" />
              <time className="font-body text-sm font-medium tracking-wide uppercase">
                {formatDateFull(entry.date)}
              </time>
            </div>
          </div>

          {/* Note */}
          <div className="w-full">
            {entry.note ? (
              <p className="font-body text-base sm:text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {entry.note}
              </p>
            ) : (
              <p className="font-body text-base text-muted-foreground italic">
                No note added.
              </p>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-xl">
              Delete entry?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body text-muted-foreground">
              This will permanently remove this journal entry and its photo.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="font-body"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="font-body bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
