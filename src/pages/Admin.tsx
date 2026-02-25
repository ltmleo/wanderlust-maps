import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, MapPin, Globe, Save, X, Image as ImageIcon, Calendar, Info, Map as MapIcon, ShieldAlert } from 'lucide-react';

const supabaseAdminUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAdminKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseClient = createClient(supabaseAdminUrl, supabaseAdminKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
    }
});

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

export default function Admin() {
    const [isLocal, setIsLocal] = useState(true);
    const [activeTab, setActiveTab] = useState<'regions' | 'pois'>('regions');

    // Data state
    const [regions, setRegions] = useState<any[]>([]);
    const [pois, setPois] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Editor state
    const [editorTarget, setEditorTarget] = useState<'region' | 'poi' | null>(null);
    const [editorMode, setEditorMode] = useState<'add' | 'edit'>('add');
    const [editorId, setEditorId] = useState<string>('');
    const [formData, setFormData] = useState<any>(null);
    const [editorError, setEditorError] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);

    const [selectedMonth, setSelectedMonth] = useState<number>(1);

    useEffect(() => {
        // Check if running on localhost or 127.0.0.1
        const hostname = window.location.hostname;
        if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
            setIsLocal(false);
            return;
        }

        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Regions and Monthly data in parallel
            const [regionsRes, monthlyRes, poisRes] = await Promise.all([
                supabaseClient.from('regions').select('*').order('name'),
                supabaseClient.from('region_monthly_data').select('*'),
                supabaseClient.from('pois').select('*').order('name')
            ]);

            if (regionsRes.error) throw regionsRes.error;
            if (monthlyRes.error) throw monthlyRes.error;
            if (poisRes.error) throw poisRes.error;

            const allMonthlyData = monthlyRes.data || [];

            const formattedRegions = (regionsRes.data || []).map((r) => {
                const monthlyDataForRegion = allMonthlyData.filter(m => m.region_id === r.id);
                const monthlyObj: any = {};

                monthlyDataForRegion.forEach((m) => {
                    monthlyObj[m.month] = {
                        weatherScore: m.weather_score,
                        costScore: m.cost_score,
                        recommendedScore: m.recommended_score,
                        weatherDesc: m.weather_desc,
                        weatherDescPt: m.weather_desc_pt,
                        avgDailyCost: m.avg_daily_cost,
                        highlights: m.highlights,
                        highlightsPt: m.highlights_pt,
                        whyVisit: m.why_visit,
                        whyVisitPt: m.why_visit_pt
                    };
                });

                return {
                    type: "Feature",
                    properties: {
                        id: r.id,
                        name: r.name,
                        namePt: r.name_pt,
                        country: r.country,
                        description: r.description,
                        descriptionPt: r.description_pt,
                        monthlyData: monthlyObj
                    },
                    geometry: r.geometry_geojson || { type: "Polygon", coordinates: [[[]]] }
                };
            });

            setRegions(formattedRegions);

            const formattedPois = (poisRes.data || []).map((p) => ({
                type: "Feature",
                properties: {
                    id: p.id,
                    name: p.name,
                    namePt: p.name_pt,
                    description: p.description,
                    descriptionPt: p.description_pt,
                    bestTime: p.best_time,
                    bestTimePt: p.best_time_pt,
                    category: p.category,
                    imageUrl: p.image_url,
                    imageGallery: p.image_gallery,
                    caraiqbonito: p.caraiqbonito,
                    priority: p.priority
                },
                geometry: { type: "Point", coordinates: [p.lng, p.lat] }
            }));

            setPois(formattedPois);

        } catch (e: any) {
            console.error(e);
            toast.error(`Failed to fetch data: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const openEditor = (target: 'region' | 'poi', mode: 'add' | 'edit', item?: any) => {
        setEditorTarget(target);
        setEditorMode(mode);
        setEditorError('');
        setSelectedMonth(1);

        if (mode === 'edit' && item) {
            setEditorId(item.properties.id);
            // Deep copy to avoid mutating state directly
            setFormData(JSON.parse(JSON.stringify(item)));
        } else {
            setEditorId('');
            if (target === 'region') {
                const initialMonthlyData: any = {};
                for (let i = 1; i <= 12; i++) {
                    initialMonthlyData[i] = {
                        weatherScore: 5, costScore: 5, recommendedScore: 5, weatherDesc: "", weatherDescPt: "", avgDailyCost: 100, highlights: [], highlightsPt: [], whyVisit: "", whyVisitPt: ""
                    };
                }
                setFormData({
                    type: "Feature",
                    properties: { id: "", name: "", namePt: "", country: "", description: "", descriptionPt: "", monthlyData: initialMonthlyData },
                    geometry: { type: "Polygon", coordinates: [[[]]] }
                });
            } else {
                setFormData({
                    type: "Feature",
                    properties: { id: "", name: "", namePt: "", description: "", descriptionPt: "", bestTime: "", bestTimePt: "", category: "nature", imageUrl: "", imageGallery: [], caraiqbonito: false },
                    geometry: { type: "Point", coordinates: [0, 0] }
                });
            }
        }
    };

    const computeRecommended = (weather: number, cost: number) =>
        Math.round((weather * 0.6 + cost * 0.4) * 10) / 10;

    const saveEditor = async () => {
        setIsSaving(true);
        setEditorError("");
        try {
            if (!formData.properties || !formData.properties.id) {
                throw new Error("ID is required.");
            }

            const parsed = formData;

            if (editorTarget === 'region') {
                if (editorMode === 'add' && regions.find(r => r.properties.id === parsed.properties.id)) {
                    throw new Error("Region ID already exists");
                }

                const dbRegion = {
                    id: parsed.properties.id,
                    name: parsed.properties.name,
                    name_pt: parsed.properties.namePt || null,
                    country: parsed.properties.country,
                    description: parsed.properties.description,
                    description_pt: parsed.properties.descriptionPt || null,
                    geometry_geojson: parsed.geometry
                };

                const { error: regionErr } = await supabaseClient.from('regions').upsert(dbRegion);
                if (regionErr) throw regionErr;

                const monthlyRecords = [];
                for (let i = 1; i <= 12; i++) {
                    const mData = parsed.properties.monthlyData[i];
                    if (mData) {
                        const w = Number(mData.weatherScore || 5);
                        const c = Number(mData.costScore || 5);
                        const rec = computeRecommended(w, c);
                        mData.recommendedScore = rec; // Update memory for immediate UI check if any

                        monthlyRecords.push({
                            region_id: parsed.properties.id,
                            month: i,
                            weather_score: w,
                            cost_score: c,
                            recommended_score: rec,
                            weather_desc: mData.weatherDesc || "",
                            weather_desc_pt: mData.weatherDescPt || null,
                            avg_daily_cost: Number(mData.avgDailyCost || 0),
                            highlights: mData.highlights || [],
                            highlights_pt: mData.highlightsPt || [],
                            why_visit: mData.whyVisit || "",
                            why_visit_pt: mData.whyVisitPt || null
                        });
                    }
                }

                if (monthlyRecords.length > 0) {
                    const { error: mdErr } = await supabaseClient.from('region_monthly_data').upsert(monthlyRecords);
                    if (mdErr) throw mdErr;
                }

                toast.success(`Region ${editorMode === 'add' ? 'added' : 'updated'} successfully!`);

            } else if (editorTarget === 'poi') {
                if (editorMode === 'add' && pois.find(p => p.properties.id === parsed.properties.id)) {
                    throw new Error("POI ID already exists");
                }

                const lng = Number(parsed.geometry.coordinates[0] || 0);
                const lat = Number(parsed.geometry.coordinates[1] || 0);

                const dbPoi = {
                    id: parsed.properties.id,
                    name: parsed.properties.name,
                    name_pt: parsed.properties.namePt || null,
                    description: parsed.properties.description,
                    description_pt: parsed.properties.descriptionPt || null,
                    best_time: parsed.properties.bestTime || "",
                    best_time_pt: parsed.properties.bestTimePt || null,
                    category: parsed.properties.category || "nature",
                    lat: lat,
                    lng: lng,
                    image_url: parsed.properties.imageUrl || null,
                    image_gallery: parsed.properties.imageGallery || [],
                    caraiqbonito: !!parsed.properties.caraiqbonito,
                    priority: parsed.properties.priority !== undefined ? parsed.properties.priority : (parsed.properties.caraiqbonito ? 0 : 5)
                };

                const { error: poiErr } = await supabaseClient.from('pois').upsert(dbPoi);
                if (poiErr) throw poiErr;

                toast.success(`POI ${editorMode === 'add' ? 'added' : 'updated'} successfully!`);
            }

            await fetchData();
            setEditorTarget(null);

        } catch (e: any) {
            console.error("Save error:", e);
            setEditorError(e.message || "Error saving form");
            toast.error(e.message || "Error saving form");
        } finally {
            setIsSaving(false);
        }
    };

    const deleteItem = async (target: 'region' | 'poi', id: string) => {
        if (!window.confirm(`Are you sure you want to delete this ${target}? This cannot be undone.`)) return;

        try {
            if (target === 'region') {
                // Delete monthly data first to avoid foreign key conflicts
                await supabaseClient.from('region_monthly_data').delete().eq('region_id', id);

                const { data, error } = await supabaseClient.from('regions').delete().eq('id', id).select('*');
                if (error) throw error;
                if (!data || data.length === 0) throw new Error("Could not delete region. You might be missing VITE_SUPABASE_SERVICE_ROLE_KEY in your .env file.");

                toast.success("Region deleted successfully.");
            } else {
                const { data, error } = await supabaseClient.from('pois').delete().eq('id', id).select('*');
                if (error) throw error;
                if (!data || data.length === 0) throw new Error("Could not delete POI. You might be missing VITE_SUPABASE_SERVICE_ROLE_KEY in your .env file.");

                toast.success("POI deleted successfully.");
            }
            await fetchData();
        } catch (e: any) {
            console.error(e);
            toast.error(`Failed to delete: ${e.message}`);
        }
    };

    const updateProp = (field: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            properties: { ...prev.properties, [field]: value }
        }));
    };

    const updateMonth = (month: number, field: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            properties: {
                ...prev.properties,
                monthlyData: {
                    ...prev.properties.monthlyData,
                    [month]: {
                        ...prev.properties.monthlyData[month],
                        [field]: value
                    }
                }
            }
        }));
    };

    if (!isLocal) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-red-500/30 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl flex flex-col items-center">
                    <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
                        <ShieldAlert className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                    <p className="text-slate-400 mb-6 flex flex-col items-center gap-2">
                        <span>The admin dashboard is only accessible in local development environments.</span>
                        <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-300">
                            Current Host: {window.location.hostname}
                        </span>
                    </p>
                    <a href="/" className="inline-flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors">
                        Return to Map
                    </a>
                </div>
            </div>
        );
    }

    if (loading && Object.keys(regions).length === 0 && Object.keys(pois).length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-500 font-medium">Loading Database...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <h1 className="text-xl font-bold">Wanderlust Admin Mode</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-semibold px-2.5 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            Local Dev
                        </span>
                        <a href="/" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                            Exit to Map
                        </a>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Tabs */}
                <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-lg mb-8 w-fit">
                    <button
                        onClick={() => setActiveTab('regions')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-all ${activeTab === 'regions' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
                    >
                        <Globe className="w-4 h-4" />
                        Regions ({regions.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('pois')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-all ${activeTab === 'pois' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
                    >
                        <MapPin className="w-4 h-4" />
                        POIs ({pois.length})
                    </button>
                </div>

                {/* Content Area */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

                    {/* Toolbar */}
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            {activeTab === 'regions' ? 'Manage Regions' : 'Manage Points of Interest'}
                        </h2>
                        <button
                            onClick={() => openEditor(activeTab === 'regions' ? 'region' : 'poi', 'add')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add {activeTab === 'regions' ? 'Region' : 'POI'}
                        </button>
                    </div>

                    {/* List */}
                    {loading ? (
                        <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                            Refreshing data...
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {(activeTab === 'regions' ? regions : pois).length === 0 ? (
                                <div className="p-12 text-center text-slate-500 bg-slate-50/50">
                                    No {activeTab} found. Create one to get started!
                                </div>
                            ) : (
                                (activeTab === 'regions' ? regions : pois).map((item, i) => (
                                    <div key={i} className="p-4 flex items-center justify-between hover:bg-blue-50/50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                                {activeTab === 'regions' ? <Globe className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 flex items-center gap-2">
                                                    {item.properties.name}
                                                    {item.properties.namePt && <span className="text-xs font-normal px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">{item.properties.namePt}</span>}
                                                </div>
                                                <div className="text-sm text-slate-500 font-mono mt-0.5">
                                                    {item.properties.id}
                                                    {activeTab === 'pois' && <span className="ml-2 uppercase text-xs font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{item.properties.category}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEditor(activeTab === 'regions' ? 'region' : 'poi', 'edit', item)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteItem(activeTab === 'regions' ? 'region' : 'poi', item.properties.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Editor Modal */}
            {editorTarget && formData && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh] overflow-hidden">

                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 shrink-0 rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${editorMode === 'add' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {editorMode === 'add' ? <Plus className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">
                                    {editorMode === 'add' ? 'Create New' : 'Edit'} {editorTarget === 'region' ? 'Region' : 'Point of Interest'}
                                </h3>
                            </div>
                            <button onClick={() => setEditorTarget(null)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-0 flex-1 overflow-y-auto bg-slate-50/30">
                            {editorError && (
                                <div className="m-6 mb-0 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-start gap-3 text-sm">
                                    <ShieldAlert className="w-5 h-5 shrink-0" />
                                    <div>
                                        <h4 className="font-bold">Error saving data</h4>
                                        <p>{editorError}</p>
                                    </div>
                                </div>
                            )}

                            {/* POI FORM */}
                            {editorTarget === 'poi' && (
                                <div className="p-6 space-y-8">

                                    {/* 1. Identification */}
                                    <section>
                                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <Info className="w-4 h-4 text-slate-400" /> Basic Information
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                                            <div className="col-span-1 md:col-span-2">
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Unique ID <span className="text-red-500">*</span></label>
                                                <input type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm" placeholder="e.g. christ-redeemer" value={formData.properties.id} onChange={e => updateProp('id', e.target.value.toLowerCase().replace(/\s+/g, '-'))} disabled={editorMode === 'edit'} />
                                                <p className="text-xs text-slate-500 mt-1">Used for database relations and URLs. Lowercase, no spaces.</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Name (English) <span className="text-red-500">*</span></label>
                                                <input type="text" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Christ the Redeemer" value={formData.properties.name} onChange={e => updateProp('name', e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Name (Portuguese)</label>
                                                <input type="text" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Cristo Redentor" value={formData.properties.namePt || ''} onChange={e => updateProp('namePt', e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description (English) <span className="text-red-500">*</span></label>
                                                <textarea className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y min-h-[100px]" placeholder="An iconic Art Deco statue..." value={formData.properties.description} onChange={e => updateProp('description', e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description (Portuguese)</label>
                                                <textarea className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y min-h-[100px]" placeholder="Uma estátua Art Déco icônica..." value={formData.properties.descriptionPt || ''} onChange={e => updateProp('descriptionPt', e.target.value)} />
                                            </div>
                                        </div>
                                    </section>

                                    {/* 2. Details */}
                                    <section>
                                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-400" /> Categorization & Timing
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Best Time (EN)</label>
                                                <input type="text" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Early morning" value={formData.properties.bestTime || ''} onChange={e => updateProp('bestTime', e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Best Time (PT)</label>
                                                <input type="text" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Início da manhã" value={formData.properties.bestTimePt || ''} onChange={e => updateProp('bestTimePt', e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Category <span className="text-red-500">*</span></label>
                                                <select className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white" value={formData.properties.category} onChange={e => updateProp('category', e.target.value)}>
                                                    <option value="landmark">Landmark (Monument, Statue)</option>
                                                    <option value="nature">Nature (Park, Waterfall)</option>
                                                    <option value="culture">Culture (Museum, Historic)</option>
                                                    <option value="beach">Beach / Coast</option>
                                                    <option value="city">City / Urban</option>
                                                    <option value="wonder">World Wonder</option>
                                                    <option value="natural_wonder">Natural Wonder</option>
                                                </select>
                                            </div>
                                        </div>
                                    </section>

                                    {/* 3. Media & Location */}
                                    <section>
                                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <ImageIcon className="w-4 h-4 text-slate-400" /> Media & Location
                                        </h4>
                                        <div className="grid grid-cols-1 gap-6 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Coordinates</label>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1">
                                                            <div className="relative">
                                                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs font-mono">LNG</span>
                                                                <input type="number" step="any" className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2" placeholder="-43.2105" value={formData.geometry.coordinates[0]} onChange={e => setFormData({ ...formData, geometry: { ...formData.geometry, coordinates: [parseFloat(e.target.value) || 0, formData.geometry.coordinates[1]] } })} />
                                                            </div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="relative">
                                                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs font-mono">LAT</span>
                                                                <input type="number" step="any" className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2" placeholder="-22.9519" value={formData.geometry.coordinates[1]} onChange={e => setFormData({ ...formData, geometry: { ...formData.geometry, coordinates: [formData.geometry.coordinates[0], parseFloat(e.target.value) || 0] } })} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1.5 flex justify-between">
                                                        Main Image URL
                                                        {formData.properties.imageUrl && <a href={formData.properties.imageUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs">Preview</a>}
                                                    </label>
                                                    <input type="url" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://..." value={formData.properties.imageUrl || ''} onChange={e => updateProp('imageUrl', e.target.value)} />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Gallery URLs (Comma separated)</label>
                                                <textarea className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm" rows={2} placeholder="https://img1.jpg, https://img2.jpg"
                                                    key={`gallery-${formData.properties.id}`}
                                                    defaultValue={(formData.properties.imageGallery || []).join(',\n')}
                                                    onBlur={e => updateProp('imageGallery', e.target.value.split(',').map((s: string) => s.trim().replace(/\n/g, '')).filter(Boolean))} />
                                            </div>

                                            <label className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl cursor-pointer hover:shadow-md transition-shadow">
                                                <div className="relative flex items-center justify-center">
                                                    <input type="checkbox" className="w-6 h-6 border-2 border-amber-300 rounded text-orange-500 focus:ring-orange-500 outline-none cursor-pointer accent-orange-500"
                                                        checked={!!formData.properties.caraiqbonito}
                                                        onChange={e => updateProp('caraiqbonito', e.target.checked)} />
                                                </div>
                                                <div>
                                                    <span className="block font-bold text-amber-900 leading-none mb-1">CaraiQBonito Stamp</span>
                                                    <span className="block text-xs text-amber-700">Mark this POI as a personal highlight/visited location.</span>
                                                </div>
                                            </label>

                                        </div>
                                    </section>
                                </div>
                            )}

                            {/* REGION FORM */}
                            {editorTarget === 'region' && (
                                <div className="p-6 space-y-8">
                                    {/* 1. Identification */}
                                    <section>
                                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-slate-400" /> Region Details
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                                            <div className="col-span-1">
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Unique ID <span className="text-red-500">*</span></label>
                                                <input type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm outline-none" value={formData.properties.id} onChange={e => updateProp('id', e.target.value.toLowerCase().replace(/\s+/g, '-'))} disabled={editorMode === 'edit'} />
                                            </div>
                                            <div className="col-span-1">
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Country Code</label>
                                                <input type="text" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. BR, US, JP" value={formData.properties.country || ''} onChange={e => updateProp('country', e.target.value)} />
                                            </div>
                                            <div className="col-span-3 grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Name (EN) <span className="text-red-500">*</span></label>
                                                    <input type="text" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.properties.name} onChange={e => updateProp('name', e.target.value)} />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Name (PT)</label>
                                                    <input type="text" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.properties.namePt || ''} onChange={e => updateProp('namePt', e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="col-span-3 grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Description (EN)</label>
                                                    <textarea className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]" value={formData.properties.description || ''} onChange={e => updateProp('description', e.target.value)} />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Description (PT)</label>
                                                    <textarea className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]" value={formData.properties.descriptionPt || ''} onChange={e => updateProp('descriptionPt', e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="col-span-3 border-t border-slate-100 pt-6">
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                                                    <MapIcon className="w-4 h-4 text-slate-400" /> GeoJSON Polygon Coordinates
                                                </label>
                                                <textarea className="w-full px-4 py-3 bg-slate-900 text-slate-300 rounded-lg font-mono text-xs outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]" value={JSON.stringify(formData.geometry.coordinates)} onChange={e => {
                                                    try {
                                                        const parsed = JSON.parse(e.target.value);
                                                        setFormData({ ...formData, geometry: { ...formData.geometry, coordinates: parsed } });
                                                    } catch (err) { /* ignore invalid JSON while typing */ }
                                                }} />
                                                <p className="text-xs text-slate-500 mt-2">Must be valid JSON array: <code className="bg-slate-100 px-1 rounded text-slate-700">[[[lon, lat], ...]]</code></p>
                                            </div>
                                        </div>
                                    </section>

                                    {/* 2. Monthly Data */}
                                    <section>
                                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-400" /> Monthly Analytics
                                        </h4>

                                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                            {/* Month Tabs */}
                                            <div className="flex overflow-x-auto bg-slate-50 border-b border-slate-200 no-scrollbar">
                                                {MONTHS.map((monthName, index) => {
                                                    const mIndex = index + 1;
                                                    const isActive = selectedMonth === mIndex;
                                                    return (
                                                        <button
                                                            key={mIndex}
                                                            className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex-1 ${isActive ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                                                            onClick={() => setSelectedMonth(mIndex)}
                                                        >
                                                            {monthName}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Month Content */}
                                            {formData.properties.monthlyData[selectedMonth] && (
                                                <div className="p-6">
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                                                        <div className="space-y-6">
                                                            <div className="grid grid-cols-3 gap-4">
                                                                <div>
                                                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Weather Score <span className="text-slate-400 font-normal">(1-10)</span></label>
                                                                    <input type="number" min="1" max="10" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center font-medium bg-slate-50 focus:bg-white"
                                                                        value={formData.properties.monthlyData[selectedMonth].weatherScore || 5}
                                                                        onChange={e => updateMonth(selectedMonth, 'weatherScore', Number(e.target.value))} />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Cost Score <span className="text-slate-400 font-normal">(1-10)</span></label>
                                                                    <input type="number" min="1" max="10" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center font-medium bg-slate-50 focus:bg-white"
                                                                        value={formData.properties.monthlyData[selectedMonth].costScore || 5}
                                                                        onChange={e => updateMonth(selectedMonth, 'costScore', Number(e.target.value))} />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Daily Cost ($)</label>
                                                                    <input type="number" min="0" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center font-medium bg-slate-50 focus:bg-white text-emerald-700"
                                                                        value={formData.properties.monthlyData[selectedMonth].avgDailyCost || 0}
                                                                        onChange={e => updateMonth(selectedMonth, 'avgDailyCost', Number(e.target.value))} />
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Weather Desc (EN)</label>
                                                                    <input type="text" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                                        value={formData.properties.monthlyData[selectedMonth].weatherDesc || ''}
                                                                        onChange={e => updateMonth(selectedMonth, 'weatherDesc', e.target.value)} />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Weather Desc (PT)</label>
                                                                    <input type="text" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                                        value={formData.properties.monthlyData[selectedMonth].weatherDescPt || ''}
                                                                        onChange={e => updateMonth(selectedMonth, 'weatherDescPt', e.target.value)} />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-6">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Highlights (EN, comma separated)</label>
                                                                    <textarea className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px] text-sm"
                                                                        key={`highlights-${formData.properties.id}-${selectedMonth}-en`}
                                                                        defaultValue={(formData.properties.monthlyData[selectedMonth].highlights || []).join(', ')}
                                                                        onBlur={e => updateMonth(selectedMonth, 'highlights', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Highlights (PT, comma separated)</label>
                                                                    <textarea className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px] text-sm"
                                                                        key={`highlights-${formData.properties.id}-${selectedMonth}-pt`}
                                                                        defaultValue={(formData.properties.monthlyData[selectedMonth].highlightsPt || []).join(', ')}
                                                                        onBlur={e => updateMonth(selectedMonth, 'highlightsPt', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
                                                                </div>
                                                                <div className="col-span-2 grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Why Visit? (EN)</label>
                                                                        <textarea className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] text-sm"
                                                                            value={formData.properties.monthlyData[selectedMonth].whyVisit || ''}
                                                                            onChange={e => updateMonth(selectedMonth, 'whyVisit', e.target.value)} />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Why Visit? (PT)</label>
                                                                        <textarea className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] text-sm"
                                                                            value={formData.properties.monthlyData[selectedMonth].whyVisitPt || ''}
                                                                            onChange={e => updateMonth(selectedMonth, 'whyVisitPt', e.target.value)} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </div>
                            )}

                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-white shrink-0 rounded-b-2xl">
                            <button onClick={() => setEditorTarget(null)} className="px-6 py-2.5 rounded-lg text-slate-600 font-medium hover:bg-slate-100 transition-colors" disabled={isSaving}>
                                Cancel
                            </button>
                            <button onClick={saveEditor} disabled={isSaving} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                                {isSaving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save {editorTarget === 'region' ? 'Region' : 'POI'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
