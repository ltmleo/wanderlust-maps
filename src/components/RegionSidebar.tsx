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
  const { t, locale, formatCurrency } = useTranslation();

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
      className="absolute top-14 sm:top-4 right-2 sm:right-4 z-[1000] w-[calc(100vw-1rem)] sm:w-80 max-h-[calc(100vh-5rem)] sm:max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-hidden glass-panel rounded-2xl shadow-xl"
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      {/* Gradient accent */}
      <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-primary rounded-t-2xl" />

      {/* Header */}
      <div className="px-5 py-4 border-b border-border/30">
        <div className="flex items-start justify-between">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-[9px] uppercase tracking-widest text-primary font-semibold mb-1">{region.country}</p>
            <h2 className="font-display text-xl font-bold text-foreground">{name}</h2>
          </motion.div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-all hover:rotate-90 duration-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{description}</p>
      </div>

      {/* Month context */}
      <motion.div
        className="px-5 py-3 border-b border-border/30 bg-primary/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <p className="text-[9px] uppercase tracking-widest text-primary font-semibold mb-1">
          {t(`month.${MONTHS[selectedMonth - 1].toLowerCase()}`)} — Overview
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed">{whyVisit}</p>
      </motion.div>

      {/* Scores */}
      <motion.div
        className="px-5 py-4 border-b border-border/30"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="grid grid-cols-3 gap-2">
          <ScoreCard icon={<Thermometer className="w-4 h-4" />} label={t("map.weather")} score={data.weatherScore} />
          <ScoreCard icon={<DollarSign className="w-4 h-4" />} label={t("map.cost")} score={data.costScore} />
          <ScoreCard icon={<Star className="w-4 h-4" />} label={t("region.score")} score={data.recommendedScore} />
        </div>
      </motion.div>

      {/* Weather */}
      <div className="px-5 py-3 border-b border-border/30">
        <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">{t("map.weather")}</p>
        <p className="text-sm text-foreground/80">{weatherDesc}</p>
      </div>

      {/* Cost */}
      <div className="px-5 py-3 border-b border-border/30">
        <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">{t("map.cost")}</p>
        <p className="text-2xl font-display font-bold text-primary">
          {formatCurrency(data.avgDailyCost)}
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
            <motion.div
              key={i}
              className="flex items-center gap-2 text-sm text-foreground/80"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.05 }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              {h}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ScoreCard({ icon, label, score }: { icon: React.ReactNode; label: string; score: number }) {
  const color = score >= 8 ? "text-green-500" : score >= 5 ? "text-yellow-500" : "text-red-500";
  const bg = score >= 8 ? "bg-green-500/10" : score >= 5 ? "bg-yellow-500/10" : "bg-red-500/10";
  const ring = score >= 8 ? "ring-green-500/20" : score >= 5 ? "ring-yellow-500/20" : "ring-red-500/20";
  return (
    <motion.div
      className={`text-center p-2.5 rounded-xl ${bg} ring-1 ${ring}`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      <div className={`flex justify-center mb-1 ${color}`}>{icon}</div>
      <div className={`text-lg font-bold ${color}`}>{score}</div>
      <div className="text-[9px] text-muted-foreground font-medium">{label}</div>
    </motion.div>
  );
}
