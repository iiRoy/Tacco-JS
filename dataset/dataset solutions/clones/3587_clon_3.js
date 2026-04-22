let gridHeightDimension = 0;
let gridWidthDimension = 0;

/**
 * Main entry point for processing the grid data.
 * This function orchestrates parsing input,
 * identifying and eliminating "white" rows/columns,
 * and presenting the final processed grid.
 * @param {string} rawInputData - The raw string input, typically from stdin.
 */
function processGridData(rawInputData) {
    const inputLines = rawInputData.split('\n');

    if (!inputLines || inputLines.length === 0) {
        console.error("Error: No input data provided.");
        return;
    }

    const firstLineParts = inputLines[0].split(' ');
    if (firstLineParts.length < 2) {
        console.error("Error: Invalid dimension line format. Expected two numbers.");
        return;
    }

    gridHeightDimension = parseInt(firstLineParts[0], 10);
    gridWidthDimension = parseInt(firstLineParts[1], 10);

    if (isNaN(gridHeightDimension) || isNaN(gridWidthDimension) || gridHeightDimension <= 0 || gridWidthDimension <= 0) {
        console.error(`Error: Invalid grid dimensions parsed: Height=${gridHeightDimension}, Width=${gridWidthDimension}.`);
        return;
    }

    const gridContentLines = inputLines.slice(1);
    let currentProcessingGrid = initializeGridStructure(gridContentLines);

    if (currentProcessingGrid.length !== gridHeightDimension || (currentProcessingGrid.length > 0 && currentProcessingGrid[0].length !== gridWidthDimension)) {
        console.warn(`Warning: Initialized grid dimensions (${currentProcessingGrid.length}x${currentProcessingGrid.length > 0 ? currentProcessingGrid[0].length : 0}) do not match specified H/W (${gridHeightDimension}x${gridWidthDimension}). Adjusting H/W to actual grid size.`);
        gridHeightDimension = currentProcessingGrid.length;
        if (currentProcessingGrid.length > 0) {
            gridWidthDimension = currentProcessingGrid[0].length;
        } else {
            gridWidthDimension = 0;
        }
    }

    // First pass: Eliminate "white" rows based on the current grid height.
    for (let currentLineIndex = 0; currentLineIndex < gridHeightDimension; currentLineIndex++) {
        currentProcessingGrid = markOrEliminateLine(currentProcessingGrid, currentLineIndex);
    }

    // Rotate the grid to process columns as rows.
    currentProcessingGrid = rotateGrid(currentProcessingGrid);

    // Second pass: Eliminate "white" rows (which were original columns) based on the current grid width.
    for (let currentLineIndex = 0; currentLineIndex < gridWidthDimension; currentLineIndex++) {
        currentProcessingGrid = markOrEliminateLine(currentProcessingGrid, currentLineIndex);
    }

    // Rotate back to original orientation for final display.
    const finalDisplayGrid = rotateGrid(currentProcessingGrid);

    presentGridOutput(finalDisplayGrid);
}

/**
 * Presents the final processed grid to the console.
 * It filters out "marked for removal" cells ('n') and skips entirely empty/marked rows.
 * @param {Array<Array<string>>} gridToDisplay - The 2D array representing the final grid state.
 */
function presentGridOutput(gridToDisplay) {
    if (!gridToDisplay || gridToDisplay.length === 0) {
        return; // No output for an empty grid.
    }

    for (const lineOfCells of gridToDisplay) {
        let hasDisplayableContent = false;
        const processedLine = [];

        // Iterate through each cell to build the output line, filtering 'n's.
        for (const cellValue of lineOfCells) {
            if (cellValue !== 'n') {
                processedLine.push(cellValue);
                hasDisplayableContent = true;
            }
        }

        if (hasDisplayableContent) {
            console.log(processedLine.join(''));
        }
    }
}

/**
 * Marks a specific row in the grid for removal if it consists solely of "white" cells ('.' or 'n').
 * Returns a new grid with the row marked, or the original grid if no marking is needed.
 * @param {Array<Array<string>>} sourceGrid - The 2D array representing the current grid state.
 * @param {number} targetRowIndex - The index of the row to check and potentially mark.
 * @returns {Array<Array<string>>} A new grid with the row marked 'n' or the original grid.
 */
