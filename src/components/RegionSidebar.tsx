import { motion } from "framer-motion";
import type { RegionProperties } from "@/data/travelData";
import { MONTHS } from "@/data/travelData";
import { X, Thermometer, DollarSign, Star, Sparkles } from "lucide-react";

interface RegionSidebarProps {
  region: RegionProperties | null;
  selectedMonth: number;
  onClose: () => void;
}

export function RegionSidebar({ region, selectedMonth, onClose }: RegionSidebarProps) {
  if (!region) return null;

  const data = region.monthlyData[selectedMonth];
  if (!data) return null;

  return (
    <motion.div
      className="absolute top-4 right-4 z-[1000] w-80 max-h-[calc(100vh-6rem)] overflow-y-auto glass-panel rounded-xl"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/50">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-primary mb-1">{region.country}</p>
            <h2 className="font-display text-xl font-bold text-foreground">{region.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{region.description}</p>
      </div>

      {/* Month context */}
      <div className="px-5 py-3 border-b border-border/50 bg-primary/5">
        <p className="text-[10px] uppercase tracking-widest text-primary mb-1">
          {MONTHS[selectedMonth - 1]} Overview
        </p>
        <p className="text-sm text-secondary-foreground leading-relaxed">{data.whyVisit}</p>
      </div>

      {/* Scores */}
      <div className="px-5 py-4 border-b border-border/50">
        <div className="grid grid-cols-3 gap-3">
          <ScoreCard icon={<Thermometer className="w-4 h-4" />} label="Weather" score={data.weatherScore} />
          <ScoreCard icon={<DollarSign className="w-4 h-4" />} label="Value" score={data.costScore} />
          <ScoreCard icon={<Star className="w-4 h-4" />} label="Overall" score={data.recommendedScore} />
        </div>
      </div>

      {/* Weather description */}
      <div className="px-5 py-3 border-b border-border/50">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Climate</p>
        <p className="text-sm text-foreground">{data.weatherDesc}</p>
      </div>

      {/* Cost */}
      <div className="px-5 py-3 border-b border-border/50">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Average Daily Cost</p>
        <p className="text-2xl font-display font-bold text-primary">${data.avgDailyCost}<span className="text-xs text-muted-foreground font-body font-normal">/day</span></p>
      </div>

      {/* Highlights */}
      <div className="px-5 py-4">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          <Sparkles className="w-3 h-3 inline mr-1" />
          Highlights
        </p>
        <div className="space-y-1.5">
          {data.highlights.map((h, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-secondary-foreground">
              <div className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
              {h}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ScoreCard({ icon, label, score }: { icon: React.ReactNode; label: string; score: number }) {
  const color = score >= 8 ? "text-green-400" : score >= 5 ? "text-yellow-400" : "text-red-400";
  return (
    <div className="text-center p-2 rounded-lg bg-secondary/30">
      <div className={`flex justify-center mb-1 ${color}`}>{icon}</div>
      <div className={`text-lg font-bold ${color}`}>{score}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
