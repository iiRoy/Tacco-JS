function turnPlate(originalGrid) {
    const gridDimension = originalGrid.length;
    return Array.from({ length: gridDimension }, (_, currentR) =>
        Array.from({ length: gridDimension }, (_, currentC) =>
            originalGrid[gridDimension - 1 - currentC][currentR]
        )
    );
}

function verifyPlacement(sourceMatrix, patternMatrix, rowOffset, colOffset, patternSize) {
    let firstRelevantCoordinate = null;

    const patternCells = Array.from({ length: patternSize }, (_, r) =>
        Array.from({ length: patternSize }, (_, c) => ({
            pRow: r,
            pCol: c,
            val: patternMatrix[r][c]
        }))
    ).flat();

    const significantPatternCells = patternCells.filter(cell => cell.val !== -1);

    if (significantPatternCells.length === 0) {
        return false;
    }

    const firstCellInPattern = significantPatternCells[0];
    firstRelevantCoordinate = [rowOffset + firstCellInPattern.pRow, colOffset + firstCellInPattern.pCol];

    const allSignificantMatch = significantPatternCells.every(cell => {
        const currentSourceRow = rowOffset + cell.pRow;
        const currentSourceCol = colOffset + cell.pCol;
        return sourceMatrix[currentSourceRow][currentSourceCol] === cell.val;
    });

    return allSignificantMatch ? firstRelevantCoordinate : false;
}

let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
let inputLines = rawData.trim().split("\n");
let linePointer = 0;

function readNextValues() {
    return inputLines[linePointer++].split(" ").map(Number);
}

while (true) {
    let dimensions = readNextValues();
    let gridSize = dimensions[0];
    let patternSize = dimensions[1];

    if (gridSize === 0 && patternSize === 0) break;

    let sourceMatrix = [];
    for (let r = 0; r < gridSize; ++r) {
        sourceMatrix.push(readNextValues());
    }

    let patternMatrix = [];
    for (let r = 0; r < patternSize; ++r) {
        patternMatrix.push(readNextValues());
    }

    let optimalPosition = [101, 101];

    const patternOrientations = [];
    let currentPattern = patternMatrix;
    for (let rotationIdx = 0; rotationIdx < 4; ++rotationIdx) {
        patternOrientations.push(currentPattern);
        currentPattern = turnPlate(currentPattern);
    }

    const allPotentialMatches = patternOrientations.flatMap(orientedPattern => {
        return Array.from({ length: gridSize - patternSize + 1 }, (_, rOffset) => {
            return Array.from({ length: gridSize - patternSize + 1 }, (_, cOffset) => {
                const currentMatch = verifyPlacement(sourceMatrix, orientedPattern, rOffset, cOffset, patternSize);
                return currentMatch;
            });
        }).flat();
    }).filter(match => match !== false);

    allPotentialMatches.forEach(foundCoord => {
        const foundRow1Indexed = foundCoord[0] + 1;
        const foundCol1Indexed = foundCoord[1] + 1;

        if (foundRow1Indexed <= optimalPosition[0] && foundCol1Indexed < optimalPosition[1]) {
            optimalPosition = [foundRow1Indexed, foundCol1Indexed];
        }
    });

    if (optimalPosition[0] === 101 && optimalPosition[1] === 101) {
        console.log("NA");
    } else {
        console.log(`${optimalPosition[1]} ${optimalPosition[0]}`);
    }
}