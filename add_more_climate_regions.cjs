const fs = require('fs');
const path = require('path');

const regionsPath = path.join(__dirname, 'src/data/regions.json');
let regions = JSON.parse(fs.readFileSync(regionsPath, 'utf8'));

const newRegions = [
    {
        "type": "Feature",
        "properties": {
            "id": "reg-congo",
            "name": "Congo Rainforest",
            "namePt": "Bacia do Congo",
            "country": "Central Africa",
            "description": "The world's second-largest tropical rainforest, teeming with gorillas and vast river networks.",
            "descriptionPt": "A segunda maior floresta tropical do mundo, repleta de gorilas e vastas redes fluviais.",
            "monthlyData": {}
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [10, 5], [30, 5], [30, -5], [10, -5], [10, 5]
                ]
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "id": "reg-antarctica",
            "name": "Antarctica",
            "namePt": "Antártida",
            "country": "Antarctica",
            "description": "Earth's southernmost continent. It contains the geographic South Pole and is situated in the Antarctic region.",
            "descriptionPt": "O continente mais ao sul da Terra. Contém o Pólo Sul geográfico e está coberto de gelo o ano todo.",
            "monthlyData": {}
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [-180, -90], [180, -90], [180, -60], [-180, -60], [-180, -90]
                ]
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "id": "reg-arabian",
            "name": "Arabian Desert",
            "namePt": "Deserto da Arábia",
            "country": "Middle East",
            "description": "A vast desert wilderness in Western Asia, occupying most of the Arabian Peninsula.",
            "descriptionPt": "Um vasto deserto na Ásia Ocidental, ocupando a maior parte da Península Arábica.",
            "monthlyData": {}
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [35, 30], [60, 25], [55, 15], [40, 15], [35, 30]
                ]
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "id": "reg-outback",
            "name": "Australian Outback",
            "namePt": "Outback Australiano",
            "country": "Australia",
            "description": "The vast, remote, arid area of Australia. It is known for its red dirt, sparse vegetation, and unique wildlife.",
            "descriptionPt": "A imensa área remota e árida da Austrália. Conhecida por sua terra vermelha, vegetação rala e fauna única.",
            "monthlyData": {}
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [120, -20], [140, -20], [140, -30], [120, -30], [120, -20]
                ]
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "id": "reg-siberia",
            "name": "Siberia",
            "namePt": "Sibéria",
            "country": "Russia",
            "description": "An extensive geographical region, and by the broadest definition is also known as North Asia, historically famous for extreme winters.",
            "descriptionPt": "Extensa região geográfica com invernos brutais, florestas de taiga e o profundo Lago Baikal.",
            "monthlyData": {}
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [60, 75], [150, 75], [150, 50], [60, 50], [60, 75]
                ]
            ]
        }
    }
];

// Congo: Rainforest like Amazon
const congoMonthly = {};
for (let i = 1; i <= 12; i++) {
    congoMonthly[i] = {
        weatherScore: 5,
        costScore: 5,
        recommendedScore: 6,
        weatherDesc: "Hot, wet, and intensely humid.",
        weatherDescPt: "Quente, chuvoso e intensamente úmido.",
        avgDailyCost: 100, // Safaris are expensive
        highlights: ["Gorilla trekking", "Jungle safaris", "River trips"],
        highlightsPt: ["Trekking com gorilas", "Safáris na selva", "Viagens de rio"],
        whyVisit: "Epic wildlife encounters in deep jungle.",
        whyVisitPt: "Encontros épicos com a vida selvagem na floresta profunda."
    };
}
newRegions[0].properties.monthlyData = congoMonthly;

// Antarctica: Freezing year round
const antarcticaMonthly = {};
for (let i = 1; i <= 12; i++) {
    const isSummer = i <= 2 || i >= 11; // Southern summer
    antarcticaMonthly[i] = {
        weatherScore: isSummer ? 4 : 1,
        costScore: 1, // Extremely expensive
        recommendedScore: isSummer ? 8 : 1,
        weatherDesc: isSummer ? "Around freezing, 24h sunlight." : "Lethally cold, pure darkness.",
        weatherDescPt: isSummer ? "Perto de zero graus, sol 24h." : "Frio letal, escuridão total.",
        avgDailyCost: 500,
        highlights: ["Penguin colonies", "Glacial cruising", "Ice hiking"],
        highlightsPt: ["Colônias de pinguins", "Cruzeiros glaciais", "Caminhada no gelo"],
        whyVisit: isSummer ? "The only time civilian travel is broadly possible." : "Inaccessible to tourists.",
        whyVisitPt: isSummer ? "A única época em que viagens civis são amplamente possíveis." : "Inacessível para turistas."
    };
}
newRegions[1].properties.monthlyData = antarcticaMonthly;

