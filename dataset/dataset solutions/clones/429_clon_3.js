const fileSystemModule = require('fs'); // Import the file system module
const PATH_TO_STDIN = '/dev/stdin'; // Define a constant for the input path
const ENCODING_UTF8 = 'utf8'; // Define encoding constant

// Define character constants for clarity and easy modification
const ZERO_PLACEHOLDER = 0;
const MARKER_A = 'A';
const MARKER_B = 'B';
const MARKER_C = 'C';
const MARKER_D = 'D';
const BOUNDARY_SENTINEL = 'X';
const OUTPUT_EMPTY_CELL_CHAR = '#';

/**
 * Attempts to fill the first available zero cell with MARKER_A.
 * Prioritizes the left-most zero.
 * @param {Array<number|string>} dataGrid The array representing the grid state.
 * @returns {boolean} True if a cell was filled, false otherwise.
 */
function processMarkerA(dataGrid) {
    // Start searching from the first actual content cell, skipping the left sentinel.
    const firstContentIdx = 1;
    const lastContentIdx = dataGrid.length - 2;

    for (let currentPosition = firstContentIdx; currentPosition <= lastContentIdx; ++currentPosition) {
        if (dataGrid[currentPosition] === ZERO_PLACEHOLDER) {
            dataGrid[currentPosition] = MARKER_A; // Place the marker
            return true; // Mission accomplished
        }
    }
    return false; // No zero cell found
}

/**
 * Processes a 'B' command. Tries to fill a zero cell based on neighbor conditions,
 * then falls back to filling the first available zero.
 * @param {Array<number|string>} dataGrid The array representing the grid state.
 * @returns {boolean} True if a cell was filled, false otherwise.
 */
function processMarkerB(dataGrid) {
    const firstContentIdx = 1;
    const lastContentIdx = dataGrid.length - 2;

    // Strategy 1: Iterate backwards to find a zero not flanked by 'A'
    for (let scanIndex = lastContentIdx; scanIndex >= firstContentIdx; --scanIndex) {
        const leftNeighbor = dataGrid[scanIndex - 1];
        const currentCell = dataGrid[scanIndex];
        const rightNeighbor = dataGrid[scanIndex + 1];

        // Check if current cell is zero and its neighbors are not 'A'
        if (currentCell === ZERO_PLACEHOLDER &&
            leftNeighbor !== MARKER_A &&
            rightNeighbor !== MARKER_A)
        {
            dataGrid[scanIndex] = MARKER_B; // Fill with 'B'
            return true; // Found and filled
        }
    }

    // Strategy 2: If no such cell found, fill the first available zero from left
    for (let scanIndex = firstContentIdx; scanIndex <= lastContentIdx; ++scanIndex) {
        if (dataGrid[scanIndex] === ZERO_PLACEHOLDER) {
            dataGrid[scanIndex] = MARKER_B; // Fill the first encountered zero
            return true; // Found and filled
        }
    }

    return false; // No zero cell could be filled
}

/**
 * Determines if a given number is odd.
 * @param {number} value The number to check.
 * @returns {boolean} True if the number is odd, false otherwise.
 */
const isOdd = (value) => (value % 2 !== 0);

/**
 * Processes a 'C' command. Attempts to fill a zero cell adjacent to a non-zero cell,
 * or fills a central cell if no such adjacency is found.
 * @param {Array<number|string>} dataGrid The array representing the grid state.
 * @param {number} originalGridSize The original size of the grid (excluding sentinels).
 * @returns {boolean} True if a cell was filled, false otherwise.
 */
