import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Camera,
  CameraOff,
  Check,
  ImagePlus,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCamera } from "../camera/useCamera";

function useLiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function formatDateTime(date: Date) {
  const d = date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const t = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return { d, t };
}

interface AddEntryModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    date: bigint;
    note: string;
    photoBytes: Uint8Array<ArrayBuffer>;
    onProgress: (pct: number) => void;
  }) => Promise<void>;
  isSaving: boolean;
}

type PhotoMode = "idle" | "camera";

export function AddEntryModal({
  open,
  onClose,
  onSave,
  isSaving,
}: AddEntryModalProps) {
  const liveClock = useLiveClock();
  const today = new Date().toISOString().split("T")[0];
  const [dateStr, setDateStr] = useState(today);
  const [note, setNote] = useState("");
  const [photoMode, setPhotoMode] = useState<PhotoMode>("idle");
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [capturedPreviewUrl, setCapturedPreviewUrl] = useState<string | null>(
    null,
  );
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isActive,
    isSupported,
    error: cameraError,
    isLoading: cameraLoading,
    startCamera,
    stopCamera,
    capturePhoto,
    videoRef,
    canvasRef,
  } = useCamera({
    facingMode: "environment",
    quality: 0.92,
    format: "image/jpeg",
  });

  const handleOpenCamera = useCallback(async () => {
    setPhotoMode("camera");
    await startCamera();
  }, [startCamera]);

  const handleCapturePhoto = useCallback(async () => {
    const file = await capturePhoto();
    if (file) {
      setCapturedFile(file);
      const url = URL.createObjectURL(file);
      setCapturedPreviewUrl(url);
      await stopCamera();
      setPhotoMode("idle");
    }
  }, [capturePhoto, stopCamera]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setCapturedFile(file);
      const url = URL.createObjectURL(file);
      setCapturedPreviewUrl(url);
      setPhotoMode("idle");
    },
    [],
  );

  const handleRemovePhoto = useCallback(() => {
    if (capturedPreviewUrl) {
      URL.revokeObjectURL(capturedPreviewUrl);
    }
    setCapturedFile(null);
    setCapturedPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [capturedPreviewUrl]);

  const handleCancelCamera = useCallback(async () => {
    await stopCamera();
    setPhotoMode("idle");
  }, [stopCamera]);

  const handleSave = useCallback(async () => {
    if (!capturedFile) return;
    const arrayBuffer = await capturedFile.arrayBuffer();
    const photoBytes = new Uint8Array(arrayBuffer) as Uint8Array<ArrayBuffer>;
    const date = BigInt(new Date(dateStr).getTime());
    await onSave({
      date,
      note,
      photoBytes,
      onProgress: (pct) => setUploadProgress(pct),
    });
  }, [capturedFile, dateStr, note, onSave]);

  function handleClose() {
    if (isSaving) return;
    if (capturedPreviewUrl) URL.revokeObjectURL(capturedPreviewUrl);
    setCapturedFile(null);
    setCapturedPreviewUrl(null);
    setNote("");
    setDateStr(today);
    setPhotoMode("idle");
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
    void stopCamera();
    onClose();
  }

  const canSave = !!capturedFile && !isSaving;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) handleClose();
      }}
    >
      <DialogContent className="bg-card border-border max-w-lg w-full max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="font-display text-2xl text-foreground">
            New Entry
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 pt-4 space-y-5">
          {/* Photo section */}
          <div className="space-y-2">
            <Label className="font-body text-sm text-muted-foreground uppercase tracking-wider">
              Photo
            </Label>

            {/* Camera preview */}
            {photoMode === "camera" && (
              <div
                className="relative rounded-lg overflow-hidden bg-black"
                style={{ aspectRatio: "4/3" }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Camera error */}
                {cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-4 text-center">
                    <CameraOff className="w-8 h-8 text-destructive mb-2" />
                    <p className="font-body text-sm text-foreground/80">
                      {cameraError.message}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3"
                      onClick={handleCancelCamera}
                    >
                      Go back
                    </Button>
                  </div>
                )}

                {/* Loading overlay */}
                {cameraLoading && !cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                )}

                {/* Camera controls */}
                {!cameraError && (
                  <div className="absolute bottom-0 inset-x-0 p-4 flex items-center justify-center gap-4 bg-gradient-to-t from-black/60 to-transparent">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancelCamera}
                      className="text-white/70 hover:text-white hover:bg-white/10"
                      disabled={cameraLoading}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      size="lg"
                      onClick={handleCapturePhoto}
                      disabled={!isActive || cameraLoading}
                      className="rounded-full w-14 h-14 bg-white hover:bg-white/90 text-black p-0 shadow-lg"
                    >
                      <Camera className="w-6 h-6" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Photo preview */}
            {photoMode !== "camera" && capturedPreviewUrl && (
              <div
                className="relative rounded-lg overflow-hidden bg-black"
                style={{ aspectRatio: "4/3" }}
              >
                <img
                  src={capturedPreviewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
                {/* Date/time stamp overlay */}
                <div className="absolute bottom-3 left-3 px-2.5 py-1.5 rounded-md bg-black/60 backdrop-blur-sm text-white leading-tight select-none pointer-events-none">
                  {(() => {
                    const { d, t } = formatDateTime(liveClock);
                    return (
                      <>
                        <div className="text-xs font-semibold tracking-wide">
                          {t}
                        </div>
                        <div className="text-[11px] opacity-80">{d}</div>
                      </>
                    );
                  })()}
                </div>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={isSaving}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
                  aria-label="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Idle / choose mode */}
            {photoMode !== "camera" && !capturedPreviewUrl && (
              <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-8 flex flex-col items-center gap-4">
                <ImagePlus
                  className="w-10 h-10 text-muted-foreground"
                  strokeWidth={1.2}
                />
                <p className="font-body text-sm text-muted-foreground text-center">
                  Take a photo or upload from your device
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                  {isSupported !== false && (
                    <Button
                      variant="outline"
                      className="flex-1 gap-2 font-body"
                      onClick={handleOpenCamera}
                    >
                      <Camera className="w-4 h-4" />
                      Camera
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 font-body"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4" />
                    Upload
                  </Button>
                </div>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label
              htmlFor="entry-date"
              className="font-body text-sm text-muted-foreground uppercase tracking-wider"
            >
              Date
            </Label>
            <Input
              id="entry-date"
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="font-body bg-input border-border text-foreground"
              disabled={isSaving}
            />
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label
              htmlFor="entry-note"
              className="font-body text-sm text-muted-foreground uppercase tracking-wider"
            >
              Note
            </Label>
            <Textarea
              id="entry-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write something about this moment…"
              rows={4}
              className="font-body bg-input border-border text-foreground resize-none placeholder:text-muted-foreground/60"
              disabled={isSaving}
            />
          </div>

          {/* Upload progress */}
          {isSaving && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-body text-muted-foreground">
                <span>Uploading…</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-200 ease-linear"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 font-body"
              onClick={handleClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 font-body gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleSave}
              disabled={!canSave}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Entry
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