// Arabian Desert: Hot desert like Sahara
const arabianMonthly = {};
for (let i = 1; i <= 12; i++) {
    const isSummer = i >= 5 && i <= 9;
    arabianMonthly[i] = {
        weatherScore: isSummer ? 2 : 7,
        costScore: 3, // Can be luxury
        recommendedScore: isSummer ? 3 : 8,
        weatherDesc: isSummer ? "Scorchingly hot, unbearable outside." : "Pleasant and warm days, cool nights.",
        weatherDescPt: isSummer ? "Calor escaldante, insuportável lá fora." : "Dias agradáveis e quentes, noites frias.",
        avgDailyCost: 150,
        highlights: ["Dune bashing", "Luxury desert camps", "Camel rides"],
        highlightsPt: ["Passeios nas dunas", "Acampamentos de luxo no deserto", "Passeios de camelo"],
        whyVisit: isSummer ? "Avoid outdoor activities." : "Perfect desert weather.",
        whyVisitPt: isSummer ? "Evite atividades ao ar livre." : "Clima perfeito no deserto."
    };
}
newRegions[2].properties.monthlyData = arabianMonthly;

// Australian Outback: Semi-arid/desert (Southern hemisphere)
const outbackMonthly = {};
for (let i = 1; i <= 12; i++) {
    const isSummer = i <= 2 || i >= 11; // Aus summer (hot)
    outbackMonthly[i] = {
        weatherScore: isSummer ? 3 : 8,
        costScore: 5,
        recommendedScore: isSummer ? 4 : 8,
        weatherDesc: isSummer ? "Incredibly hot, sweltering." : "Pleasant, clear blue skies.",
        weatherDescPt: isSummer ? "Incrivelmente quente, sufocante." : "Agradável, céu azul claro.",
        avgDailyCost: 120,
        highlights: ["Uluru tours", "Star gazing", "4x4 drives"],
        highlightsPt: ["Tours no Uluru", "Observação de estrelas", "Passeios 4x4"],
        whyVisit: isSummer ? "Extreme heat makes travel dangerous." : "Perfect for exploring the red center.",
        whyVisitPt: isSummer ? "Calor extremo torna a viagem perigosa." : "Perfeito para explorar o centro vermelho."
    };
}
newRegions[3].properties.monthlyData = outbackMonthly;

// Siberia: Extreme continental
const siberiaMonthly = {};
for (let i = 1; i <= 12; i++) {
    const isWinter = i <= 3 || i >= 11;
    const isSummer = i >= 6 && i <= 8;
    siberiaMonthly[i] = {
        weatherScore: isWinter ? 1 : (isSummer ? 7 : 4),
        costScore: 7,
        recommendedScore: isWinter ? 4 : (isSummer ? 7 : 5),
        weatherDesc: isWinter ? "Dangerously cold, heavy snow." : (isSummer ? "Surprisingly warm, mosquitoes." : "Cold but manageable."),
        weatherDescPt: isWinter ? "Frio perigoso, muita neve." : (isSummer ? "Surpreendentemente quente, mosquitos." : "Frio, mas tolerável."),
        avgDailyCost: 60,
        highlights: ["Trans-Siberian Railway", "Lake Baikal", "Taiga forests"],
        highlightsPt: ["Rodovia Transiberiana", "Lago Baikal", "Florestas de taiga"],
        whyVisit: isWinter ? "Only for extreme winter survivalists." : "Great for nature and train journeys.",
        whyVisitPt: isWinter ? "Apenas para sobreviventes extremos de inverno." : "Ótimo para natureza e viagens de trem."
    };
}
newRegions[4].properties.monthlyData = siberiaMonthly;


const existingRegIds = new Set(regions.map(r => r.properties.id));
newRegions.forEach(r => {
    if (!existingRegIds.has(r.properties.id)) {
        regions.push(r);
    }
});

fs.writeFileSync(regionsPath, JSON.stringify(regions, null, 2));
console.log('Added ' + newRegions.length + ' new extreme climate regions to regions.json');
