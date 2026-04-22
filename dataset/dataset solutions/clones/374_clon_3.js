const GRID_DIMENSION = 8;

function spinArray(sourceMatrix) {
    if (!Array.isArray(sourceMatrix) || sourceMatrix.length !== GRID_DIMENSION) {
        console.error("Input matrix must be an array of size", GRID_DIMENSION, ". Returning empty grid.");
        return Array.from({ length: GRID_DIMENSION }, () => Array(GRID_DIMENSION).fill(' '));
    }
    for (let r = 0; r < GRID_DIMENSION; r++) {
        if (!Array.isArray(sourceMatrix[r]) || sourceMatrix[r].length !== GRID_DIMENSION) {
            console.error(`Row ${r} of the input matrix must be an array of size`, GRID_DIMENSION, ". Returning empty grid.");
            return Array.from({ length: GRID_DIMENSION }, () => Array(GRID_DIMENSION).fill(' '));
        }
    }

    const rotatedResult = Array.from({ length: GRID_DIMENSION }, () => Array(GRID_DIMENSION).fill(' '));

    for (let targetRow = 0; targetRow < GRID_DIMENSION; targetRow++) {
        for (let targetCol = 0; targetCol < GRID_DIMENSION; targetCol++) {
            const originalSourceRow = (GRID_DIMENSION - 1) - targetCol;
            const originalSourceCol = targetRow;

            rotatedResult[targetRow][targetCol] = sourceMatrix[originalSourceRow][originalSourceCol];
        }
    }

    return rotatedResult;
}

function displayGrid(gridToDisplay) {
    if (!Array.isArray(gridToDisplay) || gridToDisplay.length === 0 || !Array.isArray(gridToDisplay[0])) {
        console.warn("Attempted to display an empty or invalid grid structure.");
        return;
    }

    const outputString = gridToDisplay
        .map(row => row.join(''))
        .join('\n');

    console.log(outputString);
    console.log("--- Grid Display Ends Here ---");
}

const fileSystemModule = require('fs');
const inputFilePath = '/dev/stdin';
let rawInputContent = '';

try {
    rawInputContent = fileSystemModule.readFileSync(inputFilePath, 'utf8');
} catch (error) {
    console.error(`Error reading input from ${inputFilePath}:`, error.message);
    process.exit(1);
}

const trimmedContent = rawInputContent.trim();
const linesOfData = trimmedContent.split('\n');

if (linesOfData.length !== GRID_DIMENSION) {
    console.error(`Input error: Expected ${GRID_DIMENSION} lines, but received ${linesOfData.length}.`);
    process.exit(1);
}

let currentWorkingMatrix = linesOfData.map((line, lineIndex) => {
    if (line.length !== GRID_DIMENSION) {
        console.error(`Input error: Line ${lineIndex + 1} has unexpected length (${line.length}). Expected ${GRID_DIMENSION}.`);
        process.exit(1);
    }
    return line.split('');
});

const numberOfRotations = 3;
for (let rotationCount = 1; rotationCount <= numberOfRotations; rotationCount++) {
    console.log(`\n--- Beginning Grid Display for Rotation #${rotationCount} ---`);
    currentWorkingMatrix = spinArray(currentWorkingMatrix);
    displayGrid(currentWorkingMatrix);
}

console.log("\nAll specified grid transformations have been successfully applied.");