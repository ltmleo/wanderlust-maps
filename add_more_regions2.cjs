const fs = require('fs');
const path = require('path');

const regionsPath = path.join(__dirname, 'src/data/regions.json');
let regions = JSON.parse(fs.readFileSync(regionsPath, 'utf8'));

// First, check if Southeast Asia already exists and remove the old incorrect one if needed
regions = regions.filter(r => r.properties.name !== "Southeast Asia");

const newRegions = [
    {
        "type": "Feature",
        "properties": {
            "id": "reg-caribbean",
            "name": "The Caribbean",
            "namePt": "O Caribe",
            "country": "Caribbean Islands",
            "description": "A beautiful tropical paradise of islands featuring white-sand beaches, coral reefs, and a laid-back vibe.",
            "descriptionPt": "Um paraíso tropical de ilhas com praias de areia branca, recifes de coral e um clima descontraído.",
            "monthlyData": {}
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [-85, 25], [-60, 25], [-60, 10], [-85, 10], [-85, 25]
                ]
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "id": "reg-patagonia",
            "name": "Patagonia",
            "namePt": "Patagônia",
            "country": "Argentina & Chile",
            "description": "A sparsely populated region located at the southern end of South America, known for its dramatic mountains, glaciers, and wind.",
            "descriptionPt": "Região pouco povoada localizada no extremo sul da América do Sul, conhecida por suas montanhas dramáticas, geleiras e ventos fortes.",
            "monthlyData": {}
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [-75, -40], [-60, -40], [-60, -55], [-75, -55], [-75, -40]
                ]
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "id": "reg-seasia",
            "name": "Southeast Asia",
            "namePt": "Sudeste Asiático",
            "country": "SE Asia",
            "description": "A diverse, tropical region featuring lush jungles, ancient temples, incredible street food, and pristine beaches.",
            "descriptionPt": "Uma região tropical diversa com selvas exuberantes, templos antigos, incrível comida de rua e praias intocadas.",
            "monthlyData": {}
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [95, 20], [130, 20], [130, -10], [95, -10], [95, 20]
                ]
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "id": "reg-polynesia",
            "name": "Polynesia",
            "namePt": "Polinésia",
            "country": "Pacific Islands",
            "description": "A massive group of over 1000 islands scattered over the central and southern Pacific Ocean, famous for turquoise lagoons.",
            "descriptionPt": "Um grupo de mais de 1000 ilhas espalhadas pelo Oceano Pacífico central e sul, famosas por lagoas azul-turquesa.",
            "monthlyData": {}
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [-170, 20], [-130, 20], [-130, -30], [-170, -30], [-170, 20]
                ]
            ]
        }
    }
];

// Caribbean: Tropical, but has hurricane season (Aug-Oct)
const caribbeanMonthly = {};
for (let i = 1; i <= 12; i++) {
    const isHurricane = i >= 8 && i <= 10;
    const isPeak = i <= 4 || i === 12;
    caribbeanMonthly[i] = {
        weatherScore: isHurricane ? 3 : (isPeak ? 9 : 7),
        costScore: isPeak ? 3 : 6, // Expensive in peak
        recommendedScore: isHurricane ? 4 : (isPeak ? 8.5 : 7.5),
        weatherDesc: isHurricane ? "High risk of hurricanes and heavy rain." : (isPeak ? "Perfect sunny, dry weather." : "Warm with occasional showers."),
        weatherDescPt: isHurricane ? "Alto risco de furacões e chuvas fortes." : (isPeak ? "Clima perfeito, ensolarado e seco." : "Quente com chuvas ocasionais."),
        avgDailyCost: isPeak ? 180 : 120,
        highlights: ["Snorkeling", "Beach lounging", "Sailing"],
        highlightsPt: ["Mergulho com snorkel", "Relaxar na praia", "Velejar"],
        whyVisit: isHurricane ? "Dangerous weather, but very cheap." : "Quintessential tropical getaway.",
        whyVisitPt: isHurricane ? "Clima perigoso, mas muito barato." : "O refúgio tropical por excelência."
    };
}
newRegions[0].properties.monthlyData = caribbeanMonthly;

