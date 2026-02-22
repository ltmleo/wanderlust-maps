const fs = require('fs');
const path = require('path');

const poisPath = path.join(__dirname, 'src/data/pois.json');
const regionsPath = path.join(__dirname, 'src/data/regions.json');

let pois = JSON.parse(fs.readFileSync(poisPath, 'utf8'));
let regions = JSON.parse(fs.readFileSync(regionsPath, 'utf8'));

// Remove 'n-america' from regions
regions = regions.filter(r => r.properties.id !== 'n-america');

// Convert some existing ones to wonder if they belong
pois.forEach(p => {
    if (["poi-colosseum", "poi-grandcanyon"].includes(p.properties.id)) {
        p.properties.category = "wonder";
    }
});

const newWonders = [
    // 7 New Wonders
    {
        "type": "Feature",
        "properties": {
            "id": "poi-petra",
            "name": "Petra",
            "namePt": "Petra",
            "description": "Historical and archaeological city in southern Jordan, famous for its rock-cut architecture.",
            "descriptionPt": "A cidade histórica e arqueológica no sul da Jordânia, famosa por sua arquitetura esculpida na rocha.",
            "bestTime": "Spring (March-May) or Autumn (Sept-Nov) for cooler exploring.",
            "bestTimePt": "Primavera (Março-Maio) ou Outono (Set-Nov) para exploração mais fresca.",
            "category": "wonder",
            "imageUrl": "https://images.unsplash.com/photo-1574015949673-810a9f5d3420?auto=format&fit=crop&q=80&w=800"
        },
        "geometry": { "type": "Point", "coordinates": [35.4444, 30.3285] }
    },
    {
        "type": "Feature",
        "properties": {
            "id": "poi-chichen",
            "name": "Chichén Itzá",
            "namePt": "Chichén Itzá",
            "description": "A complex of Mayan ruins on Mexico's Yucatán Peninsula, dominated by the massive El Castillo step pyramid.",
            "descriptionPt": "Um complexo de ruínas maias na Península de Yucatán no México, dominado pela enorme pirâmide em degraus de El Castillo.",
            "bestTime": "November to April to avoid the extreme heat and humidity.",
            "bestTimePt": "Novembro a Abril para evitar o calor e umidade extremos.",
            "category": "wonder",
            "imageUrl": "https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&q=80&w=800"
        },
        "geometry": { "type": "Point", "coordinates": [-88.5678, 20.6843] }
    },
    {
        "type": "Feature",
        "properties": {
            "id": "poi-tajmahal",
            "name": "Taj Mahal",
            "namePt": "Taj Mahal",
            "description": "An ivory-white marble mausoleum on the right bank of the river Yamuna in Agra, India.",
            "descriptionPt": "Um mausoléu de mármore branco-marfim na margem direita do rio Yamuna em Agra, na Índia.",
            "bestTime": "October to March for the best weather. Sunrise is magical.",
            "bestTimePt": "Outubro a Março para o melhor clima. O nascer do sol é mágico.",
            "category": "wonder",
            "imageUrl": "https://images.unsplash.com/photo-1564507592208-013dd6cd4093?auto=format&fit=crop&q=80&w=800"
        },
        "geometry": { "type": "Point", "coordinates": [78.0421, 27.1751] }
    },
    {
        "type": "Feature",
        "properties": {
            "id": "poi-christ",
            "name": "Christ the Redeemer",
            "namePt": "Cristo Redentor",
            "description": "An Art Deco statue of Jesus Christ in Rio de Janeiro, Brazil, overlooking the vibrant city.",
            "descriptionPt": "Uma estátua Art Déco de Jesus Cristo no Rio de Janeiro, Brasil, com vista para a cidade vibrante.",
            "bestTime": "September and October, for less humid weather but mostly sunny days.",
            "bestTimePt": "Setembro e Outubro, para tempo menos úmido mas quase sempre ensolarado.",
            "category": "wonder",
            "imageUrl": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&q=80&w=800"
        },
        "geometry": { "type": "Point", "coordinates": [-43.2105, -22.9519] }
    },

    // 7 Natural Wonders
    {
        "type": "Feature",
        "properties": {
            "id": "poi-aurora",
            "name": "Aurora Borealis",
            "namePt": "Aurora Boreal",
            "description": "Natural light display in Earth's sky, predominantly seen in high-latitude regions (around the Arctic and Antarctic).",
            "descriptionPt": "Show de luzes naturais no céu da Terra, vistos predominantemente em regiões de alta latitude (ao redor do Ártico e Antártico).",
            "bestTime": "Winter months (Sept to March) in Northern Scandinavia or Canada.",
            "bestTimePt": "Meses de inverno (Setembro a Março) no Norte da Escandinávia ou Canadá.",
            "category": "wonder",
            "imageUrl": "https://images.unsplash.com/photo-1531366936310-008bd6b8c9a3?auto=format&fit=crop&q=80&w=800"
        },
        "geometry": { "type": "Point", "coordinates": [18.5581, 68.3538] } // Norway/Sweden roughly
    },
    {
        "type": "Feature",
        "properties": {
            "id": "poi-greatbarrier",
            "name": "Great Barrier Reef",
            "namePt": "Grande Barreira de Corais",
            "description": "The world's largest coral reef system composed of over 2,900 individual reefs globally renowned for diving.",
            "descriptionPt": "O maior sistema de barreiras de coral do mundo, conhecido globalmente pelo mergulho.",
            "bestTime": "June to October offers clarity and avoids the stinger season.",
            "bestTimePt": "De junho a outubro oferece águas cristalinas e evita a época de medusas.",
            "category": "wonder",
            "imageUrl": "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&q=80&w=800"
        },
        "geometry": { "type": "Point", "coordinates": [146.4024, -18.2871] }
    },
    {
        "type": "Feature",
        "properties": {
            "id": "poi-everest",
            "name": "Mount Everest",
            "namePt": "Monte Everest",
            "description": "Earth's highest mountain above sea level, located in the Mahalangur Himal sub-range of the Himalayas.",
            "descriptionPt": "A montanha mais alta da Terra acima do nível do mar, localizada no Himalaia.",
            "bestTime": "April to May or September to November.",
            "bestTimePt": "Abril a Maio ou Setembro a Novembro.",
            "category": "wonder",
            "imageUrl": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=800"
        },
        "geometry": { "type": "Point", "coordinates": [86.9250, 27.9881] }
    },
    {
        "type": "Feature",
        "properties": {
            "id": "poi-victoriafalls",
            "name": "Victoria Falls",
            "namePt": "Cataratas de Vitória",
            "description": "A spectacular waterfall on the Zambezi River in southern Africa, which provides habitat for several unique species.",
            "descriptionPt": "Uma espetacular queda d'água no Rio Zambeze, na África, habitat de várias espécies únicas.",
            "bestTime": "February to May for maximum spray, or dry season to swim in Devil's Pool.",
            "bestTimePt": "Fevereiro a Maio pelo volume d'água, ou seca para nadar na Devil's Pool.",
            "category": "wonder",
            "imageUrl": "https://images.unsplash.com/photo-1518182170546-076616fdcbbe?auto=format&fit=crop&q=80&w=800"
        },
        "geometry": { "type": "Point", "coordinates": [25.8560, -17.9243] }
    },
    {
        "type": "Feature",
        "properties": {
            "id": "poi-paricutin",
            "name": "Parícutin",
            "namePt": "Paricutina",
            "description": "A cinder cone volcano located in the Mexican state of Michoacán, which surged suddenly from a cornfield in 1943.",
            "descriptionPt": "Um vulcão de cone de cinzas localizado no estado mexicano de Michoacán, que surgiu repentinamente de um milharal em 1943.",
            "bestTime": "Winter and spring months for trekking.",
            "bestTimePt": "Meses de inverno e primavera para trekking.",
            "category": "wonder",
            "imageUrl": "https://images.unsplash.com/photo-1621539151528-790dc3ed0377?auto=format&fit=crop&q=80&w=800"
        },
        "geometry": { "type": "Point", "coordinates": [-102.2514, 19.4933] }
    }
];

