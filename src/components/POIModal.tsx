import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { POIProperties } from "@/data/travelData";
import { X, Clock, MapPin, Star, Send, Loader2, Calendar, Plus } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  content: string;
  social_video_url?: string;
  social_image_url?: string;
  created_at: string;
  users?: { email: string };
  profiles?: {
    full_name: string | null;
    nickname: string | null;
    avatar_url: string | null;
    country: string | null;
  } | any;
}

interface TripInfo {
  id: string;
  start_date: string;
  end_date: string;
  user_id: string;
  profiles?: {
    full_name: string | null;
    nickname: string | null;
    avatar_url: string | null;
  } | any;
}


interface POIModalProps {
  poi: POIProperties | null;
  onClose: () => void;
}

const categoryLabels = (t: (k: string) => string): Record<string, string> => ({
  landmark: t("category.landmark"),
  nature: t("category.nature"),
  culture: t("category.culture"),
  beach: t("category.beach"),
  city: t("category.city"),
  wonder: t("category.wonder")
});

const categoryColors: Record<string, string> = {
  landmark: "bg-amber-500/20 text-amber-400",
  nature: "bg-emerald-500/20 text-emerald-400",
  culture: "bg-purple-500/20 text-purple-400",
  beach: "bg-cyan-500/20 text-cyan-400",
};