// Patagonia: Southern Hemisphere format. Extremely cold in winter, mild/windy in summer.
const patagoniaMonthly = {};
for (let i = 1; i <= 12; i++) {
    const isWinter = i >= 5 && i <= 9;
    const isSummer = i <= 2 || i >= 11;
    patagoniaMonthly[i] = {
        weatherScore: isWinter ? 2 : (isSummer ? 7 : 5),
        costScore: 5,
        recommendedScore: isWinter ? 3 : (isSummer ? 8 : 6),
        weatherDesc: isWinter ? "Freezing, many parks closed." : "Cool and extremely windy.",
        weatherDescPt: isWinter ? "Congelante, muitos parques fechados." : "Frio e extremamente ventoso.",
        avgDailyCost: 100,
        highlights: ["Glacier hiking", "Trekking Fitz Roy", "Whale watching"],
        highlightsPt: ["Caminhada em geleiras", "Trekking no Fitz Roy", "Observação de baleias"],
        whyVisit: isWinter ? "Only for extreme winter sports." : "Incredible majestic mountain landscapes.",
        whyVisitPt: isWinter ? "Apenas para esportes radicais de inverno." : "Incríveis paisagens montanhosas."
    };
}
newRegions[1].properties.monthlyData = patagoniaMonthly;

// Southeast Asia: Tropical monsoon. Wet season roughly May to October. Dry Nov to April.
const seasiaMonthly = {};
for (let i = 1; i <= 12; i++) {
    const isMonsoon = i >= 5 && i <= 10;
    seasiaMonthly[i] = {
        weatherScore: isMonsoon ? 4 : 8,
        costScore: 9, // Very cheap
        recommendedScore: isMonsoon ? 6 : 9,
        weatherDesc: isMonsoon ? "Hot, humid, daily monsoon downpours." : "Sunny, lower humidity.",
        weatherDescPt: isMonsoon ? "Quente, úmido, tempestades diárias de monção." : "Ensolarado, umidade mais baixa.",
        avgDailyCost: 40,
        highlights: ["Temple hopping", "Island boat tours", "Street food"],
        highlightsPt: ["Visitas a templos", "Passeios de barco em ilhas", "Comida de rua"],
        whyVisit: isMonsoon ? "Very lush, fewer crowds, but very wet." : "Peak backpacker paradise conditions.",
        whyVisitPt: isMonsoon ? "Muito verde, menos multidões, mas muito chuvoso." : "Condições perfeitas para mochileiros."
    };
}
newRegions[2].properties.monthlyData = seasiaMonthly;

// Polynesia: Tropical maritime. Fairly stable, slightly wetter Nov-April.
const polynesiaMonthly = {};
for (let i = 1; i <= 12; i++) {
    const isWetter = i >= 11 || i <= 4;
    polynesiaMonthly[i] = {
        weatherScore: isWetter ? 6 : 9,
        costScore: 2, // Very expensive
        recommendedScore: isWetter ? 7 : 8.5,
        weatherDesc: isWetter ? "Warm, humid, occasional storms." : "Idyllic dry tropical weather.",
        weatherDescPt: isWetter ? "Quente, úmido, tempestades ocasionais." : "Clima tropical seco e idílico.",
        avgDailyCost: 250,
        highlights: ["Overwater bungalows", "Scuba diving", "Polynesian culture"],
        highlightsPt: ["Bangalôs sobre a água", "Mergulho", "Cultura Polinésia"],
        whyVisit: isWetter ? "Slight risk of cyclones." : "The ultimate luxury island experience.",
        whyVisitPt: isWetter ? "Leve risco de ciclones." : "A melhor experiência de luxo em ilhas."
    };
}
newRegions[3].properties.monthlyData = polynesiaMonthly;

const existingRegIds = new Set(regions.map(r => r.properties.id));
newRegions.forEach(r => {
    if (!existingRegIds.has(r.properties.id)) {
        regions.push(r);
    }
});

fs.writeFileSync(regionsPath, JSON.stringify(regions, null, 2));
console.log('Added 4 new specific climate regions: Caribbean, Patagonia, SE Asia, Polynesia.');
