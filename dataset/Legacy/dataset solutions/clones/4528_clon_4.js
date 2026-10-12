'use strict';

function processCoordinates(sourceData) {
    const lines = sourceData.split('\n');
    // The first line, representing 'n' in the original, is not utilized in the final calculation.
    // We proceed directly to the second line for coordinate processing.

    const rawCoordinateStrings = lines[1].split(' ');

    let minimumCoordinate = Infinity;
    let maximumCoordinate = -Infinity;
    const encounteredCoordinates = new Set();

    for (const stringRepresentation of rawCoordinateStrings) {
        const currentCoordinate = Number(stringRepresentation);

        if (!encounteredCoordinates.has(currentCoordinate)) {
            encounteredCoordinates.add(currentCoordinate);
            if (currentCoordinate < minimumCoordinate) {
                minimumCoordinate = currentCoordinate;
            }
            if (currentCoordinate > maximumCoordinate) {
                maximumCoordinate = currentCoordinate;
            }
        }
    }

    const coordinateSpan = maximumCoordinate - minimumCoordinate;
    console.log(coordinateSpan);
}

processCoordinates(require('fs').readFileSync('/dev/stdin', 'utf8'));
