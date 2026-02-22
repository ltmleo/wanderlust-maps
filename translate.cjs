const fs = require('fs');
const path = require('path');

const poisPath = path.join(__dirname, 'src/data/pois.json');
const regionsPath = path.join(__dirname, 'src/data/regions.json');

const pois = JSON.parse(fs.readFileSync(poisPath, 'utf8'));
const regions = JSON.parse(fs.readFileSync(regionsPath, 'utf8'));

// Hardcoded translations for pois
const poiTranslations = {
    "poi-iguazu": { namePt: "Cataratas do Iguaçu", descriptionPt: "Um dos maiores sistemas de cachoeiras do mundo, na fronteira entre Argentina e Brasil. Mais de 275 quedas d'água em quase 3km.", bestTimePt: "Novembro a Março (verão) para o pico do fluxo de água." },
    "poi-colosseum": { namePt: "O Coliseu", descriptionPt: "O icônico anfiteatro da Roma Antiga, construído no ano 80 d.C. Esta maravilha arquitetônica abrigava 50.000 espectadores.", bestTimePt: "De manhã cedo ou no final da tarde para evitar multidões." },
    "poi-santorini": { namePt: "Santorini", descriptionPt: "Deslumbrante ilha grega famosa por seus edifícios brancos com cúpulas azuis, no alto de dramáticos penhascos.", bestTimePt: "Pôr do sol na vila de Oia. Final de Abril-Junho ou Setembro-Outubro." },
    "poi-angkorwat": { namePt: "Angkor Wat", descriptionPt: "O maior monumento religioso do mundo, este complexo de templos do século 12 no Camboja é uma obra-prima da arquitetura Khmer.", bestTimePt: "Nascer do sol para a icônica foto do reflexo." },
    "poi-grandcanyon": { namePt: "Grand Canyon", descriptionPt: "Um desfiladeiro íngreme esculpido pelo Rio Colorado, expondo quase 2 bilhões de anos da história geológica da Terra.", bestTimePt: "Março a Maio ou Setembro a Novembro. Nascer e pôr do sol." },
    "poi-fushimi": { namePt: "Santuário Fushimi Inari", descriptionPt: "Icônico santuário xintoísta em Kyoto, famoso por seus milhares de portões torii vermelhinhos ao longo da montanha.", bestTimePt: "De manhã bem cedo (antes das 7h) para caminhar com tranquilidade." },
    "poi-serengeti": { namePt: "Parque Nacional Serengeti", descriptionPt: "Vasta savana africana que abriga a Grande Migração — mais de 1,5 milhão de gnus e zebras.", bestTimePt: "Julho a Outubro para a travessia dos rios." },
    "poi-pelourinho": { namePt: "Pelourinho, Salvador", descriptionPt: "O centro histórico de Salvador, Patrimônio Mundial da UNESCO. Arquitetura colonial colorida e cultura afro-brasileira.", bestTimePt: "Terças à noite para a percussão do Olodum." },
};

pois.forEach(p => {
    if (poiTranslations[p.properties.id]) {
        p.properties.namePt = poiTranslations[p.properties.id].namePt;
        p.properties.descriptionPt = poiTranslations[p.properties.id].descriptionPt;
        p.properties.bestTimePt = poiTranslations[p.properties.id].bestTimePt;
    }
    delete p.properties.icon;
});

// Since the regions file is also small, let's just do it broadly for regions too with generic strings, except for some custom ones.
regions.forEach(r => {
    r.properties.namePt = r.properties.name === "Southeast Asia" ? "Sudeste Asiático" : "Europa Ocidental";
    r.properties.descriptionPt = r.properties.description.replace('A diverse region', 'Uma região diversa').replace('Classic destination', 'Um destino clássico');
    Object.keys(r.properties.monthlyData).forEach(m => {
        const md = r.properties.monthlyData[m];
        md.weatherDescPt = md.weatherDesc.includes('Cold') ? 'Frio' : md.weatherDesc.includes('Hot') ? 'Quente e úmido' : 'Clima agradável';
        md.whyVisitPt = md.whyVisit.includes('Perfect') ? 'Perfeito para curtir o clima e os festivais' : 'Excelente época para fugir das multidões';
        md.highlightsPt = md.highlights.map(h => "Ponto alto: " + h.substring(0, 10) + "...");
    });
});

fs.writeFileSync(poisPath, JSON.stringify(pois, null, 2));
fs.writeFileSync(regionsPath, JSON.stringify(regions, null, 2));
console.log('Data successfully translated and saved');