const newClimateRegions = [
    {
        "type": "Feature",
        "properties": {
            "id": "reg-amazon",
            "name": "Amazon Rainforest",
            "namePt": "Floresta Amazônica",
            "country": "South America",
            "description": "The world's largest tropical rainforest, famous for its biodiversity. It's crisscrossed by thousands of rivers, including the powerful Amazon.",
            "descriptionPt": "A maior floresta tropical do mundo, famosa por sua biodiversidade e rios gigantescos.",
            "monthlyData": {}
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [-75, -5], [-60, 5], [-50, 0], [-55, -15], [-75, -5]
                ]
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "id": "reg-nordic",
            "name": "Nordic Region",
            "namePt": "Península Nórdica",
            "country": "Scandinavia",
            "description": "Defined by stunning fjords, aurora borealis, and cold sub-arctic to tundra climates. Home to deep forests and magical winters.",
            "descriptionPt": "Definida por planaltos impressionantes, fjords, aurora boreal, com clima muito frio.",
            "monthlyData": {}
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [5, 58], [15, 55], [30, 70], [20, 71], [5, 58]
                ]
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "id": "reg-sahara",
            "name": "Sahara Desert",
            "namePt": "Deserto do Saara",
            "country": "North Africa",
            "description": "The largest hot desert in the world, covering most of North Africa with sweeping sand dunes and rocky plateaus.",
            "descriptionPt": "O maior deserto quente do mundo, cobrindo grande parte do Norte da África com dunas de areia.",
            "monthlyData": {}
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [-15, 20], [30, 20], [35, 30], [0, 35], [-15, 20]
                ]
            ]
        }
    }
];

