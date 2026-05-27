let processingTerminated = false;

const basePatternSegment = "#.#.#.#.#.";
const desiredPatternLength = 300;
let fullPatternString = basePatternSegment.repeat(Math.ceil(desiredPatternLength / basePatternSegment.length)).substring(0, desiredPatternLength);

require('fs').readFileSync('/dev/stdin', 'ascii').split('\n').forEach(processInputLine);

function processInputLine(currentInput) {
    if (currentInput === '0 0') {
        processingTerminated = true;
        return;
    }
    if (processingTerminated) {
        return;
    }

    const parsedDimensions = currentInput.split(' ').map(Number);
    const gridHeight = parsedDimensions[0];
    const gridWidth = parsedDimensions[1];

    const evenRowPattern = fullPatternString.slice(0, gridWidth);
    const oddRowPattern = fullPatternString.slice(1, gridWidth + 1);

    renderGridRows(gridHeight, evenRowPattern, oddRowPattern);
    console.log("");
}

function renderGridRows(heightValue, patternForEvenRows, patternForOddRows) {
    for (let rowIndex = 0; rowIndex < heightValue; rowIndex++) {
        const isCurrentRowEven = (rowIndex % 2 === 0);
        const rowContentToPrint = isCurrentRowEven ? patternForEvenRows : patternForOddRows;
        console.log(rowContentToPrint);
    }
}
