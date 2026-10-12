const fileSystem = require('fs');

const manuscriptRows = fileSystem
    .readFileSync(0, 'utf8')
    .split(/\r?\n/);

const ancientInscription = manuscriptRows[0] ?? '';
const discoveredInscription = manuscriptRows[1] ?? '';

function arrangeRunes(message) {
    return message
        .toLowerCase()
        .replace(/[^a-z]/g, '')
        .split('')
        .sort()
        .join('');
}

const inscriptionsMatch =
    arrangeRunes(ancientInscription) ===
    arrangeRunes(discoveredInscription);

console.log(
    inscriptionsMatch
        ? 'MISMO HECHIZO'
        : 'HECHIZOS DISTINTOS'
);