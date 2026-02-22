import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MONTHS, type ViewMode } from "@/data/travelData";
import { Sun, DollarSign, Star, ChevronLeft, ChevronRight, Map, Compass } from "lucide-react";

const viewModes: { key: ViewMode; label: string; icon: React.ReactNode; desc: string }[] = [
  { key: "weather", label: "Weather", icon: <Sun className="w-4 h-4" />, desc: "Climate & vibe" },
  { key: "cost", label: "Cost", icon: <DollarSign className="w-4 h-4" />, desc: "Budget guide" },
  { key: "recommended", label: "Top Picks", icon: <Star className="w-4 h-4" />, desc: "Best overall" },
];

interface MapControlsProps {
  selectedMonth: number;
  onMonthChange: (month: number) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function MapControls({ selectedMonth, onMonthChange, viewMode, onViewModeChange }: MapControlsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

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
        <span className="font-display text-sm font-semibold text-foreground tracking-wide">WANDERLUST</span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
        >
          <Map className="w-4 h-4" />
        </button>
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
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Travel Month</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevMonth}
                  className="p-1.5 rounded-lg bg-secondary/50 hover:bg-secondary text-foreground transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center">
                  <span className="font-display text-lg font-semibold text-primary">
                    {MONTHS[selectedMonth - 1]}
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
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      i + 1 === selectedMonth
                        ? "bg-primary scale-125"
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="px-4 py-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Data Layer</p>
              <div className="space-y-1.5">
                {viewModes.map((mode) => (
                  <button
                    key={mode.key}
                    onClick={() => onViewModeChange(mode.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      viewMode === mode.key
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
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Legend</p>
              <Legend viewMode={viewMode} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Legend({ viewMode }: { viewMode: ViewMode }) {
  const legends: Record<ViewMode, { color: string; label: string }[]> = {
    weather: [
      { color: "bg-green-500", label: "Excellent" },
      { color: "bg-lime-500", label: "Good" },
      { color: "bg-yellow-400", label: "Fair" },
      { color: "bg-orange-500", label: "Poor" },
      { color: "bg-red-500", label: "Avoid" },
    ],
    cost: [
      { color: "bg-green-500", label: "Budget-friendly" },
      { color: "bg-yellow-400", label: "Moderate" },
      { color: "bg-red-500", label: "Expensive" },
    ],
    recommended: [
      { color: "bg-primary", label: "Highly Recommended" },
      { color: "bg-accent", label: "Good Option" },
      { color: "bg-muted", label: "Consider Others" },
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
