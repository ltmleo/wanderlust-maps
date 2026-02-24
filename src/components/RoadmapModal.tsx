import { motion } from "framer-motion";
import { Rocket, Plane, Hotel, Cloud, Users, X } from "lucide-react";

interface RoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const roadmapItems = [
  {
    icon: <Plane className="w-5 h-5" />,
    title: "Google Flights Integration",
    description: "Real-time flight prices from your nearest airport to each destination. Compare airlines and find the best deals.",
    status: "Planned",
  },
  {
    icon: <Hotel className="w-5 h-5" />,
    title: "Hotel & Accommodation APIs",
    description: "Live rates from Booking.com and Expedia integrated directly into each region's panel. Filter by budget and style.",
    status: "Planned",
  },
  {
    icon: <Cloud className="w-5 h-5" />,
    title: "Live Weather Forecasting",
    description: "Real-time weather data replacing our static seasonal averages. 14-day forecasts for precise trip planning.",
    status: "Planned",
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Community & Reviews",
    description: "User-submitted reviews, itineraries, and crowd-sourced recommendations. Share your travel stories and tips.",
    status: "Planned",
  },
];

export function RoadmapModal({ isOpen, onClose }: RoadmapModalProps) {
  if (!isOpen) return null;

  return (
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
      />
      <motion.div
        className="relative glass-panel rounded-2xl w-full max-w-lg overflow-hidden"
        initial={{ scale: 0.9, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 30, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-primary rounded-t-2xl" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/15 text-primary">
                <Rocket className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">Future Roadmap</h2>
                <p className="text-xs text-muted-foreground">What's coming next to Caraiqbonito</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-all hover:rotate-90 duration-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            {roadmapItems.map((item, i) => (
              <motion.div
                key={i}
                className="flex gap-3 p-3.5 rounded-xl bg-secondary/15 border border-border/20 hover:bg-secondary/25 transition-colors"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08, type: "spring", damping: 20 }}
              >
                <div className="p-2 rounded-xl bg-primary/10 text-primary h-fit">{item.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider bg-primary/15 text-primary font-medium">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
