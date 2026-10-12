(function(rawInputContent) {
    const parseInputToMatrices = (inputString) => {
        const cleanedInput = inputString.endsWith('\n') ? inputString.slice(0, -1) : inputString;
        const inputBlocks = cleanedInput.split('\n\n');

        const matrices = [];
        for (let blockIdx = 0; blockIdx < inputBlocks.length; blockIdx++) {
            const currentBlockLines = inputBlocks[blockIdx].split('\n');
            const numberMatrix = [];
            for (let lineIdx = 0; lineIdx < currentBlockLines.length; lineIdx++) {
                numberMatrix.push(currentBlockLines[lineIdx].split('').map(Number));
            }
            matrices.push(numberMatrix);
        }
        return matrices;
    };

    const allMatrices = parseInputToMatrices(rawInputContent);

    for (let matrixIdx = 0; matrixIdx < allMatrices.length; matrixIdx++) {
        const currentGrid = allMatrices[matrixIdx];
        console.log(detectShapeInGrid(currentGrid));
    }

})(require('fs').readFileSync('/dev/stdin', 'utf8'));

function detectShapeInGrid(inputGrid) {
    const GRID_DIMENSION = 8;
    for (let startRow = 0; startRow < GRID_DIMENSION; startRow++) {
        for (let startCol = 0; startCol < GRID_DIMENSION; startCol++) {
            const isStartingPoint = inputGrid[startRow][startCol] === 1;
            if (isStartingPoint) {
                return determineShapeType(inputGrid, startCol, startRow);
            }
        }
    }
    return undefined;
}

function determineShapeType(_gridForShapeCheck, baseX, baseY) {
    const checkRelativeCoords = (relativeOffsets) => {
        for (const [deltaX, deltaY] of relativeOffsets) {
            if (!isWithinBounds(_gridForShapeCheck, baseX + deltaX, baseY + deltaY)) {
                return false;
            }
        }
        return true;
    };

    const shapeDefinitions = [
        { id: 'A', offsets: [[1, 0], [0, 1], [1, 1]] },
        { id: 'B', offsets: [[0, 1], [0, 2], [0, 3]] },
        { id: 'C', offsets: [[1, 0], [2, 0], [3, 0]] },
        { id: 'D', offsets: [[0, 1], [-1, 1], [-1, 2]] },
        { id: 'E', offsets: [[1, 0], [1, 1], [2, 1]] },
        { id: 'F', offsets: [[0, 1], [1, 1], [1, 2]] },
        { id: 'G', offsets: [[1, 0], [0, 1], [-1, 1]] }
    ];

    for (const shape of shapeDefinitions) {
        if (checkRelativeCoords(shape.offsets)) {
            return shape.id;
        }
    }
    return undefined;
}

function isWithinBounds(_gridReference, colCoord, rowCoord) {
    const MIN_COORD = 0;
    const MAX_COORD = 8;
    return colCoord >= MIN_COORD && colCoord <= MAX_COORD &&
           rowCoord >= MIN_COORD && rowCoord <= MAX_COORD;
}
