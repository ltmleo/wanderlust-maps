const fs = require('fs');
const path = require('path');

const poisPath = path.join(__dirname, 'src/data/pois.json');
const regionsPath = path.join(__dirname, 'src/data/regions.json');

const pois = JSON.parse(fs.readFileSync(poisPath, 'utf8'));
const regions = JSON.parse(fs.readFileSync(regionsPath, 'utf8'));

const newPois = [
    {
        "type": "Feature",
        "properties": {
            "id": "poi-eiffel",
            "name": "Eiffel Tower",
            "namePt": "Torre Eiffel",
            "description": "Wrought-iron lattice tower on the Champ de Mars in Paris, named after the engineer Gustave Eiffel.",
            "descriptionPt": "Torre de treliça de ferro fundido no Champ de Mars em Paris, nomeada em homenagem ao engenheiro Gustave Eiffel.",
            "bestTime": "Spring (April-May) or Autumn (Sept-Oct) for mild weather.",
            "bestTimePt": "Primavera (Abril-Maio) ou Outono (Set-Out) para clima ameno.",
            "category": "landmark",
            "imageUrl": "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&q=80&w=800"
        },
        "geometry": { "type": "Point", "coordinates": [2.2945, 48.8584] }
    },
    {
        "type": "Feature",
        "properties": {
            "id": "poi-machupicchu",
            "name": "Machu Picchu",
            "namePt": "Machu Picchu",
            "description": "A 15th-century Inca citadel set high in the Andes Mountains in Peru, above the Urubamba River valley.",
            "descriptionPt": "Cidadela inca do século 15 situada no alto das montanhas dos Andes, no Peru, acima do vale do rio Urubamba.",
            "bestTime": "Dry season (May to October) for clear skies.",
            "bestTimePt": "Estação seca (Maio a Outubro) para céu claro.",
            "category": "wonder",
            "imageUrl": "https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&q=80&w=800"
        },
        "geometry": { "type": "Point", "coordinates": [-72.5450, -13.1631] }
    },
    {
        "type": "Feature",
        "properties": {
            "id": "poi-greatwall",
            "name": "Great Wall of China",
            "namePt": "Muralha da China",
            "description": "A series of fortifications that were built across the historical northern borders of ancient Chinese states.",
            "descriptionPt": "Uma série de fortificações construídas ao longo das fronteiras históricas do norte dos antigos estados chineses.",
            "bestTime": "Autumn (Sept-Nov) for cool temperatures and beautiful foliage.",
            "bestTimePt": "Outono (Set-Nov) para temperaturas amenas e folhagem bonita.",
            "category": "wonder",
            "imageUrl": "https://images.unsplash.com/photo-1542055990-2bf3fc388a10?auto=format&fit=crop&q=80&w=800"
        },
        "geometry": { "type": "Point", "coordinates": [116.5704, 40.4319] }
    },
    {
        "type": "Feature",
        "properties": {
            "id": "poi-fuji",
            "name": "Mount Fuji",
            "namePt": "Monte Fuji",
            "description": "Japan's highest mountain, an active volcano famous for its exceptionally symmetrical cone.",
            "descriptionPt": "A montanha mais alta do Japão, um vulcão ativo famoso por seu cone excepcionalmente simétrico.",
            "bestTime": "Climbing season is July to early September. Best viewing is in winter.",
            "bestTimePt": "A temporada de escalada é de julho ao início de setembro. A melhor vista é no inverno.",
            "category": "nature",
            "imageUrl": "https://images.unsplash.com/photo-1509023464722-18d996393ca8?auto=format&fit=crop&q=80&w=800"
        },
        "geometry": { "type": "Point", "coordinates": [138.7274, 35.3606] }
    }
];

const newRegions = [
    {
        "type": "Feature",
        "properties": {
            "id": "n-america",
            "name": "North America",
            "namePt": "América do Norte",
            "country": "USA & Canada",
            "description": "A vast continent offering everything from vibrant mega-cities to incredible national parks and diverse climates.",
            "descriptionPt": "Um vasto continente oferecendo desde mega-cidades vibrantes até incríveis parques nacionais e climas diversos.",
            "monthlyData": {}
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [-125, 30], [-70, 30], [-60, 50], [-130, 50], [-125, 30]
                ]
            ]
        }
    }
];

// Generate generic monthly data for North America
const monthlyUSA = {};
for (let i = 1; i <= 12; i++) {
    const isSummer = i >= 6 && i <= 8;
    const isWinter = i === 12 || i <= 2;
    monthlyUSA[i] = {
        weatherScore: isSummer ? 8 : (isWinter ? 4 : 6),
        costScore: 3,
        recommendedScore: isSummer ? 8.5 : 6,
        weatherDesc: isSummer ? "Warm and vibrant" : (isWinter ? "Cold, snowy in north" : "Mild and pleasant"),
        weatherDescPt: isSummer ? "Quente e vibrante" : (isWinter ? "Frio, com neve no norte" : "Ameno e agradável"),
        avgDailyCost: 150,
        highlights: ["Road trips", "National parks", "City exploration"],
        highlightsPt: ["Road trips", "Parques nacionais", "Exploração de cidades"],
        whyVisit: "Vast variety of activities across all states.",
        whyVisitPt: "Vasta variedade de atividades em todos os estados."
    };
}
newRegions[0].properties.monthlyData = monthlyUSA;

pois.push(...newPois);
regions.push(...newRegions);

fs.writeFileSync(poisPath, JSON.stringify(pois, null, 2));
fs.writeFileSync(regionsPath, JSON.stringify(regions, null, 2));
console.log('Added more realistic POIs and Regions');
