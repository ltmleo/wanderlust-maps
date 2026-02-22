import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { POIProperties } from "@/data/travelData";
import { X, Clock, MapPin } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface POIModalProps {
  poi: POIProperties | null;
  onClose: () => void;
}

const categoryLabels = (t: (k: string) => string): Record<string, string> => ({
  landmark: t("category.landmark"),
  nature: t("category.nature"),
  culture: t("category.culture"),
  beach: t("category.beach"),
  city: t("category.city"),
  wonder: t("category.wonder")
});

const categoryColors: Record<string, string> = {
  landmark: "bg-amber-500/20 text-amber-400",
  nature: "bg-emerald-500/20 text-emerald-400",
  culture: "bg-purple-500/20 text-purple-400",
  beach: "bg-cyan-500/20 text-cyan-400",
};

export function POIModal({ poi, onClose }: POIModalProps) {
  const { t, locale } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!poi) return null;

  const name = locale === 'pt' && poi.namePt ? poi.namePt : poi.name;
  const description = locale === 'pt' && poi.descriptionPt ? poi.descriptionPt : poi.description;
  const bestTime = locale === 'pt' && poi.bestTimePt ? poi.bestTimePt : poi.bestTime;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          className="relative glass-panel rounded-2xl w-full max-w-md overflow-hidden"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Gradient header bar */}
          <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary" />

          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium mb-2 ${categoryColors[poi.category]}`}>
                  <MapPin className="w-3 h-3" />
                  {categoryLabels(t)[poi.category]}
                </span>
                <h2 className="font-display text-2xl font-bold text-foreground">{name}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-secondary-foreground leading-relaxed mb-4">{description}</p>

            <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
              <div className="flex items-center gap-2 text-primary mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-widest font-semibold">{t("poi.bestTime")}</span>
              </div>
              <p className="text-sm text-foreground">{bestTime}</p>
            </div>

            {/* Primary image */}
            {poi.imageUrl && (
              <div
                className="mt-4 rounded-lg overflow-hidden h-40 cursor-pointer"
                onClick={() => setSelectedImage(poi.imageUrl!)}
              >
                <img src={poi.imageUrl} alt={name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
              </div>
            )}

            {/* Image Gallery */}
            {poi.imageGallery && poi.imageGallery.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-2 text-foreground">{t("poi.gallery")}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {poi.imageGallery.map((imgUrl, i) => (
                    <div
                      key={i}
                      className="rounded-lg overflow-hidden h-24 cursor-pointer"
                      onClick={() => setSelectedImage(imgUrl)}
                    >
                      <img src={imgUrl} alt={`${name} gallery ${i}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!poi.imageUrl && (!poi.imageGallery || poi.imageGallery.length === 0)) && (
              <div className="mt-4 rounded-lg bg-secondary/20 border border-dashed border-border/50 h-32 flex items-center justify-center">
                <p className="text-xs text-muted-foreground">{t("poi.noPhotos")}</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Lightbox / Full screen image */}
      {selectedImage && (
        <motion.div
          className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={selectedImage}
            alt="Fullscreen view"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
