import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MONTHS, POI_ICONS, type ViewMode } from "@/data/travelData";
import { Sun, Moon, DollarSign, Star, ChevronLeft, ChevronRight, Map, Compass, Globe, Layers, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const viewModes = (t: (k: string) => string) => [
  { key: "weather" as ViewMode, label: t("map.weather"), icon: <Sun className="w-4 h-4" />, desc: t("map.weatherDesc") },
  { key: "cost" as ViewMode, label: t("map.cost"), icon: <DollarSign className="w-4 h-4" />, desc: t("map.costDesc") },
  { key: "recommended" as ViewMode, label: t("map.recommended"), icon: <Star className="w-4 h-4" />, desc: t("map.recommendedDesc") },
];

interface MapControlsProps {
  selectedMonth: number;
  onMonthChange: (month: number) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  poiFilters: string[];
  showRegions: boolean;
  onToggleRegions: () => void;
  onTogglePoiFilter: (f: string) => void;
}

export function MapControls({ selectedMonth, onMonthChange, viewMode, onViewModeChange, theme, onToggleTheme, poiFilters, showRegions, onToggleRegions, onTogglePoiFilter }: MapControlsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { t, locale, setLocale } = useTranslation();

  const prevMonth = () => onMonthChange(selectedMonth === 1 ? 12 : selectedMonth - 1);
  const nextMonth = () => onMonthChange(selectedMonth === 12 ? 1 : selectedMonth + 1);

  return (
    <motion.div
      className="absolute top-4 left-4 z-[1000] glass-panel rounded-xl overflow-hidden"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
        <Compass className="w-5 h-5 text-primary" />
        <span className="font-display text-sm font-semibold text-foreground tracking-wide flex items-center gap-2">
          CARAIQBONITO
          <span className="bg-primary/20 text-primary text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">BETA</span>
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setLocale(locale === 'en' ? 'pt' : 'en')}
            className="p-1.5 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            title="Toggle Language"
          >
            <Globe className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase">{locale}</span>
          </button>
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
            title={theme === "dark" ? "Light Mode" : "Dark Mode"}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Map className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Month Selector */}
            <div className="px-4 py-3 border-b border-border/50">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{t("map.travelMonth")}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevMonth}
                  className="p-1.5 rounded-lg bg-secondary/50 hover:bg-secondary text-foreground transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center">
                  <span className="font-display text-lg font-semibold text-primary">
                    {t(`month.${MONTHS[selectedMonth - 1].toLowerCase()}`)}
                  </span>
                </div>
                <button
                  onClick={nextMonth}
                  className="p-1.5 rounded-lg bg-secondary/50 hover:bg-secondary text-foreground transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              {/* Month dots */}
              <div className="flex justify-center gap-1 mt-2">
                {MONTHS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => onMonthChange(i + 1)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${i + 1 === selectedMonth
                      ? "bg-primary scale-150 shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
                      }`}
                  />
                ))}
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="px-4 py-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{t("map.dataLayer")}</p>
              <div className="space-y-1.5">
                {viewModes(t).map((mode) => (
                  <button
                    key={mode.key}
                    onClick={() => onViewModeChange(mode.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${viewMode === mode.key
                      ? "bg-primary/15 text-primary border border-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      }`}
                  >
                    {mode.icon}
                    <div className="text-left">
                      <div className="font-medium">{mode.label}</div>
                      <div className="text-[10px] opacity-60">{mode.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="px-4 py-3 border-t border-border/50">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{t("map.legendTitle")}</p>
              <Legend viewMode={viewMode} t={t} />
            </div>

            {/* Region Visibility */}
            <div className="px-4 py-3 border-t border-border/50">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("map.climateRegions")}</p>
                <button
                  onClick={onToggleRegions}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-colors ${showRegions
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80 border border-transparent"
                    }`}
                >
                  {showRegions ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>{showRegions ? t("map.visible") : t("map.hidden")}</span>
                </button>
              </div>
            </div>

            {/* POI Filters */}
            <div className="px-4 py-3 border-t border-border/50">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{t("map.poi")}</p>
              <div className="flex flex-wrap gap-2">
                {Object.keys(POI_ICONS).map(cat => (
                  <button
                    key={cat}
                    onClick={() => onTogglePoiFilter(cat)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-colors ${poiFilters.includes(cat)
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80 border border-transparent"
                      }`}
                  >
                    <span>{POI_ICONS[cat]}</span>
                    <span>{t(`category.${cat}`)}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Legend({ viewMode, t }: { viewMode: ViewMode; t: (k: string) => string }) {
  const legends: Record<ViewMode, { color: string; label: string }[]> = {
    weather: [
      { color: "bg-green-500", label: t("legend.weather.excellent") },
      { color: "bg-lime-500", label: t("legend.weather.good") },
      { color: "bg-yellow-400", label: t("legend.weather.fair") },
      { color: "bg-orange-500", label: t("legend.weather.poor") },
      { color: "bg-red-500", label: t("legend.weather.avoid") },
    ],
    cost: [
      { color: "bg-green-500", label: t("legend.cost.budget") },
      { color: "bg-yellow-400", label: t("legend.cost.moderate") },
      { color: "bg-red-500", label: t("legend.cost.expensive") },
    ],
    recommended: [
      { color: "bg-emerald-500", label: t("legend.recommended.highly") },
      { color: "bg-amber-500", label: t("legend.recommended.good") },
      { color: "bg-red-500", label: t("legend.recommended.consider_others") },
    ],
  };

  return (
    <div className="flex flex-wrap gap-2">
      {legends[viewMode].map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
          <span className="text-[10px] text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
