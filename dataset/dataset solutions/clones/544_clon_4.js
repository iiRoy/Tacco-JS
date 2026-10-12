const fs = require('fs');

const message = fs
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/);

const fleetSize = Number(message.shift());
const starRoutes = message
    .slice(0, fleetSize)
    .sort();

if (starRoutes.length === 0) {
    console.log('SIN PREFIJO');
} else {
    const alphabeticallyFirst = starRoutes[0];
    const alphabeticallyLast =
        starRoutes[starRoutes.length - 1];

    const sharedCharacters = [];

    let cursor = 0;

    while (
        cursor < alphabeticallyFirst.length &&
        cursor < alphabeticallyLast.length &&
        alphabeticallyFirst[cursor] ===
            alphabeticallyLast[cursor]
    ) {
        sharedCharacters.push(alphabeticallyFirst[cursor]);
        cursor++;
    }

    const galacticSector = sharedCharacters.join('');

    console.log(
        galacticSector.length > 0
            ? galacticSector
            : 'SIN PREFIJO'
    );
}