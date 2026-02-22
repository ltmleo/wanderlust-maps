import { motion } from "framer-motion";
import type { POIProperties } from "@/data/travelData";
import { X, Clock, MapPin } from "lucide-react";

interface POIModalProps {
  poi: POIProperties | null;
  onClose: () => void;
}

const categoryLabels: Record<string, string> = {
  landmark: "Historic Landmark",
  nature: "Natural Wonder",
  culture: "Cultural Site",
  beach: "Beach & Coast",
};

const categoryColors: Record<string, string> = {
  landmark: "bg-amber-500/20 text-amber-400",
  nature: "bg-emerald-500/20 text-emerald-400",
  culture: "bg-purple-500/20 text-purple-400",
  beach: "bg-cyan-500/20 text-cyan-400",
};

export function POIModal({ poi, onClose }: POIModalProps) {
  if (!poi) return null;

  return (
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
                {categoryLabels[poi.category]}
              </span>
              <h2 className="font-display text-2xl font-bold text-foreground">{poi.name}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-secondary-foreground leading-relaxed mb-4">{poi.description}</p>

          <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-widest font-semibold">Best Time to Visit</span>
            </div>
            <p className="text-sm text-foreground">{poi.bestTime}</p>
          </div>

          {/* Placeholder image area */}
          <div className="mt-4 rounded-lg bg-secondary/20 border border-dashed border-border/50 h-32 flex items-center justify-center">
            <p className="text-xs text-muted-foreground">📸 Photo gallery — coming soon</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