function markOrEliminateLine(sourceGrid, targetRowIndex) {
    if (!sourceGrid || sourceGrid.length === 0 || targetRowIndex < 0 || targetRowIndex >= sourceGrid.length) {
        return sourceGrid; // Cannot process invalid row.
    }

    const rowToCheck = sourceGrid[targetRowIndex];
    let isEntireLineRemovable = true;

    // Helper set for quick lookup of removable cell indicators.
    const removableCellIndicators = new Set(['.', 'n']);

    // Check each cell in the row to see if it's "white".
    for (const currentCell of rowToCheck) {
        if (!removableCellIndicators.has(currentCell)) {
            isEntireLineRemovable = false;
            break;
        }
    }

    if (!isEntireLineRemovable) {
        return sourceGrid; // If not "white", return grid unchanged.
    }

    // If the line is "white", create a new grid with this line marked.
    const gridWithMarkedLine = [];
    for (let r = 0; r < sourceGrid.length; r++) {
        const newRow = [];
        for (let c = 0; c < sourceGrid[r].length; c++) {
            if (r === targetRowIndex) {
                newRow.push('n'); // Mark the entire row with 'n'.
            } else {
                newRow.push(sourceGrid[r][c]); // Keep original cell value.
            }
        }
        gridWithMarkedLine.push(newRow);
    }
    return gridWithMarkedLine;
}

/**
 * Transposes the given 2D array (matrix). Rows become columns and columns become rows.
 * @param {Array<Array<string>>} inputGrid - The grid to be transposed.
 * @returns {Array<Array<string>>} The transposed grid.
 */
function rotateGrid(inputGrid) {
    if (!inputGrid || inputGrid.length === 0 || inputGrid[0].length === 0) {
        return []; // Return an empty grid if input is invalid.
    }

    const currentRows = inputGrid.length;
    const currentCols = inputGrid[0].length;

    // Initialize a new grid with dimensions swapped (cols x rows).
    const transposedResultGrid = [];
    for (let c = 0; c < currentCols; c++) {
        const newRow = [];
        for (let r = 0; r < currentRows; r++) {
            newRow.push(''); // Initialize with empty string placeholder.
        }
        transposedResultGrid.push(newRow);
    }

    // Populate the new grid with transposed values.
    for (let rIndex = 0; rIndex < currentRows; rIndex++) {
        for (let cIndex = 0; cIndex < currentCols; cIndex++) {
            transposedResultGrid[cIndex][rIndex] = inputGrid[rIndex][cIndex];
        }
    }
    return transposedResultGrid;
}

/**
 * Initializes the grid structure from an array of input strings.
 * Each string becomes a row, and each character in the string becomes a cell.
 * Empty lines are filtered out.
 * @param {Array<string>} rawLines - An array of strings, where each string represents a row.
 * @returns {Array<Array<string>>} The initialized 2D grid.
 */
function initializeGridStructure(rawLines) {
    if (!rawLines || rawLines.length === 0) {
        return []; // Return empty grid for no input.
    }

    const preparedGrid = [];
    // Iterate through each raw line to form grid rows.
    for (const singleInputLine of rawLines) {
        const trimmedLine = singleInputLine.trim();
        if (trimmedLine.length > 0) {
            preparedGrid.push(trimmedLine.split('')); // Split line into character array.
        }
    }
    return preparedGrid;
}

/**
 * Reads input from stdin. Includes a fallback for local testing.
 * @returns {string} The content read from stdin.
 */
function readStandardInput() {
    try {
        return require("fs").readFileSync("/dev/stdin", "utf8");
    } catch (e) {
        console.error("Failed to read from /dev/stdin:", e.message);
        // Fallback for local testing or environments without /dev/stdin
        return `4 4\n.#.#\n....\n.#.#\n....`;
    }
}

// Execute the main processing function with data from standard input.
processGridData(readStandardInput());