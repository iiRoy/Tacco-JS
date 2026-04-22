let gridDimensionsData;
let pointValueStorage;
let memoizedResults;

function parseGridInput(rawTextContent) {
    const contentLines = rawTextContent.trim().split(/\r?\n/);
    const firstLineComponents = contentLines.shift().split(/\s+/).map(Number);
    const parsedDimensions = {
        matrixHeight: firstLineComponents[0],
        matrixWidth: firstLineComponents[1],
        itemCount: firstLineComponents[2]
    };

    const itemLocations = new Map();
    contentLines.forEach(line => {
        const [rCoord, cCoord, valValue] = line.split(/\s+/).map(Number);
        const mapKey = `${rCoord - 1}-${cCoord - 1}`;
        itemLocations.set(mapKey, valValue);
    });

    return { parsedDimensions, itemLocations };
}

function fetchItemValue(rowIdx, colIdx) {
    return pointValueStorage.get(`${rowIdx}-${colIdx}`) || 0;
}

function calculatePathValue(currentRow, currentCol) {
    if (currentRow < 0 || currentCol < 0) {
        return [0, 0, 0, 0]; // Default values for out-of-bounds cells
    }

    const currentKey = `${currentRow}-${currentCol}`;
    if (memoizedResults.has(currentKey)) {
        return memoizedResults.get(currentKey);
    }

    const cellAccumulators = [0, 0, 0, 0];

    // Inherit from the cell to the left (same row, previous column)
    const valuesFromLeft = calculatePathValue(currentRow, currentCol - 1);
    for (let stateIndex = 0; stateIndex < 4; stateIndex++) {
        cellAccumulators[stateIndex] = valuesFromLeft[stateIndex];
    }

    // Inherit from the cell above (previous row, same column)
    const valuesFromAbove = calculatePathValue(currentRow - 1, currentCol);
    let maxFromPreviousRow = 0;
    for (let stateIndex = 0; stateIndex < 4; stateIndex++) {
        maxFromPreviousRow = Math.max(maxFromPreviousRow, valuesFromAbove[stateIndex]);
    }
    cellAccumulators[0] = Math.max(cellAccumulators[0], maxFromPreviousRow);

    // Consider adding the item at the current location
    const itemAtCurrentLocation = fetchItemValue(currentRow, currentCol);
    if (itemAtCurrentLocation > 0) {
        for (let prevState = 2; prevState >= 0; prevState--) {
            cellAccumulators[prevState + 1] = Math.max(
                cellAccumulators[prevState + 1],
                cellAccumulators[prevState] + itemAtCurrentLocation
            );
        }
    }

    memoizedResults.set(currentKey, cellAccumulators);
    return cellAccumulators;
}

function executeGridTraversal(sourceInput) {
    const { parsedDimensions, itemLocations } = parseGridInput(sourceInput);
    gridDimensionsData = parsedDimensions;
    pointValueStorage = itemLocations;
    memoizedResults = new Map();

    const finalRow = gridDimensionsData.matrixHeight - 1;
    const finalCol = gridDimensionsData.matrixWidth - 1;

    const finalCellStates = calculatePathValue(finalRow, finalCol);

    let ultimateMaximum = 0;
    for (let stateIndex = 0; stateIndex < 4; stateIndex++) {
        ultimateMaximum = Math.max(ultimateMaximum, finalCellStates[stateIndex]);
    }

    console.log(ultimateMaximum);
}

executeGridTraversal(require("fs").readFileSync("/dev/stdin", "utf8"));