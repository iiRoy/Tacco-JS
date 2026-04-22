const streamData = require('fs').readFileSync('/dev/stdin', 'utf8');

function* parseInputGrids(sourceText) {
    const dataLines = sourceText.trim().split('\n');
    let linePtr = 0;

    while (true) {
        const gridDimensions = dataLines[linePtr++].split(' ').map(Number);
        const [numRows, numCols] = gridDimensions;

        if (numRows === 0 && numCols === 0) {
            break;
        }

        const cellLayout = new Map();
        for (let rIdx = 0; rIdx < numRows; rIdx++) {
            const rowSymbols = dataLines[linePtr++].split('');
            for (let cIdx = 0; cIdx < numCols; cIdx++) {
                cellLayout.set(`${rIdx},${cIdx}`, rowSymbols[cIdx]);
            }
        }
        yield { rowCount: numRows, colCount: numCols, gridData: cellLayout };
    }
}

const directionalChanges = {
    '>': { rowOffset: 0, colOffset: 1 },
    '<': { rowOffset: 0, colOffset: -1 },
    '^': { rowOffset: -1, colOffset: 0 },
    'v': { rowOffset: 1, colOffset: 0 }
};

for (const gridDescription of parseInputGrids(streamData)) {
    const { gridData } = gridDescription; 

    const encounteredCells = new Set();
    let currentR = 0;
    let currentC = 0;

    let finalOutcome = "";

    while (true) {
        const currentCellIdentifier = `${currentR},${currentC}`;
        const cellContent = gridData.get(currentCellIdentifier); // Undefined if out of bounds

        if (cellContent === '.') {
            finalOutcome = `${currentC} ${currentR}`;
            break;
        }

        if (encounteredCells.has(currentCellIdentifier)) {
            finalOutcome = "LOOP";
            break;
        }

        encounteredCells.add(currentCellIdentifier);

        const movementVector = directionalChanges[cellContent]; 
        // If cellContent is undefined (out of bounds), movementVector will be undefined,
        // and accessing .rowOffset or .colOffset will throw a TypeError, replicating
        // the original code's out-of-bounds crash behavior.

        currentR += movementVector.rowOffset;
        currentC += movementVector.colOffset;
    }
    console.log(finalOutcome);
}