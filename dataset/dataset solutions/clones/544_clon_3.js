const fs = require('fs');

function readNavigationCodes() {
    const input = fs
        .readFileSync(0, 'utf8')
        .trim()
        .split(/\s+/);

    const amount = parseInt(input.shift(), 10);

    return input.slice(0, amount);
}

function compareTwoCoordinates(firstCode, secondCode) {
    const maximumComparableLength = Math.min(
        firstCode.length,
        secondCode.length
    );

    let matchingCharacters = 0;

    for (
        let position = 0;
        position < maximumComparableLength;
        position++
    ) {
        if (firstCode[position] !== secondCode[position]) {
            break;
        }

        matchingCharacters++;
    }

    return firstCode.substring(0, matchingCharacters);
}

const coordinates = readNavigationCodes();
const initialCoordinate = coordinates.shift() || '';

const detectedSector = coordinates.reduce(
    (currentSector, nextCoordinate) => {
        if (currentSector.length === 0) {
            return '';
        }

        return compareTwoCoordinates(
            currentSector,
            nextCoordinate
        );
    },
    initialCoordinate
);

if (detectedSector.length > 0) {
    process.stdout.write(`${detectedSector}\n`);
} else {
    process.stdout.write('SIN PREFIJO\n');
}