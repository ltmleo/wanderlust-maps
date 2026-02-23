import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MONTHS, POI_ICONS, type ViewMode } from "@/data/travelData";
import { Sun, Moon, DollarSign, Star, ChevronLeft, ChevronRight, Compass, Globe, Eye, EyeOff, Cloud, PanelLeftClose, PanelLeftOpen } from "lucide-react";
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

  const shortMonths = MONTHS.map((m) => t(`month.${m.toLowerCase()}`).substring(0, 3));

  return (
    <>
    {/* Floating month scroller */}
    <motion.div
      className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] glass-panel rounded-full px-1.5 py-1 shadow-lg flex items-center gap-1"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <button onClick={prevMonth} className="p-1 rounded-full hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>
      <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hidden">
        {shortMonths.map((m, i) => (
          <button
            key={i}
            onClick={() => onMonthChange(i + 1)}
            className={`text-[10px] px-2 py-1 rounded-full font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
              i + 1 === selectedMonth
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
      <button onClick={nextMonth} className="p-1 rounded-full hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </motion.div>

    <motion.div
      className="absolute top-4 left-4 z-[1000] glass-panel rounded-2xl overflow-hidden shadow-xl"
      style={{ maxWidth: isExpanded ? 280 : 52 }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/30">
        {isExpanded && (
          <motion.div className="flex items-center gap-2 flex-1 min-w-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Compass className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="font-display text-xs font-semibold text-foreground tracking-wide truncate">
              CARAIQBONITO
            </span>
            <span className="bg-primary/20 text-primary text-[8px] px-1 py-0.5 rounded uppercase font-bold tracking-wider flex-shrink-0">BETA</span>
          </motion.div>
        )}
        <div className={`flex items-center gap-0.5 ${!isExpanded ? 'flex-col' : 'ml-auto'}`}>
          {isExpanded && (
            <>
              <button
                onClick={() => setLocale(locale === 'en' ? 'pt' : 'en')}
                className="p-1.5 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
                title="Toggle Language"
              >
                <Globe className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onToggleTheme}
                className="p-1.5 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
                title={theme === "dark" ? "Light Mode" : "Dark Mode"}
              >
                {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            </>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            {isExpanded ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
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
            className="overflow-hidden"
          >
            {/* Month Selector - Grid style */}
            <div className="px-3 py-3 border-b border-border/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">{t("map.travelMonth")}</p>
                <div className="flex items-center gap-1">
                  <button onClick={prevMonth} className="p-1 rounded-md hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-display text-sm font-bold text-primary min-w-[80px] text-center">
                    {t(`month.${MONTHS[selectedMonth - 1].toLowerCase()}`)}
                  </span>
                  <button onClick={nextMonth} className="p-1 rounded-md hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {/* Month grid */}
              <div className="grid grid-cols-6 gap-1">
                {shortMonths.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => onMonthChange(i + 1)}
                    className={`text-[10px] py-1 rounded-md font-medium transition-all duration-200 ${
                      i + 1 === selectedMonth
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="px-3 py-3 border-b border-border/30">
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">{t("map.dataLayer")}</p>
              <div className="space-y-1">
                {viewModes(t).map((mode) => (
                  <button
                    key={mode.key}
                    onClick={() => onViewModeChange(mode.key)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-all duration-200 ${
                      viewMode === mode.key
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                    }`}
                  >
                    {mode.icon}
                    <div className="text-left">
                      <div className="font-medium leading-tight">{mode.label}</div>
                      <div className="text-[9px] opacity-60 leading-tight">{mode.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="px-3 py-2.5 border-b border-border/30">
              <Legend viewMode={viewMode} t={t} />
            </div>

            {/* Region Visibility & POI Filters combined */}
            <div className="px-3 py-2.5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">{t("map.climateRegions")}</p>
                <button
                  onClick={onToggleRegions}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] transition-colors ${
                    showRegions
                      ? "bg-primary/20 text-primary"
                      : "bg-secondary/50 text-muted-foreground"
                  }`}
                >
                  {showRegions ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>{showRegions ? t("map.visible") : t("map.hidden")}</span>
                </button>
              </div>

              <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold mb-1.5 mt-2">{t("map.poi")}</p>
              <div className="flex flex-wrap gap-1">
                {Object.keys(POI_ICONS).map(cat => (
                  <button
                    key={cat}
                    onClick={() => onTogglePoiFilter(cat)}
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] transition-colors ${
                      poiFilters.includes(cat)
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "bg-secondary/40 text-muted-foreground hover:bg-secondary/60 border border-transparent"
                    }`}
                  >
                    <span className="text-xs">{POI_ICONS[cat]}</span>
                    <span>{t(`category.${cat}`)}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
    </>
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
    <div className="flex flex-wrap gap-x-3 gap-y-1">
      {legends[viewMode].map((item) => (
        <div key={item.label} className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${item.color}`} />
          <span className="text-[9px] text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
