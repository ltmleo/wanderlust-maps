import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { RegionProperties } from "@/data/travelData";
import { MONTHS } from "@/data/travelData";
import { X, Thermometer, DollarSign, Star, Sparkles, MapPin, Calendar, Plus, Send, Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface RegionSidebarProps {
  region: RegionProperties | null;
  selectedMonth: number;
  onClose: () => void;
}

export function RegionSidebar({ region, selectedMonth, onClose }: RegionSidebarProps) {
  const { t, locale, formatCurrency } = useTranslation();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"overview" | "trips">("overview");

  // Trips State
  const [trips, setTrips] = useState<any[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setActiveTab("overview");
  }, [region?.id]);

  useEffect(() => {
    if (region && activeTab === "trips") {
      fetchTrips();
    }
  }, [region, activeTab]);

  const fetchTrips = async () => {
    if (!region) return;
    try {
      setLoadingTrips(true);
      const { data, error } = await supabase
        .from("user_trips")
        .select(`
          id, start_date, end_date,
          user_id,
          profiles ( full_name, nickname, avatar_url )
        `)
        .eq("region_id", region.id)
        .order("start_date", { ascending: false });

      if (error) {
        console.warn("Could not fetch trip profiles via join, fallback to manual fetch", error);
        const { data: trps } = await supabase.from('user_trips').select('id, start_date, end_date, user_id').eq('region_id', region.id).order("start_date", { ascending: false });
        if (!trps) {
          setTrips([]);
          return;
        }
        const userIds = [...new Set(trps.map((t: any) => t.user_id))];
        const { data: profs } = await supabase.from('profiles').select('id, full_name, nickname, avatar_url').in('id', userIds);
        const profMap = new Map((profs || []).map(p => [p.id, p]));
        setTrips(trps.map((t: any) => ({ ...t, profiles: profMap.get(t.user_id) })) as any);
      } else {
        setTrips(data || []);
      }
    } catch (err) {
      console.error("Error fetching trips:", err);
    } finally {
      setLoadingTrips(false);
    }
  };

  const handleLogTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to log a trip.");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Please fill all dates.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error("End date cannot be before start date.");
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase.from("user_trips").insert({
        user_id: user.id,
        region_id: region!.id,
        start_date: startDate,
        end_date: endDate,
      });

      if (error) throw error;

      toast.success("Trip logged successfully!");
      setStartDate("");
      setEndDate("");
      fetchTrips();
    } catch (err: any) {
      console.error("Error logging trip:", err);
      toast.error(err.message || "Failed to log trip.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "en-US", {
      month: "short",
      year: "numeric"
    }).format(new Date(dateString));
  };

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
      className="absolute top-14 sm:top-4 right-2 sm:right-4 z-[1000] w-[calc(100vw-1rem)] sm:w-80 max-h-[calc(100vh-5rem)] sm:max-h-[calc(100vh-6rem)] flex flex-col glass-panel rounded-2xl shadow-xl overflow-hidden"
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      {/* Gradient accent */}
      <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-primary flex-shrink-0" />

      {/* Header */}
      <div className="px-5 py-4 border-b border-border/30 flex-shrink-0">
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

      {/* Tabs */}
      <div className="flex border-b border-border/30 flex-shrink-0">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${activeTab === "overview" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
            }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("trips")}
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${activeTab === "trips" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
            }`}
        >
          Community Trips
        </button>
      </div>

      <div className="overflow-y-auto scrollbar-hidden flex-1 relative">
        <AnimatePresence mode="wait">
          {activeTab === "overview" ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full"
            >
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
                  {formatCurrency(data.avgDailyCost)}
                  <span className="text-xs text-muted-foreground font-body font-normal ml-0.5">/{t("region.day")}</span>
                </p>
              </div>

              {/* Highlights */}
              <div className="px-5 py-4 pb-6">
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-primary" />
                  Highlights
                </p>
                <div className="space-y-1.5">
                  {highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-foreground/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      {h}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="trips"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full bg-background/20"
            >
              <div className="p-5 flex-1 space-y-4">

                {/* Log Trip Form */}
                <div className="bg-background/60 p-4 rounded-xl border border-white/10">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-primary" />
                    Log Your Trip
                  </h4>
                  {user ? (
                    <form onSubmit={handleLogTrip} className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] uppercase text-muted-foreground font-semibold block mb-1">Start</label>
                          <input
                            type="date"
                            required
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full bg-background/50 border border-white/10 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-primary/50 transition-colors [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]"
                            max={new Date().toISOString().split("T")[0]}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase text-muted-foreground font-semibold block mb-1">End</label>
                          <input
                            type="date"
                            required
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full bg-background/50 border border-white/10 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-primary/50 transition-colors [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]"
                            max={new Date().toISOString().split("T")[0]}
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary text-primary-foreground py-2 rounded-lg text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save to Passport"}
                      </button>
                    </form>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center italic py-2">
                      Log in to add this region to your passport.
                    </p>
                  )}
                </div>

                {/* Community Trips List */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary" />
                    Community Trips
                  </h4>
                  {loadingTrips ? (
                    <div className="flex justify-center p-4">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  ) : trips.length === 0 ? (
                    <div className="text-center p-4 border border-dashed border-white/10 rounded-xl bg-primary/5">
                      <p className="text-xs text-muted-foreground">No community trips logged yet. Be the first!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {trips.map((trip) => (
                        <div key={trip.id} className="bg-primary/5 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 overflow-hidden">
                              {Array.isArray(trip.profiles) ? (
                                trip.profiles[0]?.avatar_url ? (
                                  <img src={trip.profiles[0].avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                  <Calendar className="w-4 h-4" />
                                )
                              ) : (
                                trip.profiles?.avatar_url ? (
                                  <img src={trip.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                  <Calendar className="w-4 h-4" />
                                )
                              )}
                            </div>
                            <div>
                              <div className="text-xs font-medium text-foreground opacity-90">
                                {Array.isArray(trip.profiles)
                                  ? (trip.profiles[0]?.full_name || trip.profiles[0]?.nickname || 'Verified Traveler')
                                  : (trip.profiles?.full_name || trip.profiles?.nickname || 'Verified Traveler')}
                              </div>
                              <div className="text-[10px] text-muted-foreground flex gap-1 mt-0.5">
                                {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </motion.div>
  );
}

function ScoreCard({ icon, label, score }: { icon: React.ReactNode; label: string; score: number }) {
  const color = score >= 8 ? "text-green-500" : score >= 5 ? "text-yellow-500" : "text-red-500";
  const bg = score >= 8 ? "bg-green-500/10" : score >= 5 ? "bg-yellow-500/10" : "bg-red-500/10";
  const ring = score >= 8 ? "ring-green-500/20" : score >= 5 ? "ring-yellow-500/20" : "ring-red-500/20";
  return (
    <div className={`text-center p-2.5 rounded-xl ${bg} ring-1 ${ring}`}>
      <div className={`flex justify-center mb-1 ${color}`}>{icon}</div>
      <div className={`text-lg font-bold ${color}`}>{score}</div>
      <div className="text-[9px] text-muted-foreground font-medium">{label}</div>
    </div>
  );
}
