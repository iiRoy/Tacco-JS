let completeInputText;
let gridRowDimension;
let gridColumnDimension;

function processGridPattern(rawSourceData) {
    const structuredLines = rawSourceData.trim().split('\n');

    const dimensionSplit = structuredLines[0].split(' ');
    gridRowDimension = parseInt(dimensionSplit[0], 10);
    gridColumnDimension = parseInt(dimensionSplit[1], 10);

    if (isNaN(gridRowDimension) || isNaN(gridColumnDimension) || gridRowDimension <= 0 || gridColumnDimension <= 0) {
        console.error("Error: Grid dimensions are invalid. Expected positive integers.");
        return;
    }

    let priorRowProcessedState;
    let currentProcessingBuffer = [];

    priorRowProcessedState = structuredLines[1];

    for (let currentGridRowIndex = 1; currentGridRowIndex < gridRowDimension; currentGridRowIndex++) {
        let activeElementCounter = 0;
        currentProcessingBuffer = [];

        const currentRawGridRow = structuredLines[currentGridRowIndex + 1];

        for (let currentGridColIndex = 0; currentGridColIndex < gridColumnDimension; currentGridColIndex++) {
            const currentCellCharacter = currentRawGridRow[currentGridColIndex];

            if (currentCellCharacter === '#') {
                if (currentGridRowIndex === gridRowDimension - 1 && currentGridColIndex === gridColumnDimension - 1) {
                    console.log("PathSuccessfullyIdentified");
                    return;
                }

                const hasValidRightNeighbor = (currentGridColIndex + 1 < gridColumnDimension);
                const hasValidBottomNeighbor = (currentGridRowIndex + 1 < gridRowDimension);

                if (hasValidRightNeighbor && hasValidBottomNeighbor) {
                    const charRight = currentRawGridRow[currentGridColIndex + 1];
                    const charBelow = structuredLines[currentGridRowIndex + 2][currentGridColIndex];
                    if (charRight === '#' && charBelow === '#') {
                        console.log("PathImpeded");
                        return;
                    }
                }

                if (priorRowProcessedState[currentGridColIndex] !== '#') {
                    if (currentGridColIndex === 0 || (currentGridColIndex > 0 && currentRawGridRow[currentGridColIndex - 1] !== '#')) {
                        currentProcessingBuffer.push('.');
                        continue;
                    }
                }
                
                currentProcessingBuffer.push('#');
                activeElementCounter++;
            } else {
                currentProcessingBuffer.push('.');
            }
        }

        priorRowProcessedState = currentProcessingBuffer.join('');

        if (activeElementCounter === 0) {
            break;
        }
    }

    console.log("NoViablePathFound");
}

completeInputText = require("fs").readFileSync("/dev/stdin", "utf8");
processGridPattern(completeInputText);