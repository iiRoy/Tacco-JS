const fileSystem = require('fs');

const transmissionParts = fileSystem
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/);

const spaceshipCount = Number(transmissionParts[0]);
const navigationKeys = transmissionParts.slice(
    1,
    spaceshipCount + 1
);

let sharedSector = navigationKeys[0] || '';

for (
    let shipIndex = 1;
    shipIndex < navigationKeys.length;
    shipIndex++
) {
    while (
        !navigationKeys[shipIndex].startsWith(sharedSector)
    ) {
        sharedSector = sharedSector.slice(0, -1);
    }

    if (sharedSector === '') {
        break;
    }
}

console.log(
    sharedSector === ''
        ? 'SIN PREFIJO'
        : sharedSector
);