function processMarkerC(dataGrid, originalGridSize) {
    const firstContentIdx = 1;
    const lastContentIdx = dataGrid.length - 2;

    // Strategy 1: Find a zero adjacent to a non-zero cell
    for (let position = firstContentIdx; position <= lastContentIdx; ++position) {
        const currentCellValue = dataGrid[position];
        const nextCellValue = dataGrid[position + 1];
        const previousCellValue = dataGrid[position - 1];

        // Check for non-zero current cell with zero to its right
        if (currentCellValue !== ZERO_PLACEHOLDER && nextCellValue === ZERO_PLACEHOLDER) {
            dataGrid[position + 1] = MARKER_C;
            return true;
        }
        // Check for non-zero current cell with zero to its left
        if (currentCellValue !== ZERO_PLACEHOLDER && previousCellValue === ZERO_PLACEHOLDER) {
            dataGrid[position - 1] = MARKER_C;
            return true;
        }
    }

    // Strategy 2: If no adjacent zero found, fill a central position
    // Calculate the 1-based index (relative to the sentinel-padded array)
    // for the 'middle' or 'middle-right' cell.
    let targetCenterIndex;
    if (isOdd(originalGridSize)) {
        // For odd length, e.g., N=3, indices 1,2,3. (3-1)/2 + 1 = 2 (middle cell)
        targetCenterIndex = Math.floor((originalGridSize - 1) / 2) + 1;
    } else {
        // For even length, e.g., N=4, indices 1,2,3,4. 4/2 + 1 = 3 (right of the two middle cells)
        targetCenterIndex = Math.floor(originalGridSize / 2) + 1;
    }

    // Ensure the calculated index is within the content bounds and is a zero
    if (targetCenterIndex >= firstContentIdx && targetCenterIndex <= lastContentIdx &&
        dataGrid[targetCenterIndex] === ZERO_PLACEHOLDER)
    {
        dataGrid[targetCenterIndex] = MARKER_C;
        return true;
    }

    return false; // No cell was filled
}

/**
 * Processes a 'D' command. Finds the widest segment of zeros and fills its center,
 * or fills the first available zero if no such segment exists.
 * @param {Array<number|string>} dataGrid The array representing the grid state.
 * @returns {boolean} True if a cell was filled, false otherwise.
 */
function processMarkerD(dataGrid) {
    // Structure: [centerIndex, maxRadius]
    let maxZeroSegmentInfo = [ZERO_PLACEHOLDER, ZERO_PLACEHOLDER];

    const firstContentIdx = 1;
    const lastContentIdx = dataGrid.length - 2;

    // Iterate through all content cells to find potential centers of zero segments
    for (let potentialCenterIdx = firstContentIdx; potentialCenterIdx <= lastContentIdx; ++potentialCenterIdx) {
        // Skip if the current cell is not a zero
        if (dataGrid[potentialCenterIdx] !== ZERO_PLACEHOLDER) {
            continue;
        }

        let leftSearchPointer = potentialCenterIdx;
        let rightSearchPointer = potentialCenterIdx;
        let currentRadius = 0; // Distance from center to boundary

        // Expand outwards from the potential center
        while (true) {
            // Move left pointer if it's not a sentinel
            if (dataGrid[leftSearchPointer] !== BOUNDARY_SENTINEL) {
                leftSearchPointer--;
            }
            // Move right pointer if it's not a sentinel
            if (dataGrid[rightSearchPointer] !== BOUNDARY_SENTINEL) {
                rightSearchPointer++;
            }

            // Break conditions:
            // 1. Both pointers hit sentinels (entire grid is zero or within bounds)
            if (dataGrid[leftSearchPointer] === BOUNDARY_SENTINEL && dataGrid[rightSearchPointer] === BOUNDARY_SENTINEL) {
                break;
            }
            // 2. Left pointer hit a non-zero, non-sentinel boundary
            if (dataGrid[leftSearchPointer] !== BOUNDARY_SENTINEL && dataGrid[leftSearchPointer] !== ZERO_PLACEHOLDER) {
                break;
            }
            // 3. Right pointer hit a non-zero, non-sentinel boundary
            if (dataGrid[rightSearchPointer] !== BOUNDARY_SENTINEL && dataGrid[rightSearchPointer] !== ZERO_PLACEHOLDER) {
                break;
            }

            // Increment radius if we successfully expanded
            currentRadius++;

            // Update max segment info if current segment is wider
            if (maxZeroSegmentInfo[1] < currentRadius) {
                maxZeroSegmentInfo = [potentialCenterIdx, currentRadius];
            }
        }
    }

    // After scanning all potential centers, if a valid segment was found
    if (maxZeroSegmentInfo[0] !== ZERO_PLACEHOLDER && maxZeroSegmentInfo[1] !== ZERO_PLACEHOLDER) {
        dataGrid[maxZeroSegmentInfo[0]] = MARKER_D; // Fill the center of the widest segment
        return true;
    }

    // Fallback: If no suitable segment found (or all cells are non-zero), fill the first zero
    for (let idx = firstContentIdx; idx <= lastContentIdx; ++idx) {
        if (dataGrid[idx] === ZERO_PLACEHOLDER) {
            dataGrid[idx] = MARKER_D;
            return true;
        }
    }

    return false; // No cell was filled
}

