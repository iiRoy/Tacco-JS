const processVisualGridGeneration = (rawInputText) => {
    // --- Configuration Constants for Grid Characteristics ---
    const GRID_SIZE_UNIFORM = 100; // The dimension (width and height) of the square grid
    const GRID_HALF_DIM = GRID_SIZE_UNIFORM / 2; // Half the grid dimension for initial fill patterns
    const DOT_CHARACTER = '.'; // Symbol representing an empty or 'dot' cell
    const HASH_CHARACTER = '#'; // Symbol representing a filled or 'hash' cell
    const ROW_MODIFICATION_STEP = 2; // Factor for calculating row indices for modifications
    const COLUMN_MODIFICATION_STEP = 2; // Factor for calculating column indices for modifications

    // --- Input Processing and Initial Validation ---
    const inputLineSegments = rawInputText.split('\n');

    // Check for essential input data presence
    if (!inputLineSegments || inputLineSegments.length === 0 || !inputLineSegments[0]) {
        console.error("Critical: Input data is either missing or malformed. Cannot proceed.");
        return; // Exit if input is invalid
    }

    const countValuesAsString = inputLineSegments[0].split(' ');
    let targetDotCount = Number(countValuesAsString[0]); // Convert string to number for 'A'
    let targetHashCount = Number(countValuesAsString[1]); // Convert string to number for 'B'

    // Perform basic validation on parsed numerical counts
    if (isNaN(targetDotCount) || isNaN(targetHashCount) || targetDotCount < 0 || targetHashCount < 0) {
        console.warn("Warning: Non-positive or non-numeric counts detected. Defaulting to minimum valid values (1, 1).");
        targetDotCount = 1; // Ensure a minimum valid count
        targetHashCount = 1; // Ensure a minimum valid count
    }

    // --- Grid Initialization ---
    // Construct a 2D array (matrix) representing the visual grid.
    // The upper half (first 50 rows) is pre-filled with DOT_CHARACTER,
    // and the lower half (next 50 rows) is pre-filled with HASH_CHARACTER.
    const visualDisplayMatrix = Array.from({ length: GRID_SIZE_UNIFORM }, (_, rowIndex) => {
        const initialCellContent = (rowIndex < GRID_HALF_DIM) ? DOT_CHARACTER : HASH_CHARACTER;
        return Array(GRID_SIZE_UNIFORM).fill(initialCellContent);
    });

    // --- Apply Hash Character Modifications (based on targetHashCount - 1) ---
    // This loop places '#' characters onto the grid, primarily in the upper half.
    // The coordinate calculation follows a specific pattern from the original logic.
    for (let currentOperationCycle = 0; currentOperationCycle < targetHashCount - 1; ++currentOperationCycle) {
        const rowBaseNumerator = currentOperationCycle / GRID_SIZE_UNIFORM;
        const calculatedRowIndexOffset = Math.round(rowBaseNumerator) * ROW_MODIFICATION_STEP;
        const calculatedColumnIndex = (currentOperationCycle % GRID_HALF_DIM) * COLUMN_MODIFICATION_STEP;

        // Place the hash character at the computed coordinates.
        // No explicit boundary check here, mirroring original behavior which assumes in-bounds.
        visualDisplayMatrix[calculatedRowIndexOffset][calculatedColumnIndex] = HASH_CHARACTER;
    }

    // --- Apply Dot Character Modifications (based on targetDotCount - 1) ---
    // This loop places '.' characters onto the grid, primarily in the lower half.
    // The row calculation is inverted from the bottom of the grid.
    for (let currentOperationCycle = 0; currentOperationCycle < targetDotCount - 1; ++currentOperationCycle) {
        const rowBaseNumerator = currentOperationCycle / GRID_SIZE_UNIFORM;
        const calculatedRowIndexOffset = Math.round(rowBaseNumerator) * ROW_MODIFICATION_STEP;
        // Invert row index to target the bottom half of the grid
        const invertedRowIndex = (GRID_SIZE_UNIFORM - 1) - calculatedRowIndexOffset;
        const calculatedColumnIndex = (currentOperationCycle % GRID_HALF_DIM) * COLUMN_MODIFICATION_STEP;

        // Place the dot character at the computed coordinates.
        // No explicit boundary check here, mirroring original behavior.
        visualDisplayMatrix[invertedRowIndex][calculatedColumnIndex] = DOT_CHARACTER;
    }

    // --- Format and Assemble Output ---
    // Prepare an array to hold all lines of the final output string.
    const outputLinesCollection = [];

    // Add the grid dimensions header as the first line of output.
    outputLinesCollection.push(`${GRID_SIZE_UNIFORM} ${GRID_SIZE_UNIFORM}`);

    // Iterate through the processed grid rows to convert them into strings.
    let currentRowIterator = 0;
    while (currentRowIterator < GRID_SIZE_UNIFORM) {
        outputLinesCollection.push(visualDisplayMatrix[currentRowIterator].join(''));
        currentRowIterator++;
    }

    // Combine all collected lines into a single string, separated by newlines.
    const finalFormattedOutput = outputLinesCollection.join('\n');

    // --- Display Result ---
    // Output the fully rendered grid to the console.
    console.log(finalFormattedOutput);
};

// --- Entry Point for Node.js Environment Execution ---
// Reads input from standard input (/dev/stdin) and initiates the grid generation process.
processVisualGridGeneration(require("fs").readFileSync("/dev/stdin", "utf8"));