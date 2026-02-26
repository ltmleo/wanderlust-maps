import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Plus, Trash2, Loader2, Star } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Trip {
    id: string;
    region_id: string;
    start_date: string;
    end_date: string;
    regions: {
        name: string;
        name_pt: string | null;
    };
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
    pois: {
        id: string;
        name: string;
        name_pt: string | null;
    };
}

const Profile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { t, locale } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [regions, setRegions] = useState<Region[]>([]);
    const [stamps, setStamps] = useState<PassportStamp[]>([]);

    // Form State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        try {
            setLoading(true);
            // Fetch user's trips
            const { data: userTrips, error: tripsError } = await supabase
                .from("user_trips")
                .select(`
          id, region_id, start_date, end_date,
          regions (name, name_pt)
        `)
                .eq("user_id", user?.id)
                .order("start_date", { ascending: false });

            if (tripsError) throw tripsError;

            // Fix types since supabase returns an array for joins sometimes depending on the schema,
            // but here it's a many-to-one so it should be a single object.
            setTrips((userTrips as any) || []);

            // Fetch user's reviews/stamps
            const { data: userStamps, error: stampsError } = await supabase
                .from("poi_reviews")
                .select(`
                  id, rating, content, social_video_url, social_image_url, created_at,
                  pois (id, name, name_pt)
                `)
                .eq("user_id", user?.id)
                .order("created_at", { ascending: false });

            if (stampsError) throw stampsError;
            setStamps((userStamps as any) || []);

            // Fetch all regions for the dropdown
            const { data: allRegions, error: regionsError } = await supabase
                .from("regions")
                .select("id, name, name_pt")
                .order("name", { ascending: true });

            if (regionsError) throw regionsError;
            setRegions(allRegions || []);
        } catch (error: any) {
            console.error("Error loading profile data:", error.message);
            toast.error(t("auth.error") || "Error loading trips");
        } finally {
            setLoading(false);
        }
    };

    const handleLogTrip = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRegion || !startDate || !endDate) {
            toast.error("Please fill all fields");
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
                });

            if (error) throw error;

            toast.success("Trip logged successfully!");
            setSelectedRegion("");
            setStartDate("");
            setEndDate("");
            loadData();
        } catch (error: any) {
            console.error("Error logging trip:", error.message);
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTrip = async (tripId: string) => {
        try {
            const { error } = await supabase
                .from("user_trips")
                .delete()
                .eq("id", tripId);

            if (error) throw error;
            toast.success("Trip deleted");
            loadData();
        } catch (error: any) {
            console.error("Error deleting trip:", error.message);
            toast.error(error.message);
        }
    };

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "en-US", {
            month: "short",
            year: "numeric"
        }).format(new Date(dateString));
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
            <header className="sticky top-0 z-50 glass-panel border-b border-white/10 px-6 py-4 flex items-center shadow-sm">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors mr-4"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Digital Passport</h1>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
            </header>

            <main className="max-w-3xl mx-auto p-6 space-y-10 mt-4">

                {/* Log a Trip Section */}
                <section className="glass-panel p-6 rounded-2xl border border-white/10 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                    <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
                        <Plus className="w-5 h-5 text-indigo-400" />
                        Log a Past Trip
                    </h2>

                    <form onSubmit={handleLogTrip} className="space-y-4">
                        <div>
                            <Label htmlFor="region">Destination</Label>
                            <select
                                id="region"
                                value={selectedRegion}
                                onChange={(e) => setSelectedRegion(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1.5"
                                required
                            >
                                <option value="" disabled>Select a region travelled to</option>
                                {regions.map(r => (
                                    <option key={r.id} value={r.id}>
                                        {locale === 'pt' ? (r.name_pt || r.name) : r.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="startDate">Start Date</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    required
                                    className="mt-1.5 bg-background/50"
                                    max={new Date().toISOString().split("T")[0]}
                                />
                            </div>
                            <div>
                                <Label htmlFor="endDate">End Date</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    required
                                    className="mt-1.5 bg-background/50"
                                    max={new Date().toISOString().split("T")[0]}
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save to Passport"}
                        </Button>
                    </form>
                </section>

                {/* My Travels Section */}
                <section>
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <MapPin className="w-6 h-6 text-primary" />
                        My Travels ({trips.length})
                    </h2>

                    {trips.length === 0 ? (
                        <div className="text-center py-10 px-4 glass-panel rounded-2xl border border-white/5 border-dashed">
                            <span className="text-4xl mb-4 block">✈️</span>
                            <h3 className="text-lg font-medium text-foreground mb-1">Your passport is empty!</h3>
                            <p className="text-sm text-muted-foreground">Log your past trips above to start building your personalized travel history.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {trips.map((trip) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={trip.id}
                                    className="glass-panel p-5 rounded-xl border border-white/5 flex items-center justify-between group hover:border-white/20 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">
                                                {locale === 'pt' ? (trip.regions?.name_pt || trip.regions?.name) : trip.regions?.name}
                                            </h3>
                                            <div className="flex items-center text-xs text-muted-foreground gap-1.5 mt-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteTrip(trip.id)}
                                        className="p-2 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-400/10 rounded-full transition-all"
                                        title="Remove trip"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>

                {/* My Passport Stamps Section */}
                <section>
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span className="text-2xl">🛂</span>
                        My Passport Stamps ({stamps.length})
                    </h2>

                    {stamps.length === 0 ? (
                        <div className="text-center py-10 px-4 glass-panel rounded-2xl border border-white/5 border-dashed">
                            <span className="text-4xl mb-4 block">📸</span>
                            <h3 className="text-lg font-medium text-foreground mb-1">No stamps yet!</h3>
                            <p className="text-sm text-muted-foreground">Visit places on the map and leave tips with your photos or videos to collect stamps.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {stamps.map((stamp) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={stamp.id}
                                    className="glass-panel p-5 rounded-xl border border-white/5 flex flex-col gap-3 group hover:border-white/20 transition-colors"
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
                                        <p className="text-sm italic text-foreground/80 border-l-2 border-primary/30 pl-2">
                                            "{stamp.content}"
                                        </p>
                                    )}

                                    <div className="mt-auto pt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hidden">
                                        {stamp.social_video_url && (
                                            <div className="shrink-0 w-24 h-36 rounded-lg overflow-hidden bg-black/20 border border-white/10 relative">
                                                <div className="absolute top-1 right-1 text-[10px] bg-pink-500 text-white px-1.5 rounded-full z-10">Video</div>
                                                <iframe
                                                    src={stamp.social_video_url}
                                                    className="w-full h-full border-0 absolute inset-0 pointer-events-none"
                                                    allow="encrypted-media;"
                                                />
                                            </div>
                                        )}
                                        {stamp.social_image_url && (
                                            <div className="shrink-0 w-24 h-36 rounded-lg overflow-hidden bg-black/20 border border-white/10 relative">
                                                <div className="absolute top-1 right-1 text-[10px] bg-blue-500 text-white px-1.5 rounded-full z-10">Photo</div>
                                                <img
                                                    src={stamp.social_image_url}
                                                    alt="Memory"
                                                    className="w-full h-full object-cover"
                                                />
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