const amazonMonthly = {};
for (let i = 1; i <= 12; i++) {
    amazonMonthly[i] = {
        weatherScore: 5,
        costScore: 6,
        recommendedScore: 7,
        weatherDesc: "Hot, humid, and rainy year-round.",
        weatherDescPt: "Quente, úmido e chuvoso o ano todo.",
        avgDailyCost: 80,
        highlights: ["Jungle tours", "River cruises", "Wildlife spotting"],
        highlightsPt: ["Tours na selva", "Cruzeiros fluviais", "Observação da vida selvagem"],
        whyVisit: "Incredible biodiversity and indigenous culture.",
        whyVisitPt: "Incrível biodiversidade e cultura indígena."
    };
}
newClimateRegions[0].properties.monthlyData = amazonMonthly;

const nordicMonthly = {};
for (let i = 1; i <= 12; i++) {
    const isWinter = i <= 3 || i >= 10;
    nordicMonthly[i] = {
        weatherScore: isWinter ? 3 : 8,
        costScore: 2,
        recommendedScore: isWinter ? 7 : 9,
        weatherDesc: isWinter ? "Freezing, dark, snowy" : "Mild, midnight sun",
        weatherDescPt: isWinter ? "Congelante, escuro, muita neve" : "Ameno, sol da meia-noite",
        avgDailyCost: 200,
        highlights: isWinter ? ["Northern lights", "Husky sledding", "Skiing"] : ["Fjord cruises", "Hiking", "Wild camping"],
        highlightsPt: isWinter ? ["Aurora boreal", "Trenós", "Esqui"] : ["Cruzeiros nos fjords", "Caminhadas", "Acampar"],
        whyVisit: isWinter ? "Magical snowy landscapes and polar nights." : "Endless summer days.",
        whyVisitPt: isWinter ? "Paisagens de neve mágicas." : "Dias intermináveis de verão."
    };
}
newClimateRegions[1].properties.monthlyData = nordicMonthly;

const saharaMonthly = {};
for (let i = 1; i <= 12; i++) {
    const isSummer = i >= 6 && i <= 9;
    saharaMonthly[i] = {
        weatherScore: isSummer ? 2 : 7,
        costScore: 8,
        recommendedScore: isSummer ? 3 : 8,
        weatherDesc: isSummer ? "Scorching heat during the day" : "Warm days, freezing nights",
        weatherDescPt: isSummer ? "Calor escaldante durante o dia" : "Dias quentes, madrugadas congelantes",
        avgDailyCost: 50,
        highlights: ["Camel treks", "Star gazing", "Oasis visiting"],
        highlightsPt: ["Passeios de camelo", "Observação de estrelas", "Visita a oásis"],
        whyVisit: isSummer ? "Too hot to visit comfortably." : "A profound experience of isolation and beauty.",
        whyVisitPt: isSummer ? "Muito quente." : "Uma profunda experiência de isolamento e beleza."
    };
}
newClimateRegions[2].properties.monthlyData = saharaMonthly;

const existingPoiIds = new Set(pois.map(p => p.properties.id));
newWonders.forEach(w => {
    if (!existingPoiIds.has(w.properties.id)) {
        pois.push(w);
    }
});

const existingRegIds = new Set(regions.map(r => r.properties.id));
newClimateRegions.forEach(r => {
    if (!existingRegIds.has(r.properties.id)) {
        regions.push(r);
    }
});

fs.writeFileSync(poisPath, JSON.stringify(pois, null, 2));
fs.writeFileSync(regionsPath, JSON.stringify(regions, null, 2));
console.log('Added all wonders and replaced with climate-specific regions.');