export function POIModal({ poi, onClose }: POIModalProps) {
  const { t, locale } = useTranslation();
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"overview" | "tips" | "trips">("overview");

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewVideoUrl, setReviewVideoUrl] = useState("");
  const [reviewImageUrl, setReviewImageUrl] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Trips State
  const [trips, setTrips] = useState<TripInfo[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSubmittingTrip, setIsSubmittingTrip] = useState(false);

  useEffect(() => {
    setActiveTab("overview");
  }, [poi?.id]);

  useEffect(() => {
    if (poi) {
      if (activeTab === "tips") fetchReviews();
      if (activeTab === "trips") fetchTrips();
    }
  }, [poi, activeTab]);

  const fetchReviews = async () => {
    if (!poi) return;
    try {
      setLoadingReviews(true);
      const { data, error } = await supabase
        .from('poi_reviews')
        .select(`
          id, user_id, rating, content, social_video_url, social_image_url, created_at,
          profiles ( full_name, nickname, avatar_url, country )
        `)
        .eq('poi_id', poi.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn("Could not fetch profiles via join, falling back to manual fetch", error);
        // Fallback manual fetch if join fails due to fk missing
        const { data: revs } = await supabase.from('poi_reviews').select('id, user_id, rating, content, social_video_url, social_image_url, created_at').eq('poi_id', poi.id).order('created_at', { ascending: false });
        if (!revs) {
          setReviews([]);
          return;
        }
        const userIds = [...new Set(revs.map(r => r.user_id))];
        const { data: profs } = await supabase.from('profiles').select('id, full_name, nickname, avatar_url, country').in('id', userIds);
        const profMap = new Map((profs || []).map(p => [p.id, p]));
        setReviews(revs.map(r => ({ ...r, profiles: profMap.get(r.user_id) })) as any);
      } else {
        setReviews((data as any) || []);
      }
    } catch (err) {
      console.error("Error fetching reviews", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchTrips = async () => {
    if (!poi) return;
    try {
      setLoadingTrips(true);
      const { data, error } = await supabase
        .from("user_trips")
        .select(`
          id, start_date, end_date,
          user_id,
          profiles ( full_name, nickname, avatar_url )
        `)
        .eq("poi_id", poi.id)
        .order("start_date", { ascending: false });

      if (error) {
        console.warn("Could not fetch trip profiles via join, fallback to manual fetch", error);
        const { data: trps } = await supabase.from('user_trips').select('id, start_date, end_date, user_id').eq('poi_id', poi.id).order("start_date", { ascending: false });
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

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to leave a tip.");
      return;
    }
    if (!reviewText.trim()) return;

    try {
      setIsSubmittingReview(true);
      const { error } = await supabase.from('poi_reviews').insert({
        user_id: user.id,
        poi_id: poi!.id,
        rating: reviewRating,
        content: reviewText,
        social_video_url: reviewVideoUrl || null,
        social_image_url: reviewImageUrl || null
      });

      if (error) throw error;
      toast.success("Tip added successfully!");
      setReviewText("");
      setReviewVideoUrl("");
      setReviewImageUrl("");
      setReviewRating(5);
      fetchReviews();
    } catch (err: any) {
      console.error("Error submitting review", err);
      toast.error("Failed to add tip.");
    } finally {
      setIsSubmittingReview(false);
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
      setIsSubmittingTrip(true);
      const { error } = await supabase.from("user_trips").insert({
        user_id: user.id,
        poi_id: poi!.id,
        start_date: startDate,
        end_date: endDate,
      });

      if (error) throw error;

      toast.success("Trip logged to POI successfully!");
      setStartDate("");
      setEndDate("");
      fetchTrips();
    } catch (err: any) {
      console.error("Error logging trip:", err);
      toast.error(err.message || "Failed to log trip.");
    } finally {
      setIsSubmittingTrip(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "en-US", {
      month: "short",
      year: "numeric"
    }).format(new Date(dateString));
  };


  if (!poi) return null;

  const name = locale === 'pt' && poi.namePt ? poi.namePt : poi.name;
  const description = locale === 'pt' && poi.descriptionPt ? poi.descriptionPt : poi.description;
  const bestTime = locale === 'pt' && poi.bestTimePt ? poi.bestTimePt : poi.bestTime;

  return (
    <>
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
          exit={{ opacity: 0 }}
        />
        <motion.div
          className="relative glass-panel rounded-2xl w-full max-w-md h-[85vh] flex flex-col overflow-hidden"
          initial={{ scale: 0.9, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 30, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Gradient header bar */}
          <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-primary flex-shrink-0" />

          <div className="p-6 pb-4 flex-shrink-0">
            <div className="flex items-start justify-between mb-4">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium mb-2 ${categoryColors[poi.category] || "bg-primary/20 text-primary"}`}>
                  <MapPin className="w-3 h-3" />
                  {categoryLabels(t)[poi.category] || poi.category}
                </span>
                <h2 className="font-display text-2xl font-bold text-foreground">{name}</h2>
              </motion.div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-all hover:rotate-90 duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 mt-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex-1 py-2 mb-[-1px] text-xs font-medium transition-colors border-b-2 ${activeTab === "overview" ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground"
                  }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("tips")}
                className={`flex-1 py-2 mb-[-1px] text-xs font-medium transition-colors border-b-2 ${activeTab === "tips" ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground"
                  }`}
              >
                Tips
              </button>
              <button
                onClick={() => setActiveTab("trips")}
                className={`flex-1 py-2 mb-[-1px] text-xs font-medium transition-colors border-b-2 ${activeTab === "trips" ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground"
                  }`}
              >
                Trips
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 pt-0 scrollbar-hidden">
            <AnimatePresence mode="wait">

              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                    {description}
                  </p>

                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <div className="flex items-center gap-2 text-primary mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-[10px] uppercase tracking-widest font-semibold">{t("poi.bestTime")}</span>
                    </div>
                    <p className="text-sm text-foreground">{bestTime}</p>
                  </div>

                  {/* Primary image */}
                  {poi.imageUrl && (
                    <div
                      className="mt-4 rounded-xl overflow-hidden h-40 cursor-pointer group"
                      onClick={() => setSelectedImage(poi.imageUrl!)}
                    >
                      <img src={poi.imageUrl} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}

                  {/* Social Video or Image Gallery */}
                  {poi.socialVideoUrl ? (
                    <div className="mt-6">
                      <h3 className="text-sm font-semibold mb-2 text-foreground flex items-center gap-2">
                        <span className="text-pink-500">▶</span> Video Reel
                      </h3>
                      <div className="rounded-xl overflow-hidden aspect-[9/16] bg-black/5 flex items-center justify-center border border-white/10">
                        <iframe
                          src={poi.socialVideoUrl}
                          className="w-full h-full border-0"
                          allow="encrypted-media;"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  ) : poi.imageGallery && poi.imageGallery.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-semibold mb-2 text-foreground">{t("poi.gallery")}</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {poi.imageGallery.map((imgUrl, i) => (
                          <div
                            key={i}
                            className="rounded-xl overflow-hidden h-24 cursor-pointer group"
                            onClick={() => setSelectedImage(imgUrl)}
                          >
                            <img src={imgUrl} alt={`${name} gallery ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!poi.imageUrl && !poi.socialVideoUrl && (!poi.imageGallery || poi.imageGallery.length === 0)) && (
                    <div className="mt-4 rounded-xl bg-secondary/20 border border-dashed border-border/50 h-32 flex items-center justify-center">
                      <p className="text-xs text-muted-foreground">{t("poi.noPhotos")}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "tips" && (
                <motion.div
                  key="tips"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-4"
                >
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    Community Tips
                  </h3>

                  {/* Submit Tip Form */}
                  {user ? (
                    <form onSubmit={submitReview} className="bg-background/40 p-4 rounded-xl border border-white/10 shrink-0">
                      <h4 className="text-xs font-medium mb-3">Leave a Tip</h4>
                      <div className="flex gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setReviewRating(star)}
                            className={`p-0.5 transition-colors ${reviewRating >= star ? "text-amber-500" : "text-muted-foreground hover:text-amber-500/50"}`}
                          >
                            <Star className={`w-4 h-4 ${reviewRating >= star ? "fill-current" : ""}`} />
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Share a tip..."
                          className="flex-1 bg-background/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary/50 transition-colors"
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                        />
                        <button
                          type="submit"
                          disabled={isSubmittingReview || (!reviewText.trim() && !reviewVideoUrl && !reviewImageUrl)}
                          className="bg-primary text-primary-foreground p-1.5 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                        >
                          {isSubmittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="mt-2 text-[10px] text-muted-foreground mb-1">Optional Media:</div>
                      <div className="flex flex-col gap-2">
                        <input
                          type="url"
                          placeholder="Video URL"
                          className="bg-background/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary/50 transition-colors"
                          value={reviewVideoUrl}
                          onChange={(e) => setReviewVideoUrl(e.target.value)}
                        />
                        <input
                          type="url"
                          placeholder="Image URL"
                          className="bg-background/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary/50 transition-colors"
                          value={reviewImageUrl}
                          onChange={(e) => setReviewImageUrl(e.target.value)}
                        />
                      </div>
                    </form>
                  ) : (
                    <div className="text-center p-4 bg-background/40 rounded-xl border border-white/10 shrink-0">
                      <p className="text-xs text-muted-foreground">Log in to leave a tip for other travelers.</p>
                    </div>
                  )}

                  {/* Tips List */}
                  <div className="space-y-3">
                    {loadingReviews ? (
                      <div className="flex justify-center p-4">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      </div>
                    ) : reviews.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic text-center py-4 bg-primary/5 rounded-xl">No tips yet. Be the first!</p>
                    ) : (
                      reviews.map((rev) => (
                        <div key={rev.id} className="bg-primary/5 p-3 rounded-xl border border-white/5">
                          <div className="flex justify-between items-start mb-1.5">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary/20 overflow-hidden flex items-center justify-center shrink-0 border border-white/10">
                                {Array.isArray(rev.profiles) ? (
                                  rev.profiles[0]?.avatar_url ? (
                                    <img src={rev.profiles[0].avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-[10px] font-bold text-primary">{rev.profiles[0]?.full_name?.charAt(0) || rev.profiles[0]?.nickname?.charAt(0) || '?'}</span>
                                  )
                                ) : (
                                  rev.profiles?.avatar_url ? (
                                    <img src={rev.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-[10px] font-bold text-primary">{rev.profiles?.full_name?.charAt(0) || rev.profiles?.nickname?.charAt(0) || '?'}</span>
                                  )
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[11px] font-medium text-foreground opacity-90 leading-none">
                                  {Array.isArray(rev.profiles)
                                    ? (rev.profiles[0]?.full_name || rev.profiles[0]?.nickname || 'Verified Traveler')
                                    : (rev.profiles?.full_name || rev.profiles?.nickname || 'Verified Traveler')}
                                </span>
                                {(Array.isArray(rev.profiles) ? rev.profiles[0]?.country : rev.profiles?.country) && (
                                  <span className="text-[9px] text-muted-foreground mt-0.5">
                                    {Array.isArray(rev.profiles) ? rev.profiles[0].country : rev.profiles.country}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex text-amber-500 items-center justify-end h-6">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-2 h-2 ${i < rev.rating ? "fill-current" : "opacity-30"}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-foreground/90 leading-relaxed">{rev.content}</p>
                          {rev.social_video_url && (
                            <div className="mt-2 rounded-xl overflow-hidden aspect-[9/16] bg-black/10 max-w-[150px] border border-white/5">
                              <iframe
                                src={rev.social_video_url}
                                className="w-full h-full border-0"
                                allow="encrypted-media;"
                                allowFullScreen
                              />
                            </div>
                          )}
                          {rev.social_image_url && (
                            <div className="mt-2 rounded-xl overflow-hidden cursor-pointer w-full max-h-32"
                              onClick={() => setSelectedImage(rev.social_image_url!)}>
                              <img src={rev.social_image_url} alt="User tip photo" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "trips" && (
                <motion.div
                  key="trips"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-4"
                >
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Community Trips
                  </h3>

                  {/* Log Trip Form */}
                  <div className="bg-background/40 p-4 rounded-xl border border-white/10 shrink-0">
                    <h4 className="text-xs font-semibold mb-3 flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-primary" />
                      Log Your Trip
                    </h4>
                    {user ? (
                      <form onSubmit={handleLogTrip} className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] uppercase text-muted-foreground font-semibold block mb-1">Start Date</label>
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
                            <label className="text-[10px] uppercase text-muted-foreground font-semibold block mb-1">End Date</label>
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
                          disabled={isSubmittingTrip}
                          className="w-full bg-primary text-primary-foreground py-2 rounded-lg text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                        >
                          {isSubmittingTrip ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save to Passport"}
                        </button>
                      </form>
                    ) : (
                      <div className="text-center py-2">
                        <p className="text-xs text-muted-foreground italic">Log in to add this place to your passport.</p>
                      </div>
                    )}
                  </div>

                  {/* Community Trips List */}
                  <div className="space-y-2">
                    {loadingTrips ? (
                      <div className="flex justify-center p-4">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      </div>
                    ) : trips.length === 0 ? (
                      <div className="text-center p-4 border border-dashed border-white/10 rounded-xl bg-primary/5">
                        <p className="text-xs text-muted-foreground">No community trips logged yet. Be the first!</p>
                      </div>
                    ) : (
                      trips.map((trip) => (
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
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

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
    </>
  );
}
