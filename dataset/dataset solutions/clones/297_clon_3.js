const isCoordinateWithinBounds = (row, col, dimension) => {
    return row >= 0 && row < dimension && col >= 0 && col < dimension;
};

const STAR_CHARACTER = '*';

function calculateGridCellMetric(targetRowIndex, targetColIndex, activeGridData, gridDimensionSize) {
    // If the current cell is marked as a 'source' point, its metric value is 0.
    if (String(activeGridData[targetRowIndex][targetColIndex]) === STAR_CHARACTER) {
        activeGridData[targetRowIndex][targetColIndex] = 0;
        return;
    }

    // Define the relative coordinates for the three adjacent cells (top-left, top, left)
    const adjacentCellOffsets = [
        { rowOffset: -1, colOffset: -1 }, // Top-left neighbor
        { rowOffset: -1, colOffset: 0 },  // Top neighbor
        { rowOffset: 0, colOffset: -1 }   // Left neighbor
    ];

    let minimumFoundNeighborValue = Number.POSITIVE_INFINITY; // Initialize with a very large number
    let encounteredOutOfBoundsNeighbor = false; // Flag to track a specific boundary condition

    // Iterate through the defined neighbor offsets
    for (const offsetPair of adjacentCellOffsets) {
        const adjacentRow = targetRowIndex + offsetPair.rowOffset;
        const adjacentCol = targetColIndex + offsetPair.colOffset;

        // Check if the current adjacent cell is outside the grid boundaries
        if (!isCoordinateWithinBounds(adjacentRow, adjacentCol, gridDimensionSize)) {
            encounteredOutOfBoundsNeighbor = true; // Mark that an OOB neighbor was found
            // As per the problem's specific rule, if any of these three neighbors are OOB,
            // the current cell's value becomes 1. So, we can stop checking further neighbors.
            break;
        }
        
        // Update the minimum value found among the valid, in-bounds adjacent cells
        // Ensure the grid value is converted to a number for comparison
        minimumFoundNeighborValue = Math.min(minimumFoundNeighborValue, Number(activeGridData[adjacentRow][adjacentCol]));
    }

    let determinedCellResult; // Variable to store the final metric for the current cell

    // Apply the specific boundary condition rule:
    // If any of the three critical neighbors were out of bounds, this cell's metric is 1.
    if (encounteredOutOfBoundsNeighbor) {
        determinedCellResult = 1;
    } else {
        // Otherwise, the metric is one more than the minimum of its valid critical neighbors.
        determinedCellResult = minimumFoundNeighborValue + 1;
    }
    
    // Assign the calculated metric back to the grid cell
    activeGridData[targetRowIndex][targetColIndex] = determinedCellResult;
}

// --- Main Program Execution Logic ---

const filesystemModule = require('fs'); // Renamed the 'fs' module reference
const standardInputSource = '/dev/stdin'; // Extracted the input file path

// Read the entire content of the standard input file synchronously
const rawFileContent = filesystemModule.readFileSync(standardInputSource, 'utf8');

// Pre-process the input: remove leading/trailing whitespace and split into an array of lines
let inputDataLines = rawFileContent.trim().split('\n');

let currentGridDimension;
// Loop through each test case until a grid dimension of zero is read
while ((currentGridDimension = Number(inputDataLines.shift())) !== 0) {
    // Optional Type III addition: Basic validation for the grid dimension
    if (isNaN(currentGridDimension) || currentGridDimension < 1) {
        // If an invalid dimension is found, log an error (or skip) and proceed to the next line.
        // console.error("Invalid grid dimension encountered. Skipping current test case.");
        continue; 
    }

    let overallHighestMetric = Number.MIN_SAFE_INTEGER; // Initialize maximum metric for the current grid
    
    // Construct the 2D grid (matrix) by processing the input lines
    const processingBoardMatrix = Array.from({ length: currentGridDimension }, (_, rowIndex) => {
        const currentLine = inputDataLines.shift();
        // Defensive check: ensure the line exists before splitting
        return currentLine ? currentLine.split('') : Array(currentGridDimension).fill(' '); 
    });

    // Iterate over every cell in the grid to compute its distance metric
    for (let r = 0; r < currentGridDimension; r++) {
        for (let c = 0; c < currentGridDimension; c++) {
            // Call the function to determine the metric for the current cell
            calculateGridCellMetric(r, c, processingBoardMatrix, currentGridDimension);
            
            // Update the overall highest metric if the current cell's value is greater
            overallHighestMetric = Math.max(overallHighestMetric, Number(processingBoardMatrix[r][c]));
        }
    }

    // Output the maximum calculated distance for the completed grid
    console.log(overallHighestMetric);
}