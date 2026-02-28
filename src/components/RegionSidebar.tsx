import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { RegionProperties } from "@/data/travelData";
import { MONTHS } from "@/data/travelData";
import { X, Thermometer, DollarSign, Star, Sparkles, MapPin, BookOpen, Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const navigate = useNavigate();

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
          id, start_date, end_date, description, notes, image_url,
          user_id,
          profiles ( full_name, nickname, avatar_url )
        `)
        .eq("region_id", region.id)
        .order("start_date", { ascending: false });

      if (error) {
        console.warn("Could not fetch trip profiles via join, fallback to manual fetch", error);
        const { data: trps } = await supabase.from('user_trips').select('id, start_date, end_date, description, notes, image_url, user_id').eq('region_id', region.id).order("start_date", { ascending: false });
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

                {/* CTA to log trip */}
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">
                      {user ? "Add this to your Passport" : "Log in to add to Passport"}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Fill dates, notes and photos in your profile</p>
                  </div>
                  {user && (
                    <button
                      onClick={() => { onClose(); navigate("/profile"); }}
                      className="shrink-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Go →
                    </button>
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
                    <div className="space-y-3">
                      {trips.map((trip) => {
                        const profile = Array.isArray(trip.profiles) ? trip.profiles[0] : trip.profiles;
                        const travelerName = profile?.full_name || profile?.nickname || 'Verified Traveler';
                        return (
                          <div key={trip.id} className="bg-primary/5 rounded-xl border border-white/5 overflow-hidden">
                            {trip.image_url && (
                              <div
                                className="h-36 w-full cursor-pointer overflow-hidden"
                                onClick={() => setSelectedImage(trip.image_url)}
                              >
                                <img src={trip.image_url} alt="Trip photo" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                              </div>
                            )}
                            <div className="p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 overflow-hidden border border-white/10">
                                  {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-[10px] font-bold text-primary">{travelerName.charAt(0)}</span>
                                  )}
                                </div>
                                <div>
                                  <div className="text-[11px] font-semibold text-foreground leading-none">{travelerName}</div>
                                  <div className="text-[10px] text-muted-foreground mt-0.5">
                                    {formatDate(trip.start_date)} – {formatDate(trip.end_date)}
                                  </div>
                                </div>
                              </div>
                              {trip.description && (
                                <p className="text-xs text-foreground/90 leading-relaxed italic border-l-2 border-primary/30 pl-2 mb-2">
                                  "{trip.description}"
                                </p>
                              )}
                              {trip.notes && (
                                <div className="text-xs text-foreground/70 bg-background/30 p-2 rounded-lg border border-white/5 whitespace-pre-line">
                                  {trip.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <motion.div
          className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={selectedImage}
            alt="Fullscreen view"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}

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
