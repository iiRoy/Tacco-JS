"use strict";

const processStream = (sourceText) => {
    const lineCollection = sourceText.trim().split('\n');
    const dimensionSpec = lineCollection[0].split(' ');
    const numericalRows = parseInt(dimensionSpec[0]);
    const numericalCols = parseInt(dimensionSpec[1]);

    const textualGrid = lineCollection.slice(1, numericalRows + 1).map(segment => segment.split(' '));

    const locateSpecificTerm = (currentY, currentX) => {
        if (currentY >= numericalRows) {
            return null;
        }
        if (currentX >= numericalCols) {
            return locateSpecificTerm(currentY + 1, 0);
        }

        if (textualGrid[currentY][currentX] === 'snuke') {
            return { rowIdx: currentY, colIdx: currentX };
        }

        return locateSpecificTerm(currentY, currentX + 1);
    };

    const discoveredPosition = locateSpecificTerm(0, 0);

    if (discoveredPosition) {
        const columnDesignator = String.fromCharCode('A'.charCodeAt(0) + discoveredPosition.colIdx);
        const oneBasedRowNumber = discoveredPosition.rowIdx + 1;
        console.log(`${columnDesignator}${oneBasedRowNumber}`);
    }
};

processStream(require('fs').readFileSync('/dev/stdin', 'utf8'));