const findDuplicateIndices = (sourceArray) => {
    const valueOccurrences = new Map();
    sourceArray.forEach(element => {
        valueOccurrences.set(element, (valueOccurrences.get(element) || 0) + 1);
    });

    const repeatedValues = new Set();
    for (const [val, count] of valueOccurrences.entries()) {
        if (count >= 2) {
            repeatedValues.add(val);
        }
    }

    const resultIndices = [];
    sourceArray.forEach((element, index) => {
        if (repeatedValues.has(element)) {
            resultIndices.push(index);
        }
    });
    return resultIndices;
};

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = fileContent.trim().split("\n");
let currentLineIndex = 0;
const totalCases = parseInt(inputLines[currentLineIndex++], 10);

for (let caseNumber = 0; caseNumber < totalCases; caseNumber++) {
    if (caseNumber !== 0) {
        console.log("\n");
    }

    const puzzleGrid = [];
    for (let r = 0; r < 9; r++) {
        puzzleGrid.push(inputLines[currentLineIndex++].split(" ").map(Number));
    }

    const errorLocations = new Set(); // Stores "row,col" strings for cells with duplicates

    const registerErrors = (indices, coordinateMap) => {
        indices.forEach(idx => {
            const [rowCoord, colCoord] = coordinateMap[idx];
            errorLocations.add(`${rowCoord},${colCoord}`);
        });
    };

    // Process rows
    puzzleGrid.forEach((rowContent, rowIndex) => {
        const indicesInRow = findDuplicateIndices(rowContent);
        const rowCoordinates = rowContent.map((_, colIndex) => [rowIndex, colIndex]);
        registerErrors(indicesInRow, rowCoordinates);
    });

    // Process columns
    for (let colIndex = 0; colIndex < 9; colIndex++) {
        const columnContent = Array.from({ length: 9 }, (_, rowIndex) => puzzleGrid[rowIndex][colIndex]);
        const indicesInColumn = findDuplicateIndices(columnContent);
        const columnCoordinates = columnContent.map((_, rowIndex) => [rowIndex, colIndex]);
        registerErrors(indicesInColumn, columnCoordinates);
    }

    // Process 3x3 blocks
    for (let blockRowStart = 0; blockRowStart < 3; blockRowStart++) {
        for (let blockColStart = 0; blockColStart < 3; blockColStart++) {
            const blockValues = [];
            const blockCoordinates = [];
            for (let rOffset = 0; rOffset < 3; rOffset++) {
                for (let cOffset = 0; cOffset < 3; cOffset++) {
                    const actualRow = blockRowStart * 3 + rOffset;
                    const actualCol = blockColStart * 3 + cOffset;
                    blockValues.push(puzzleGrid[actualRow][actualCol]);
                    blockCoordinates.push([actualRow, actualCol]);
                }
            }
            const indicesInBlock = findDuplicateIndices(blockValues);
            registerErrors(indicesInBlock, blockCoordinates);
        }
    }

    const formattedOutput = puzzleGrid.map((row, rIdx) =>
        row.map((value, cIdx) => {
            const cellKey = `${rIdx},${cIdx}`;
            return errorLocations.has(cellKey) ? `*${value}` : ` ${value}`;
        }).join('')
    ).join('\n');

    console.log(formattedOutput);
}
