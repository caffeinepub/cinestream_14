import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface TrailerModalProps {
  trailerKey: string | null;
  onClose: () => void;
}

export default function TrailerModal({
  trailerKey,
  onClose,
}: TrailerModalProps) {
  return (
    <Dialog
      open={trailerKey !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        aria-label="Movie Trailer"
        showCloseButton={false}
        className="max-w-3xl w-full p-0 overflow-hidden bg-black border-border"
        data-ocid="trailer.dialog"
      >
        <div className="relative w-full">
          <button
            type="button"
            data-ocid="trailer.close_button"
            onClick={onClose}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          {trailerKey ? (
            <div
              className="w-full"
              style={{ paddingBottom: "56.25%", position: "relative" }}
            >
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
                title="Movie Trailer"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: 0,
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-white text-lg">
              Trailer not available
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
