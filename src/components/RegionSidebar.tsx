import { motion } from "framer-motion";
import type { RegionProperties } from "@/data/travelData";
import { MONTHS } from "@/data/travelData";
import { X, Thermometer, DollarSign, Star, Sparkles } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface RegionSidebarProps {
  region: RegionProperties | null;
  selectedMonth: number;
  onClose: () => void;
}

export function RegionSidebar({ region, selectedMonth, onClose }: RegionSidebarProps) {
  const { t, locale } = useTranslation();

  if (!region) return null;

  const data = region.monthlyData[selectedMonth];
  if (!data) return null;

  const name = locale === 'pt' && region.namePt ? region.namePt : region.name;
  const description = locale === 'pt' && region.descriptionPt ? region.descriptionPt : region.description;
  const whyVisit = locale === 'pt' && data.whyVisitPt ? data.whyVisitPt : data.whyVisit;
  const weatherDesc = locale === 'pt' && data.weatherDescPt ? data.weatherDescPt : data.weatherDesc;
  const highlights = locale === 'pt' && data.highlightsPt && data.highlightsPt.length > 0 ? data.highlightsPt : data.highlights;

  return (
    <motion.div
      className="absolute top-4 right-4 z-[1000] w-80 max-h-[calc(100vh-6rem)] overflow-y-auto glass-panel rounded-2xl shadow-xl"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Gradient accent */}
      <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary rounded-t-2xl" />

      {/* Header */}
      <div className="px-5 py-4 border-b border-border/30">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-widest text-primary font-semibold mb-1">{region.country}</p>
            <h2 className="font-display text-xl font-bold text-foreground">{name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{description}</p>
      </div>

      {/* Month context */}
      <div className="px-5 py-3 border-b border-border/30 bg-primary/5">
        <p className="text-[9px] uppercase tracking-widest text-primary font-semibold mb-1">
          {t(`month.${MONTHS[selectedMonth - 1].toLowerCase()}`)} — Overview
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed">{whyVisit}</p>
      </div>

      {/* Scores */}
      <div className="px-5 py-4 border-b border-border/30">
        <div className="grid grid-cols-3 gap-2">
          <ScoreCard icon={<Thermometer className="w-4 h-4" />} label={t("map.weather")} score={data.weatherScore} />
          <ScoreCard icon={<DollarSign className="w-4 h-4" />} label={t("map.cost")} score={data.costScore} />
          <ScoreCard icon={<Star className="w-4 h-4" />} label={t("region.score")} score={data.recommendedScore} />
        </div>
      </div>

      {/* Weather */}
      <div className="px-5 py-3 border-b border-border/30">
        <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">{t("map.weather")}</p>
        <p className="text-sm text-foreground/80">{weatherDesc}</p>
      </div>

      {/* Cost */}
      <div className="px-5 py-3 border-b border-border/30">
        <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">{t("map.cost")}</p>
        <p className="text-2xl font-display font-bold text-primary">
          ${data.avgDailyCost}
          <span className="text-xs text-muted-foreground font-body font-normal ml-0.5">/{t("region.day")}</span>
        </p>
      </div>

      {/* Highlights */}
      <div className="px-5 py-4">
        <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold mb-2 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-primary" />
          Highlights
        </p>
        <div className="space-y-1.5">
          {highlights.map((h, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-foreground/80">
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
  const color = score >= 8 ? "text-green-500" : score >= 5 ? "text-yellow-500" : "text-red-500";
  const bg = score >= 8 ? "bg-green-500/10" : score >= 5 ? "bg-yellow-500/10" : "bg-red-500/10";
  return (
    <div className={`text-center p-2 rounded-xl ${bg} border border-border/20`}>
      <div className={`flex justify-center mb-1 ${color}`}>{icon}</div>
      <div className={`text-lg font-bold ${color}`}>{score}</div>
      <div className="text-[9px] text-muted-foreground font-medium">{label}</div>
    </div>
  );
}
