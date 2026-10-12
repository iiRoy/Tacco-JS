function calculateMaxSequence(startY, startX, currentGridSize, gridData) {
    const directionVectors = [
        [0, 1],   // Horizontal right (dy, dx)
        [1, -1],  // Diagonal down-left
        [1, 0],   // Vertical down
        [1, 1]    // Diagonal down-right
    ];

    let currentMaxSequence = 1; // A single '1' cell counts as a sequence of length 1

    for (const [deltaY, deltaX] of directionVectors) {
        let sequenceLength = 1; // Reset for each new direction

        // Iterate through potential steps in the current direction
        // The loop goes up to currentGridSize steps, allowing the boundary check to handle out-of-bounds
        for (let stepOffset = 1; stepOffset <= currentGridSize; stepOffset++) {
            const currentY = startY + (deltaY * stepOffset);
            const currentX = startX + (deltaX * stepOffset);

            // Check if the current coordinates are within grid boundaries
            const isOutOfBounds = currentY < 0 || currentX < 0 || currentY >= currentGridSize || currentX >= currentGridSize;
            if (isOutOfBounds) {
                break; // Stop exploring this direction if out of bounds
            }

            const requiredCellValue = 1; // The value we are looking for in the sequence
            if (gridData[currentY][currentX] !== requiredCellValue) {
                break; // Stop if the sequence is broken by a non-matching value
            }

            sequenceLength++; // Extend the sequence
        }
        currentMaxSequence = Math.max(currentMaxSequence, sequenceLength); // Update the maximum sequence found from this starting point
    }
    return currentMaxSequence;
}

const fileSystemModule = require('fs');
const inputFilePath = '/dev/stdin';
const rawData = fileSystemModule.readFileSync(inputFilePath, 'utf8');
const inputLines = rawData.trim().split("\n");

const terminationSentinel = 0; // Value indicating the end of input
let lineCursor = 0; // Pointer to the current line being processed in inputLines

// Helper function to read and parse a grid of a given size
function acquireGridData(sizeOfGrid) {
    const gridMatrix = [];
    for (let rowIterator = 0; rowIterator < sizeOfGrid; rowIterator++) {
        const currentLine = inputLines[lineCursor++];
        gridMatrix[rowIterator] = currentLine.split("").map(Number);
    }
    return gridMatrix;
}

// Helper function to process a single grid and determine the overall maximum sequence
function analyzeGridForMaxSequence(currentGridSize, gridContent) {
    let overallMaxSequenceInGrid = 0; // Initialize max for the current grid

    // Iterate over every cell in the grid
    for (let rowIterator = 0; rowIterator < currentGridSize; rowIterator++) {
        for (let colIterator = 0; colIterator < currentGridSize; colIterator++) {
            const cellValueAtCurrentPosition = gridContent[rowIterator][colIterator];
            const targetSequenceStarter = 1; // Sequences only start from '1'

            if (cellValueAtCurrentPosition === targetSequenceStarter) {
                // If a '1' is found, calculate the longest sequence starting from this point
                const sequenceLengthFromHere = calculateMaxSequence(rowIterator, colIterator, currentGridSize, gridContent);
                overallMaxSequenceInGrid = Math.max(overallMaxSequenceInGrid, sequenceLengthFromHere);
            }
        }
    }
    return overallMaxSequenceInGrid;
}

// Main loop to process multiple test cases from the input
while (true) {
    const gridSizeString = inputLines[lineCursor++];
    const currentGridDimension = Number(gridSizeString); // Convert string to number

    if (currentGridDimension === terminationSentinel) {
        break; // Exit the loop if the termination value is encountered
    }

    const gridContent = acquireGridData(currentGridDimension);
    const finalResultForThisCase = analyzeGridForMaxSequence(currentGridDimension, gridContent);
    console.log(finalResultForThisCase);
}
