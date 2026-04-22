const fsys = require('node:fs');
const retrieveContent = fsys.readFileSync;
const incomingData = retrieveContent(0, 'utf8');

const suppliedFacts = incomingData.split('\n');
suppliedFacts.splice(0, 1);

const recognizedItems = new Set(suppliedFacts.filter(Boolean));

const cardSymbols = ['S', 'H', 'C', 'D'];

const completePack = cardSymbols.flatMap(suitChar => {
    return Array.from({ length: 13 }, (_, idx) => `${suitChar} ${idx + 1}`);
});

const missingComponents = completePack.filter(item => !recognizedItems.has(item));

if (missingComponents.length > 0) {
    console.log(missingComponents.join('\n'));
}