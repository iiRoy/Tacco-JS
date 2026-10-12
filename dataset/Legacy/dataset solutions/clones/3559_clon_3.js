const parseGridDimensions = (inputLine) => {
    const dimensionParts = inputLine.split(" ");
    const gridHeight = parseInt(dimensionParts[0], 10);
    const gridWidth = parseInt(dimensionParts[1], 10); // Width is parsed but not directly used later
    return { height: gridHeight, width: gridWidth };
};

const collectOddCellCoordinates = (inputLines, totalHeight) => {
    const oddValueLocations = [];
    for (let rowIndex = 1; rowIndex <= totalHeight; rowIndex++) {
        const rowCellValues = inputLines[rowIndex].split(" ");
        for (let colIndex = 0; colIndex < rowCellValues.length; colIndex++) {
            const currentCellValue = parseInt(rowCellValues[colIndex], 10);
            if (currentCellValue % 2 !== 0) {
                oddValueLocations.push([rowIndex, colIndex + 1]); // Store 1-indexed coordinates
            }
        }
    }
    return oddValueLocations;
};

const computeTransferPath = (sourceCoord, destinationCoord) => {
    const pathOperations = [];
    const currentMutableCoord = [...sourceCoord]; // Create a mutable copy of the source
    const destinationCoordString = destinationCoord.toString(); // Cache string representation for comparison

    while (currentMutableCoord.toString() !== destinationCoordString) {
        if (currentMutableCoord[1] < destinationCoord[1]) {
            // Move right: (r, c) -> (r, c+1)
            pathOperations.push([currentMutableCoord[0], currentMutableCoord[1], currentMutableCoord[0], ++currentMutableCoord[1]]);
        } else {
            // Move down: (r, c) -> (r+1, c)
            pathOperations.push([currentMutableCoord[0], currentMutableCoord[1], ++currentMutableCoord[0], currentMutableCoord[1]]);
        }
    }
    return pathOperations;
};

function executeGridParityOperations(inputDataLines) {
    const { height: gridHeight } = parseGridDimensions(inputDataLines[0]);

    const allOddCellPositions = collectOddCellCoordinates(inputDataLines, gridHeight);

    const finalOperationList = [];
    const numberOfOddCells = allOddCellPositions.length;

    // Process odd cells in pairs to generate transfer paths
    for (let pairIterator = 0; pairIterator < Math.floor(numberOfOddCells / 2); pairIterator++) {
        const currentStartPoint = allOddCellPositions[pairIterator * 2];
        const currentEndPoint = allOddCellPositions[pairIterator * 2 + 1];

        const movesForCurrentPair = computeTransferPath(currentStartPoint, currentEndPoint);
        finalOperationList.push(...movesForCurrentPair);
    }

    console.log(finalOperationList.length);
    console.log(finalOperationList.join("\n"));
}

executeGridParityOperations(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
