import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Plus, Trash2, Loader2, Star, Plane, Users, FileText, Tag } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Trip {
    id: string;
    region_id: string | null;
    poi_id: string | null;
    start_date: string;
    end_date: string;
    notes?: string | null;
    description?: string | null;
    image_url?: string | null;
    companions?: string | null;
    trip_type?: string | null;
    regions?: { name: string; name_pt: string | null };
    pois?: { name: string; name_pt: string | null };
}

interface Region {
    id: string;
    name: string;
    name_pt: string | null;
}

interface PassportStamp {
    id: string;
    rating: number;
    content: string | null;
    social_video_url: string | null;
    social_image_url: string | null;
    created_at: string;
    pois: { id: string; name: string; name_pt: string | null };
}

interface ProfileData {
    full_name: string | null;
    nickname: string | null;
    country: string | null;
    bio: string | null;
    avatar_url: string | null;
}

const tripTypes = ["leisure", "adventure", "business", "cultural", "romantic"] as const;

const Profile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { t, locale } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [regions, setRegions] = useState<Region[]>([]);
    const [stamps, setStamps] = useState<PassportStamp[]>([]);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editProfileData, setEditProfileData] = useState<ProfileData | null>(null);
    const [showTripForm, setShowTripForm] = useState(false);

    // Form State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [description, setDescription] = useState("");
    const [notes, setNotes] = useState("");
    const [companions, setCompanions] = useState("");
    const [tripType, setTripType] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    useEffect(() => {
        if (user) loadData();
    }, [user]);

    const loadData = async () => {
        setLoading(true);

        // Run all queries independently so one failure doesn't block others
        const [tripsResult, stampsResult, profileResult, regionsResult] = await Promise.allSettled([
            // Trips: try with new columns first, fall back to basic query on error
            supabase
                .from("user_trips")
                .select(`id, region_id, poi_id, start_date, end_date, notes, description, image_url, companions, trip_type, regions (name, name_pt), pois (name, name_pt)`)
                .eq("user_id", user?.id)
                .order("start_date", { ascending: false }),
            supabase
                .from("poi_reviews")
                .select(`id, rating, content, social_video_url, social_image_url, created_at, pois (id, name, name_pt)`)
                .eq("user_id", user?.id)
                .order("created_at", { ascending: false }),
            supabase
                .from("profiles")
                .select("full_name, nickname, country, bio, avatar_url")
                .eq("id", user?.id)
                .single(),
            supabase
                .from("regions")
                .select("id, name, name_pt")
                .order("name", { ascending: true }),
        ]);

        // Handle trips
        if (tripsResult.status === "fulfilled") {
            const { data, error } = tripsResult.value;
            if (error) {
                console.error("Trips error (new columns may not exist yet):", error.message);
                // Fallback: try without any new columns
                const { data: basicTrips } = await supabase
                    .from("user_trips")
                    .select(`id, region_id, poi_id, start_date, end_date, regions (name, name_pt), pois (name, name_pt)`)
                    .eq("user_id", user?.id)
                    .order("start_date", { ascending: false });
                setTrips((basicTrips as any) || []);
            } else {
                setTrips((data as any) || []);
            }
        }

        // Handle stamps
        if (stampsResult.status === "fulfilled") {
            const { data, error } = stampsResult.value;
            if (!error) setStamps((data as any) || []);
            else console.error("Stamps error:", error.message);
        }

        // Handle profile
        if (profileResult.status === "fulfilled") {
            const { data, error } = profileResult.value;
            if (!error || error.code === 'PGRST116') {
                if (data) {
                    setProfile(data);
                    setEditProfileData({ full_name: data.full_name || '', nickname: data.nickname || '', country: data.country || '', bio: data.bio || '', avatar_url: data.avatar_url || '' });
                } else {
                    setEditProfileData({ full_name: '', nickname: '', country: '', bio: '', avatar_url: '' });
                }
            } else {
                console.error("Profile error:", error.message);
            }
        }

        // Handle regions
        if (regionsResult.status === "fulfilled") {
            const { data, error } = regionsResult.value;
            if (!error) setRegions(data || []);
            else console.error("Regions error:", error.message);
        }

        setLoading(false);
    };

    const handleLogTrip = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRegion || !startDate || !endDate) {
            toast.error("Please fill all required fields");
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            toast.error("End date cannot be before start date");
            return;
        }
        try {
            setIsSubmitting(true);
            const { error } = await supabase
                .from("user_trips")
                .insert({
                    user_id: user?.id,
                    region_id: selectedRegion,
                    start_date: startDate,
                    end_date: endDate,
                    description: description || null,
                    notes: notes || null,
                    image_url: imageUrl || null,
                    companions: companions || null,
                    trip_type: tripType || null,
                });
            if (error) throw error;
            toast.success("Trip logged successfully!");
            setSelectedRegion(""); setStartDate(""); setEndDate(""); setDescription(""); setNotes(""); setImageUrl(""); setCompanions(""); setTripType("");
            setShowTripForm(false);
            loadData();
        } catch (error: any) {
            console.error("Error logging trip:", error.message);
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            setIsSubmitting(true);
            const { error } = await supabase
                .from("profiles")
                .update({ full_name: editProfileData?.full_name, nickname: editProfileData?.nickname, country: editProfileData?.country, bio: editProfileData?.bio })
                .eq("id", user?.id);
            if (error) throw error;
            setProfile(editProfileData);
            setIsEditingProfile(false);
            toast.success("Profile updated successfully!");
        } catch (error: any) {
            console.error("Error updating profile:", error.message);
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTrip = async (tripId: string) => {
        try {
            const { error } = await supabase.from("user_trips").delete().eq("id", tripId);
            if (error) throw error;
            toast.success("Trip deleted");
            loadData();
        } catch (error: any) {
            console.error("Error deleting trip:", error.message);
            toast.error(error.message);
        }
    };

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "en-US", { month: "short", year: "numeric" }).format(new Date(dateString));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <header className="sticky top-0 z-50 glass-panel border-b border-border/50 px-6 py-4 flex items-center shadow-sm">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-accent rounded-full transition-colors mr-4">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">{t("passport.title")}</h1>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
            </header>

            <main className="max-w-3xl mx-auto p-6 space-y-10 mt-4">

                {/* Profile Section */}
                <section className="glass-panel p-6 rounded-2xl border border-border/50 shadow-lg relative overflow-hidden flex flex-col items-center">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-primary/40 to-primary/10 opacity-70" />
                    <div className="relative z-10 w-24 h-24 rounded-full border-4 border-background overflow-hidden bg-primary/20 flex items-center justify-center mt-2 shadow-xl">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl text-primary font-bold uppercase">{profile?.full_name?.charAt(0) || user?.email?.charAt(0) || '?'}</span>
                        )}
                    </div>

                    {isEditingProfile ? (
                        <div className="w-full mt-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="full_name">{t("passport.fullName")}</Label>
                                    <Input id="full_name" value={editProfileData?.full_name || ''} onChange={e => setEditProfileData(prev => ({ ...prev!, full_name: e.target.value }))} className="bg-background/50 mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="nickname">{t("passport.nickname")}</Label>
                                    <Input id="nickname" value={editProfileData?.nickname || ''} onChange={e => setEditProfileData(prev => ({ ...prev!, nickname: e.target.value }))} className="bg-background/50 mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="country">{t("passport.country")}</Label>
                                    <Input id="country" value={editProfileData?.country || ''} onChange={e => setEditProfileData(prev => ({ ...prev!, country: e.target.value }))} className="bg-background/50 mt-1" />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="bio">{t("passport.bio")}</Label>
                                <textarea id="bio" rows={3} value={editProfileData?.bio || ''} onChange={e => setEditProfileData(prev => ({ ...prev!, bio: e.target.value }))}
                                    className="flex w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
                                    placeholder={t("passport.bioPlaceholder")}
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <Button className="bg-transparent text-foreground hover:bg-accent" onClick={() => { setIsEditingProfile(false); setEditProfileData(profile || { full_name: '', nickname: '', country: '', bio: '', avatar_url: '' }); }}>{t("passport.cancel")}</Button>
                                <Button onClick={handleSaveProfile} disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} {t("passport.saveProfile")}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center mt-4 relative z-10">
                            <h2 className="text-2xl font-bold tracking-tight">{profile?.full_name || profile?.nickname || user?.email?.split('@')[0]}</h2>
                            {(profile?.full_name && profile?.nickname) && <p className="text-muted-foreground pt-0.5 text-sm">@{profile.nickname}</p>}
                            {profile?.country && <p className="text-sm pt-2 flex items-center justify-center gap-1 text-muted-foreground"><MapPin className="w-3.5 h-3.5" /> {profile.country}</p>}
                            {profile?.bio ? (
                                <p className="mt-5 text-sm max-w-sm mx-auto text-foreground/80 leading-relaxed">{profile.bio}</p>
                            ) : (
                                <p className="mt-5 text-sm max-w-sm mx-auto text-muted-foreground italic">{t("passport.noBio")}</p>
                            )}
                            <Button className="mt-6 rounded-full px-6 bg-transparent border border-input hover:bg-accent hover:text-accent-foreground h-9" onClick={() => setIsEditingProfile(true)}>
                                {t("passport.editProfile")}
                            </Button>
                        </div>
                    )}
                </section>

                {/* Log a Trip Section */}
                <section className="glass-panel rounded-2xl border border-border/50 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/50" />

                    <button
                        onClick={() => setShowTripForm(!showTripForm)}
                        className="w-full p-6 flex items-center justify-between hover:bg-accent/30 transition-colors"
                    >
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Plus className={`w-5 h-5 text-primary transition-transform duration-300 ${showTripForm ? 'rotate-45' : ''}`} />
                            {t("passport.logTrip")}
                        </h2>
                        <Plane className="w-5 h-5 text-muted-foreground" />
                    </button>

                    <AnimatePresence>
                        {showTripForm && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden"
                            >
                                <form onSubmit={handleLogTrip} className="px-6 pb-6 space-y-5">
                                    {/* Destination */}
                                    <div>
                                        <Label htmlFor="region" className="flex items-center gap-1.5 mb-1.5">
                                            <MapPin className="w-3.5 h-3.5 text-primary" />
                                            {t("passport.destination")}
                                        </Label>
                                        <select
                                            id="region"
                                            value={selectedRegion}
                                            onChange={(e) => setSelectedRegion(e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            required
                                        >
                                            <option value="" disabled>{t("passport.selectRegion")}</option>
                                            {regions.map(r => (
                                                <option key={r.id} value={r.id}>
                                                    {locale === 'pt' ? (r.name_pt || r.name) : r.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Dates */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="startDate" className="flex items-center gap-1.5 mb-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-primary" />
                                                {t("passport.startDate")}
                                            </Label>
                                            <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required max={new Date().toISOString().split("T")[0]} />
                                        </div>
                                        <div>
                                            <Label htmlFor="endDate" className="flex items-center gap-1.5 mb-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-primary" />
                                                {t("passport.endDate")}
                                            </Label>
                                            <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required max={new Date().toISOString().split("T")[0]} />
                                        </div>
                                    </div>

                                    {/* Trip Type */}
                                    <div>
                                        <Label className="flex items-center gap-1.5 mb-2">
                                            <Tag className="w-3.5 h-3.5 text-primary" />
                                            {t("passport.tripType")}
                                        </Label>
                                        <div className="flex flex-wrap gap-2">
                                            {tripTypes.map(type => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setTripType(tripType === type ? "" : type)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${tripType === type
                                                        ? 'bg-primary text-primary-foreground border-primary shadow-md'
                                                        : 'bg-background border-input text-muted-foreground hover:border-primary/50 hover:text-foreground'
                                                        }`}
                                                >
                                                    {t(`passport.tripTypes.${type}`)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Companions */}
                                    <div>
                                        <Label htmlFor="companions" className="flex items-center gap-1.5 mb-1.5">
                                            <Users className="w-3.5 h-3.5 text-primary" />
                                            {t("passport.companions")}
                                        </Label>
                                        <Input id="companions" value={companions} onChange={(e) => setCompanions(e.target.value)} placeholder={t("passport.companionsPlaceholder")} />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <Label htmlFor="description" className="flex items-center gap-1.5 mb-1.5">
                                            <FileText className="w-3.5 h-3.5 text-primary" />
                                            {t("passport.description") || "Description"}
                                        </Label>
                                        <textarea
                                            id="description"
                                            rows={2}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            placeholder="Short description... (optional)"
                                        />
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <Label htmlFor="notes" className="flex items-center gap-1.5 mb-1.5">
                                            <FileText className="w-3.5 h-3.5 text-primary" />
                                            {t("passport.notes")}
                                        </Label>
                                        <textarea
                                            id="notes"
                                            rows={3}
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            placeholder={t("passport.notesPlaceholder")}
                                        />
                                    </div>

                                    {/* Image URL */}
                                    <div>
                                        <Label htmlFor="imageUrl" className="flex items-center gap-1.5 mb-1.5">
                                            <span className="text-xl">📸</span>
                                            {t("passport.imageUrl") || "Image URL"}
                                        </Label>
                                        <Input id="imageUrl" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
                                    </div>

                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                        {t("passport.save")}
                                    </Button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>

                {/* My Travels Section */}
                <section>
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <MapPin className="w-6 h-6 text-primary" />
                        {t("passport.myTravels")} ({trips.length})
                    </h2>

                    {trips.length === 0 ? (
                        <div className="text-center py-10 px-4 glass-panel rounded-2xl border border-border/50 border-dashed">
                            <span className="text-4xl mb-4 block">✈️</span>
                            <h3 className="text-lg font-medium text-foreground mb-1">{t("passport.emptyTitle")}</h3>
                            <p className="text-sm text-muted-foreground">{t("passport.emptyDesc")}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {trips.map((trip) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={trip.id}
                                    className="glass-panel p-5 rounded-xl border border-border/50 group hover:border-primary/30 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                <MapPin className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg">
                                                    {trip.poi_id
                                                        ? (locale === 'pt' ? (trip.pois?.name_pt || trip.pois?.name) : trip.pois?.name)
                                                        : (locale === 'pt' ? (trip.regions?.name_pt || trip.regions?.name) : trip.regions?.name)}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {formatDate(trip.start_date)} – {formatDate(trip.end_date)}
                                                    </span>
                                                    {trip.trip_type && (
                                                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase">
                                                            {t(`passport.tripTypes.${trip.trip_type}`)}
                                                        </span>
                                                    )}
                                                    {trip.companions && (
                                                        <span className="flex items-center gap-1">
                                                            <Users className="w-3 h-3" /> {trip.companions}
                                                        </span>
                                                    )}
                                                </div>
                                                {trip.description && (
                                                    <p className="mt-2 text-sm text-foreground/90 italic border-l-2 border-primary/30 pl-2">
                                                        "{trip.description}"
                                                    </p>
                                                )}
                                                {trip.notes && (
                                                    <div className="mt-2 text-sm text-foreground/80 bg-background/30 p-2 rounded-lg border border-border/50 whitespace-pre-line">
                                                        {trip.notes}
                                                    </div>
                                                )}
                                                {trip.image_url && (
                                                    <div className="mt-3 rounded-xl overflow-hidden cursor-pointer w-full max-h-48 border border-border/50 relative group/img">
                                                        <img src={trip.image_url} alt="Trip photo" className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteTrip(trip.id)}
                                            className="p-2 text-destructive opacity-0 group-hover:opacity-100 hover:bg-destructive/10 rounded-full transition-all shrink-0"
                                            title="Remove trip"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>

                {/* My Passport Stamps Section */}
                <section>
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span className="text-2xl">🛂</span>
                        {t("passport.stamps")} ({stamps.length})
                    </h2>

                    {stamps.length === 0 ? (
                        <div className="text-center py-10 px-4 glass-panel rounded-2xl border border-border/50 border-dashed">
                            <span className="text-4xl mb-4 block">📸</span>
                            <h3 className="text-lg font-medium text-foreground mb-1">{t("passport.stampsEmptyTitle")}</h3>
                            <p className="text-sm text-muted-foreground">{t("passport.stampsEmptyDesc")}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {stamps.map((stamp) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={stamp.id}
                                    className="glass-panel p-5 rounded-xl border border-border/50 flex flex-col gap-3 group hover:border-primary/30 transition-colors"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-lg text-primary">
                                                {locale === 'pt' ? (stamp.pois?.name_pt || stamp.pois?.name) : stamp.pois?.name}
                                            </h3>
                                            <div className="flex items-center text-xs text-muted-foreground gap-1.5 mt-0.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {formatDate(stamp.created_at)}
                                            </div>
                                        </div>
                                        <div className="flex text-amber-500">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-3 h-3 ${i < stamp.rating ? "fill-current" : "opacity-30"}`} />
                                            ))}
                                        </div>
                                    </div>
                                    {stamp.content && (
                                        <p className="text-sm italic text-foreground/80 border-l-2 border-primary/30 pl-2">"{stamp.content}"</p>
                                    )}
                                    <div className="mt-auto pt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hidden">
                                        {stamp.social_video_url && (
                                            <div className="shrink-0 w-24 h-36 rounded-lg overflow-hidden bg-muted border border-border/50 relative">
                                                <div className="absolute top-1 right-1 text-[10px] bg-pink-500 text-white px-1.5 rounded-full z-10">Video</div>
                                                <iframe src={stamp.social_video_url} className="w-full h-full border-0 absolute inset-0 pointer-events-none" allow="encrypted-media;" />
                                            </div>
                                        )}
                                        {stamp.social_image_url && (
                                            <div className="shrink-0 w-24 h-36 rounded-lg overflow-hidden bg-muted border border-border/50 relative">
                                                <div className="absolute top-1 right-1 text-[10px] bg-blue-500 text-white px-1.5 rounded-full z-10">Photo</div>
                                                <img src={stamp.social_image_url} alt="Memory" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        {(!stamp.social_video_url && !stamp.social_image_url) && (
                                            <div className="w-full text-center py-2 text-xs text-muted-foreground bg-primary/5 rounded-lg border border-primary/10">
                                                No media attached
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default Profile;
