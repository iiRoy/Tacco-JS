const fileSystem = require('fs');

const UNASSIGNED_ROW_MARKER = Symbol('UNASSIGNED_ROW');

const inputLines = fileSystem.readFileSync('/dev/stdin', 'utf8').split('\n');

const [gridHeight, gridWidth, keyCount] = inputLines.shift().split(' ').map(Number);

const { processedRows: finalGridOutput } = inputLines.reduce((accumulator, currentInputRowString) => {
    const hashColumnPositions = Array.from(currentInputRowString).reduce((positions, character, columnIndex) => {
        if (character === '#') {
            positions.push(columnIndex);
        }
        return positions;
    }, []);

    if (hashColumnPositions.length === 0) {
        if (accumulator.lastPopulatedRow) {
            accumulator.processedRows.push(accumulator.lastPopulatedRow);
        } else {
            accumulator.processedRows.push(UNASSIGNED_ROW_MARKER);
        }
    } else {
        const currentRowAssignments = new Array(gridWidth);
        let currentFillStartColumn = 0;
        let currentIdentifier = accumulator.nextAvailableIdentifier;

        hashColumnPositions.forEach(hashColumnIndex => {
            currentRowAssignments.fill(currentIdentifier, currentFillStartColumn, hashColumnIndex + 1);
            currentFillStartColumn = hashColumnIndex + 1;
            currentIdentifier++;
        });

        currentRowAssignments.fill(currentIdentifier - 1, currentFillStartColumn, gridWidth);

        accumulator.processedRows.push(currentRowAssignments);
        accumulator.nextAvailableIdentifier = currentIdentifier;
        accumulator.lastPopulatedRow = currentRowAssignments;
    }
    return accumulator;
}, { processedRows: [], nextAvailableIdentifier: 1, lastPopulatedRow: null });

const firstPopulatedRowIndex = finalGridOutput.findIndex(row => row !== UNASSIGNED_ROW_MARKER);

if (firstPopulatedRowIndex > 0) {
    const dataToPropagate = finalGridOutput[firstPopulatedRowIndex];
    for (let i = 0; i < firstPopulatedRowIndex; i++) {
        finalGridOutput[i] = dataToPropagate;
    }
}

const formattedOutputLines = finalGridOutput.map(rowArray => rowArray.join(' '));

console.log(formattedOutputLines.join('\n'));