// --- Main Program Execution ---
(function main() {
    // Read all input from stdin
    const rawInputContent = fileSystemModule.readFileSync(PATH_TO_STDIN, ENCODING_UTF8);
    // Split into lines and remove any leading/trailing whitespace from the whole input
    let inputLines = rawInputContent.trim().split('\n');

    let processingIteration = 0;

    // Process input line by line until '0 0' is encountered
    for (;;) { // Infinite loop, will break internally
        processingIteration++;

        // Ensure there's a line to process
        if (inputLines.length === 0) {
            // console.error("Error: Unexpected end of input.");
            break;
        }

        const currentLine = inputLines.shift(); // Get the next line
        // Parse grid dimensions (N and M)
        const dimensions = currentLine.split(' ').map(val => parseInt(val, 10));

        const currentGridSize = dimensions[0]; // N: number of elements in the grid
        const numberOfCommands = dimensions[1]; // M: number of operations to perform

        // Termination condition: N=0 and M=0
        if (currentGridSize === 0 && numberOfCommands === 0) {
            break;
        }

        // Initialize the grid with '0's, then add boundary sentinels
        // The array will be 1-indexed for content, with 0 and N+1 as sentinels.
        const currentWorkingGrid = new Array(currentGridSize);
        for (let k = 0; k < currentGridSize; ++k) {
            currentWorkingGrid[k] = ZERO_PLACEHOLDER;
        }

        currentWorkingGrid.unshift(BOUNDARY_SENTINEL); // Add left sentinel
        currentWorkingGrid.push(BOUNDARY_SENTINEL);   // Add right sentinel

        // Process 'M' commands
        for (let commandIdx = 0; commandIdx < numberOfCommands; ++commandIdx) {
            if (inputLines.length === 0) {
                // console.error(`Error: Ran out of commands at iteration ${processingIteration}, command ${commandIdx}.`);
                break; // Exit command loop if no more commands
            }
            const commandType = inputLines.shift(); // Get the command character

            // Dispatch command to appropriate function
            switch (commandType) {
                case MARKER_A:
                    processMarkerA(currentWorkingGrid);
                    break;
                case MARKER_B:
                    processMarkerB(currentWorkingGrid);
                    break;
                case MARKER_C:
                    processMarkerC(currentWorkingGrid, currentGridSize);
                    break;
                case MARKER_D:
                    processMarkerD(currentWorkingGrid);
                    break;
                default:
                    // console.warn(`Warning: Unknown command type '${commandType}' encountered.`);
                    break;
            }
        }

        // Remove the sentinels before outputting the result
        currentWorkingGrid.shift(); // Remove left sentinel
        currentWorkingGrid.pop();   // Remove right sentinel

        // Join the array elements into a string and replace remaining '0's with '#'
        const finalOutputString = currentWorkingGrid.join('').replace(new RegExp(ZERO_PLACEHOLDER, 'g'), OUTPUT_EMPTY_CELL_CHAR);
        console.log(finalOutputString);
    }
})(); // Execute the main function immediately