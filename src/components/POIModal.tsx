import { useState } from "react";
import { motion } from "framer-motion";
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
    <>
      <motion.div
        className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-background/60 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
        <motion.div
          className="relative glass-panel rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto scrollbar-hidden"
          initial={{ scale: 0.9, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 30, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Gradient header bar */}
          <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-primary rounded-t-2xl" />

          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium mb-2 ${categoryColors[poi.category] || "bg-primary/20 text-primary"}`}>
                  <MapPin className="w-3 h-3" />
                  {categoryLabels(t)[poi.category] || poi.category}
                </span>
                <h2 className="font-display text-2xl font-bold text-foreground">{name}</h2>
              </motion.div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-all hover:rotate-90 duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <motion.p
              className="text-sm text-muted-foreground leading-relaxed mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {description}
            </motion.p>

            <motion.div
              className="p-3 rounded-xl bg-primary/5 border border-primary/15"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <div className="flex items-center gap-2 text-primary mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-widest font-semibold">{t("poi.bestTime")}</span>
              </div>
              <p className="text-sm text-foreground">{bestTime}</p>
            </motion.div>

            {/* Primary image */}
            {poi.imageUrl && (
              <motion.div
                className="mt-4 rounded-xl overflow-hidden h-40 cursor-pointer group"
                onClick={() => setSelectedImage(poi.imageUrl!)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <img src={poi.imageUrl} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </motion.div>
            )}

            {/* Image Gallery */}
            {poi.imageGallery && poi.imageGallery.length > 0 && (
              <motion.div
                className="mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
              >
                <h3 className="text-sm font-semibold mb-2 text-foreground">{t("poi.gallery")}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {poi.imageGallery.map((imgUrl, i) => (
                    <div
                      key={i}
                      className="rounded-xl overflow-hidden h-24 cursor-pointer group"
                      onClick={() => setSelectedImage(imgUrl)}
                    >
                      <img src={imgUrl} alt={`${name} gallery ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {(!poi.imageUrl && (!poi.imageGallery || poi.imageGallery.length === 0)) && (
              <div className="mt-4 rounded-xl bg-secondary/20 border border-dashed border-border/50 h-32 flex items-center justify-center">
                <p className="text-xs text-muted-foreground">{t("poi.noPhotos")}</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Lightbox */}
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
    </>
  );
}
