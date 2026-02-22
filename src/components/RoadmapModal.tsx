import { motion } from "framer-motion";
import { Rocket, Plane, Hotel, Cloud, Users } from "lucide-react";

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
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative glass-panel rounded-2xl w-full max-w-lg overflow-hidden"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary" />
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/15 text-primary">
              <Rocket className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">Future Roadmap</h2>
              <p className="text-xs text-muted-foreground">What's coming next to Wanderlust</p>
            </div>
          </div>

          <div className="space-y-4">
            {roadmapItems.map((item, i) => (
              <motion.div
                key={i}
                className="flex gap-3 p-3 rounded-lg bg-secondary/20 border border-border/30"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary h-fit">{item.icon}</div>
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

          <button
            onClick={onClose}
            className="mt-6 w-full py-2.5 rounded-lg bg-secondary/50 hover:bg-secondary text-sm text-foreground transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
