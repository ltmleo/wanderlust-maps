const fs = require('fs');
const path = require('path');

const poisPath = path.join(__dirname, 'src/data/pois.json');
const regionsPath = path.join(__dirname, 'src/data/regions.json');

let pois = JSON.parse(fs.readFileSync(poisPath, 'utf8'));
let regions = JSON.parse(fs.readFileSync(regionsPath, 'utf8'));

// Identify natural wonders
const naturalWondersIds = [
    "poi-aurora", "poi-greatbarrier", "poi-everest",
    "poi-victoriafalls", "poi-paricutin", "poi-iguazu", "poi-grandcanyon"
];

pois.forEach(p => {
    if (naturalWondersIds.includes(p.properties.id)) {
        p.properties.category = "natural_wonder";
    }
});

// Create more regions sharing similar climates
const moreRegions = [
    {
        "type": "Feature",
        "properties": {
            "id": "reg-atacama",
            "name": "Atacama Desert",
            "namePt": "Deserto do Atacama",
            "country": "Chile",
            "description": "One of the driest places on Earth, featuring otherworldly landscapes, salt flats, and geysers.",
            "descriptionPt": "Um dos lugares mais secos da Terra, com paisagens de outro mundo, salares e gêiseres.",
            "monthlyData": {}
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [-70, -25], [-67, -25], [-67, -20], [-70, -20], [-70, -25]
                ]
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "id": "reg-himalayas",
            "name": "The Himalayas",
            "namePt": "Himalaia",
            "country": "Central Asia",
            "description": "Massive mountain range home to the world's highest peaks, rich spiritual traditions, and breathtaking treks.",
            "descriptionPt": "Imensa cordilheira que abriga os picos mais altos do mundo e tradições espirituais.",
            "monthlyData": {}
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [74, 35], [95, 29], [90, 27], [74, 30], [74, 35]
                ]
            ]
        }
    }
];

// Atacama desert uses hot desert monthly data like Sahara but slightly different
const atacamaMonthly = {};
for (let i = 1; i <= 12; i++) {
    const isSummer = i <= 3 || i >= 11; // Southern hemisphere summer
    atacamaMonthly[i] = {
        weatherScore: isSummer ? 8 : 6,
        costScore: 6,
        recommendedScore: isSummer ? 8 : 6.5,
        weatherDesc: "Dry and sunny year-round. Cold nights.",
        weatherDescPt: "Seco e ensolarado o ano todo. Noites frias.",
        avgDailyCost: 90,
        highlights: ["Stargazing", "Valle de la Luna", "Geysers"],
        highlightsPt: ["Observação de estrelas", "Valle de la Luna", "Gêiseres"],
        whyVisit: "Clearest skies in the world for stargazing.",
        whyVisitPt: "Os céus mais limpos do mundo para observação de estrelas."
    };
}
moreRegions[0].properties.monthlyData = atacamaMonthly;

// Himalayas cold weather
const himalayasMonthly = {};
for (let i = 1; i <= 12; i++) {
    const isWinter = i <= 2 || i >= 11;
    const isMonsoon = i >= 6 && i <= 8;
    himalayasMonthly[i] = {
        weatherScore: isWinter || isMonsoon ? 3 : 9,
        costScore: 9,
        recommendedScore: isWinter || isMonsoon ? 4 : 9,
        weatherDesc: isWinter ? "Freezing, snowy" : (isMonsoon ? "Heavy rain, landslides" : "Clear skies, great for trekking"),
        weatherDescPt: isWinter ? "Congelante, com neve" : (isMonsoon ? "Muita chuva" : "Céu azul, ótimo para trekking"),
        avgDailyCost: 40,
        highlights: ["Trekking", "Monasteries", "Mountain Views"],
        highlightsPt: ["Trekking", "Mosteiros", "Vistas das montanhas"],
        whyVisit: isWinter || isMonsoon ? "Difficult and dangerous conditions." : "Peak trekking season with clear views.",
        whyVisitPt: isWinter || isMonsoon ? "Condições difíceis e perigosas." : "Alta temporada de trekking com vistas claras."
    };
}
moreRegions[1].properties.monthlyData = himalayasMonthly;

const existingRegIds = new Set(regions.map(r => r.properties.id));
moreRegions.forEach(r => {
    if (!existingRegIds.has(r.properties.id)) {
        regions.push(r);
    }
});

fs.writeFileSync(poisPath, JSON.stringify(pois, null, 2));
fs.writeFileSync(regionsPath, JSON.stringify(regions, null, 2));
console.log('Classified natural wonders and added more matching climate regions.');
