import { useState, useEffect } from 'react';

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

export default function Admin() {
    const [regions, setRegions] = useState<any[]>([]);
    const [pois, setPois] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [editorTarget, setEditorTarget] = useState<'region' | 'poi' | null>(null);
    const [editorMode, setEditorMode] = useState<'add' | 'edit'>('add');
    const [editorId, setEditorId] = useState<string>('');
    const [formData, setFormData] = useState<any>(null);
    const [editorError, setEditorError] = useState<string>('');

    const [selectedMonth, setSelectedMonth] = useState<number>(1);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const resRegions = await fetch('/api/regions');
            const dataRegions = await resRegions.json();
            setRegions(dataRegions);

            const resPois = await fetch('/api/pois');
            const dataPois = await resPois.json();
            setPois(dataPois);

            setLoading(false);
        } catch (e) {
            console.error(e);
            alert('Failed to fetch data. Make sure you are running npm run dev locally.');
        }
    };

    const handleSaveData = async (type: 'region' | 'poi', data: any[]) => {
        try {
            await fetch(`/api/${type}s`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (type === 'region') setRegions(data);
            if (type === 'poi') setPois(data);
        } catch (e) {
            alert(`Error saving ${type}s`);
        }
    };

    const openEditor = (target: 'region' | 'poi', mode: 'add' | 'edit', item?: any) => {
        setEditorTarget(target);
        setEditorMode(mode);
        setEditorError('');
        setSelectedMonth(1);

        if (mode === 'edit' && item) {
            setEditorId(item.properties.id);
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

    const saveEditor = () => {
        try {
            if (!formData.properties || !formData.properties.id) {
                setEditorError("ID is required.");
                return;
            }

            const parsed = formData;

            if (editorTarget === 'region') {
                // Recompute recommended scores just in case
                for (let i = 1; i <= 12; i++) {
                    if (parsed.properties.monthlyData[i]) {
                        const w = Number(parsed.properties.monthlyData[i].weatherScore);
                        const c = Number(parsed.properties.monthlyData[i].costScore);
                        parsed.properties.monthlyData[i].recommendedScore = computeRecommended(w, c);
                    }
                }

                let newData = [...regions];
                if (editorMode === 'edit') {
                    newData = newData.map(r => r.properties.id === editorId ? parsed : r);
                } else {
                    if (newData.find(r => r.properties.id === parsed.properties.id)) {
                        setEditorError("ID already exists");
                        return;
                    }
                    newData.push(parsed);
                }
                handleSaveData('region', newData);
            } else if (editorTarget === 'poi') {
                let newData = [...pois];
                if (editorMode === 'edit') {
                    newData = newData.map(p => p.properties.id === editorId ? parsed : p);
                } else {
                    if (newData.find(p => p.properties.id === parsed.properties.id)) {
                        setEditorError("ID already exists");
                        return;
                    }
                    newData.push(parsed);
                }
                handleSaveData('poi', newData);
            }

            setEditorTarget(null);
        } catch (e: any) {
            setEditorError("Error saving form: " + e.message);
        }
    };

    const deleteItem = (target: 'region' | 'poi', id: string) => {
        if (!window.confirm("Are you sure?")) return;
        if (target === 'region') {
            const newData = regions.filter(r => r.properties.id !== id);
            handleSaveData('region', newData);
        } else {
            const newData = pois.filter(p => p.properties.id !== id);
            handleSaveData('poi', newData);
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

    if (loading) return <div className="p-8">Loading data...</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto text-slate-800">
            <h1 className="text-3xl font-bold mb-8">Local Data Admin</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Regions */}
                <div className="border border-slate-200 rounded-lg p-6 bg-slate-50">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Regions ({regions.length})</h2>
                        <button onClick={() => openEditor('region', 'add')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add Region</button>
                    </div>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {regions.map((r, i) => (
                            <div key={i} className="bg-white p-4 rounded shadow-sm border flex justify-between items-center">
                                <div>
                                    <div className="font-bold">{r.properties.name}</div>
                                    <div className="text-sm text-slate-500">{r.properties.id}</div>
                                </div>
                                <div className="space-x-2">
                                    <button onClick={() => openEditor('region', 'edit', r)} className="text-blue-600 hover:underline">Edit</button>
                                    <button onClick={() => deleteItem('region', r.properties.id)} className="text-red-600 hover:underline">Del</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* POIs */}
                <div className="border border-slate-200 rounded-lg p-6 bg-slate-50">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">POIs ({pois.length})</h2>
                        <button onClick={() => openEditor('poi', 'add')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add POI</button>
                    </div>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {pois.map((p, i) => (
                            <div key={i} className="bg-white p-4 rounded shadow-sm border flex justify-between items-center">
                                <div>
                                    <div className="font-bold">{p.properties.name}</div>
                                    <div className="text-sm text-slate-500">{p.properties.id} - {p.properties.category}</div>
                                </div>
                                <div className="space-x-2">
                                    <button onClick={() => openEditor('poi', 'edit', p)} className="text-blue-600 hover:underline">Edit</button>
                                    <button onClick={() => deleteItem('poi', p.properties.id)} className="text-red-600 hover:underline">Del</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Editor Modal */}
            {editorTarget && formData && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b flex justify-between items-center shrink-0">
                            <h3 className="text-xl font-bold">
                                {editorMode === 'add' ? 'Add' : 'Edit'} {editorTarget === 'region' ? 'Region' : 'POI'}
                            </h3>
                            <button onClick={() => setEditorTarget(null)} className="text-slate-500 hover:text-black font-bold text-xl">&times;</button>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto">
                            {editorError && <div className="mb-4 bg-red-100 text-red-700 p-3 rounded">{editorError}</div>}

                            {editorTarget === 'poi' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">ID (unique)</label>
                                            <input type="text" className="w-full p-2 border rounded" value={formData.properties.id} onChange={e => updateProp('id', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Name (EN)</label>
                                            <input type="text" className="w-full p-2 border rounded" value={formData.properties.name} onChange={e => updateProp('name', e.target.value)} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Name (PT)</label>
                                        <input type="text" className="w-full p-2 border rounded" value={formData.properties.namePt || ''} onChange={e => updateProp('namePt', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Description (EN)</label>
                                        <textarea className="w-full p-2 border rounded" rows={3} value={formData.properties.description} onChange={e => updateProp('description', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Description (PT)</label>
                                        <textarea className="w-full p-2 border rounded" rows={3} value={formData.properties.descriptionPt || ''} onChange={e => updateProp('descriptionPt', e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Best Time to Visit (EN)</label>
                                            <input type="text" className="w-full p-2 border rounded" value={formData.properties.bestTime} onChange={e => updateProp('bestTime', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Best Time to Visit (PT)</label>
                                            <input type="text" className="w-full p-2 border rounded" value={formData.properties.bestTimePt || ''} onChange={e => updateProp('bestTimePt', e.target.value)} />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium mb-1">Category</label>
                                            <select className="w-full p-2 border rounded" value={formData.properties.category} onChange={e => updateProp('category', e.target.value)}>
                                                <option value="landmark">Landmark</option>
                                                <option value="nature">Nature</option>
                                                <option value="culture">Culture</option>
                                                <option value="beach">Beach</option>
                                                <option value="city">City</option>
                                                <option value="wonder">Wonder</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Image URL (Main thumbnail)</label>
                                            <input type="text" className="w-full p-2 border rounded" value={formData.properties.imageUrl || ''} onChange={e => updateProp('imageUrl', e.target.value)} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Image Gallery URLs (comma separated)</label>
                                        <textarea className="w-full p-2 border rounded" rows={2} placeholder="https://img1.jpg, https://img2.jpg"
                                            key={`gallery-${formData.properties.id}`}
                                            defaultValue={(formData.properties.imageGallery || []).join(', ')}
                                            onBlur={e => updateProp('imageGallery', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))} />
                                    </div>
                                    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded text-blue-900">
                                        <input type="checkbox" id="caraiqbonito" className="w-5 h-5 accent-blue-600"
                                            checked={!!formData.properties.caraiqbonito}
                                            onChange={e => updateProp('caraiqbonito', e.target.checked)} />
                                        <label htmlFor="caraiqbonito" className="font-bold cursor-pointer">CaraiQBonito Stamp (I was there!)</label>
                                    </div>
                                    <div className="p-4 bg-slate-100 rounded">
                                        <h4 className="font-bold mb-2">Map Location (Longitude, Latitude)</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs uppercase mb-1">Longitude</label>
                                                <input type="number" step="any" className="w-full p-2 border rounded" value={formData.geometry.coordinates[0]} onChange={e => setFormData({ ...formData, geometry: { ...formData.geometry, coordinates: [parseFloat(e.target.value) || 0, formData.geometry.coordinates[1]] } })} />
                                            </div>
                                            <div>
                                                <label className="block text-xs uppercase mb-1">Latitude</label>
                                                <input type="number" step="any" className="w-full p-2 border rounded" value={formData.geometry.coordinates[1]} onChange={e => setFormData({ ...formData, geometry: { ...formData.geometry, coordinates: [formData.geometry.coordinates[0], parseFloat(e.target.value) || 0] } })} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {editorTarget === 'region' && (
                                <div className="space-y-6">
                                    {/* General Info */}
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-bold border-b pb-2">General Information</h4>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="col-span-1">
                                                <label className="block text-sm font-medium mb-1">ID (unique)</label>
                                                <input type="text" className="w-full p-2 border rounded" value={formData.properties.id} onChange={e => updateProp('id', e.target.value)} />
                                            </div>
                                            <div className="col-span-1">
                                                <label className="block text-sm font-medium mb-1">Name (EN)</label>
                                                <input type="text" className="w-full p-2 border rounded" value={formData.properties.name} onChange={e => updateProp('name', e.target.value)} />
                                            </div>
                                            <div className="col-span-1">
                                                <label className="block text-sm font-medium mb-1">Name (PT)</label>
                                                <input type="text" className="w-full p-2 border rounded" value={formData.properties.namePt || ''} onChange={e => updateProp('namePt', e.target.value)} />
                                            </div>
                                            <div className="col-span-1">
                                                <label className="block text-sm font-medium mb-1">Country / Area</label>
                                                <input type="text" className="w-full p-2 border rounded" value={formData.properties.country} onChange={e => updateProp('country', e.target.value)} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Description (EN)</label>
                                            <textarea className="w-full p-2 border rounded" rows={3} value={formData.properties.description} onChange={e => updateProp('description', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Description (PT)</label>
                                            <textarea className="w-full p-2 border rounded" rows={3} value={formData.properties.descriptionPt || ''} onChange={e => updateProp('descriptionPt', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Polygon Coordinates (JSON Array format)</label>
                                            <textarea className="w-full p-2 border rounded font-mono text-xs" rows={3} value={JSON.stringify(formData.geometry.coordinates)} onChange={e => {
                                                try {
                                                    const parsed = JSON.parse(e.target.value);
                                                    setFormData({ ...formData, geometry: { ...formData.geometry, coordinates: parsed } });
                                                } catch (err) { } // Just ignore valid typing
                                            }} />
                                            <p className="text-xs text-slate-500 mt-1">Example: [[[lon1, lat1], [lon2, lat2], [lon1, lat1]]]</p>
                                        </div>
                                    </div>

                                    {/* Monthly Data */}
                                    <div>
                                        <h4 className="text-lg font-bold border-b pb-2 mb-4">Monthly Data</h4>
                                        <div className="flex border-b mb-4 overflow-x-auto">
                                            {MONTHS.map((monthName, index) => {
                                                const mIndex = index + 1;
                                                return (
                                                    <button
                                                        key={mIndex}
                                                        className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap ${selectedMonth === mIndex ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:bg-slate-50'}`}
                                                        onClick={() => setSelectedMonth(mIndex)}
                                                    >
                                                        {monthName}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {formData.properties.monthlyData[selectedMonth] && (
                                            <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded border">
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-xs uppercase mb-1 font-bold">Weather Score (1-10)</label>
                                                            <input type="number" min="1" max="10" className="w-full p-2 border rounded bg-white"
                                                                value={formData.properties.monthlyData[selectedMonth].weatherScore}
                                                                onChange={e => updateMonth(selectedMonth, 'weatherScore', Number(e.target.value))} />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs uppercase mb-1 font-bold">Cost Score (1-10)</label>
                                                            <input type="number" min="1" max="10" className="w-full p-2 border rounded bg-white"
                                                                value={formData.properties.monthlyData[selectedMonth].costScore}
                                                                onChange={e => updateMonth(selectedMonth, 'costScore', Number(e.target.value))} />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">Weather Description (EN)</label>
                                                        <input type="text" className="w-full p-2 border rounded bg-white"
                                                            value={formData.properties.monthlyData[selectedMonth].weatherDesc}
                                                            onChange={e => updateMonth(selectedMonth, 'weatherDesc', e.target.value)} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">Weather Description (PT)</label>
                                                        <input type="text" className="w-full p-2 border rounded bg-white"
                                                            value={formData.properties.monthlyData[selectedMonth].weatherDescPt || ''}
                                                            onChange={e => updateMonth(selectedMonth, 'weatherDescPt', e.target.value)} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">Average Daily Cost (USD)</label>
                                                        <input type="number" className="w-full p-2 border rounded bg-white"
                                                            value={formData.properties.monthlyData[selectedMonth].avgDailyCost}
                                                            onChange={e => updateMonth(selectedMonth, 'avgDailyCost', Number(e.target.value))} />
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">Highlights (EN) (comma separated)</label>
                                                        <textarea className="w-full p-2 border rounded bg-white" rows={2}
                                                            key={`highlights-${formData.properties.id}-${selectedMonth}-en`}
                                                            defaultValue={formData.properties.monthlyData[selectedMonth].highlights?.join(', ')}
                                                            onBlur={e => updateMonth(selectedMonth, 'highlights', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">Highlights (PT) (comma separated)</label>
                                                        <textarea className="w-full p-2 border rounded bg-white" rows={2}
                                                            key={`highlights-${formData.properties.id}-${selectedMonth}-pt`}
                                                            defaultValue={(formData.properties.monthlyData[selectedMonth].highlightsPt || []).join(', ')}
                                                            onBlur={e => updateMonth(selectedMonth, 'highlightsPt', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">Why Visit This Month (EN)</label>
                                                        <textarea className="w-full p-2 border rounded bg-white" rows={3}
                                                            value={formData.properties.monthlyData[selectedMonth].whyVisit}
                                                            onChange={e => updateMonth(selectedMonth, 'whyVisit', e.target.value)} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">Why Visit This Month (PT)</label>
                                                        <textarea className="w-full p-2 border rounded bg-white" rows={3}
                                                            value={formData.properties.monthlyData[selectedMonth].whyVisitPt || ''}
                                                            onChange={e => updateMonth(selectedMonth, 'whyVisitPt', e.target.value)} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>

                        <div className="p-4 border-t flex justify-end space-x-4 shrink-0 bg-slate-50 rounded-b-xl">
                            <button onClick={() => setEditorTarget(null)} className="px-6 py-2 border rounded bg-white hover:bg-slate-100 font-medium">
                                Cancel
                            </button>
                            <button onClick={saveEditor} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold shadow-sm">
                                Save {editorTarget === 'region' ? 'Region' : 'POI'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
