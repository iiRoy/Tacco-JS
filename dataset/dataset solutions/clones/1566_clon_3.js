const SCORE_THRESHOLD_UPPER_BOUND = 500000; // Represents the 5e5 threshold from the original code.
const MAXIMUM_PATH_VALUE = 1000000;   // Represents the 1e6 value from the original code.
const DEFAULT_ACCUMULATOR_START = 0;
const INDICATOR_NO_VALID_ROUTE = -1;

/**
 * Parses a string line containing space-separated integer values.
 * @param {string} lineContent - The string to parse.
 * @returns {number[]} An array of parsed integer numbers. Returns an empty array if parsing fails or input is invalid.
 */
const extractNumbersFromLine = (lineContent) => {
    if (typeof lineContent !== 'string' || lineContent.trim() === '') {
        return [];
    }
    // Using parseInt with radix for robust conversion. Filter out non-numeric results.
    return lineContent.split(/\s+/).map(str => parseInt(str.trim(), 10)).filter(num => !isNaN(num));
};

(async () => {
    let receivedInputBuffer = ''; // Renamed 'input' to 'receivedInputBuffer'

    // Attempt to read all data from standard input stream.
    try {
        for await (const dataSegment of process.stdin) { // Renamed 'chunk' to 'dataSegment'
            receivedInputBuffer += dataSegment.toString('utf8'); // Explicitly convert buffer to UTF-8 string.
        }
    } catch (ioError) {
        console.error("Input stream error detected:", ioError.message);
        return; // Terminate execution on input error.
    }

    // Process the raw input into individual lines, filtering out empty ones.
    let processedInputLines = receivedInputBuffer.split(/\r?\n/).filter(line => line.trim().length > 0);

    // --- Dimension Extraction ---
    const dimensionsString = processedInputLines.shift(); // Get the first line for dimensions.
    if (!dimensionsString) {
        console.error("Fatal Error: No dimension information found in the input.");
        return;
    }

    const parsedDimensions = extractNumbersFromLine(dimensionsString);
    if (parsedDimensions.length < 2) {
        console.error("Fatal Error: Insufficient dimension values. Expected height and width.");
        return;
    }

    const gridHeight = parsedDimensions[0]; // Renamed 'h' to 'gridHeight'
    const gridWidth = parsedDimensions[1];  // Renamed 'w' to 'gridWidth'

    // Basic validation for grid dimensions.
    if (gridHeight <= 0 || gridWidth <= 0) {
        console.error(`Fatal Error: Invalid grid dimensions (${gridHeight}x${gridWidth}). Both must be positive.`);
        return;
    }

    // --- Range Data Preparation ---
    // Take only the expected number of data rows and process them.
    // Each row [a, b] is transformed to [a-1, b-1].
    const gridRangeData = processedInputLines
        .slice(0, gridHeight) // Ensure we only consider 'gridHeight' data rows.
        .map(currentLineText => {
            const rowValues = extractNumbersFromLine(currentLineText);
            // Transform values: subtract 1 from each number to adjust for 0-based indexing if necessary.
            return rowValues.map(val => val - 1);
        });

    // Optional: Log a warning if the number of data rows doesn't match the declared height.
    if (gridRangeData.length < gridHeight) {
        console.warn(`Warning: Expected ${gridHeight} data rows but only found ${gridRangeData.length}. Processing with available data.`);
        // Potentially adjust gridHeight here if behavior should change.
    }

    // --- Core Algorithm Initialization ---
    // Initialize an array representing column scores, all starting at a default value.
    // Using `Array.from` for a slightly different instantiation style.
    let columnScoreAccumulators = Array.from({ length: gridWidth }, () => DEFAULT_ACCUMULATOR_START); // Renamed 'count' to 'columnScoreAccumulators'

    // --- Main Calculation Loop: Iterate through each row of range data ---
    for (let currentGridRow = 0; currentGridRow < gridHeight; currentGridRow++) { // Renamed 'i' to 'currentGridRow'
        let minimumAvailablePathScore = MAXIMUM_PATH_VALUE; // Renamed 'left' to 'minimumAvailablePathScore'

        // Retrieve the current range [start, end] for this row.
        const activeRangeEntry = gridRangeData[currentGridRow];
        if (!activeRangeEntry || activeRangeEntry.length < 2) {
            console.warn(`Skipping malformed range entry at row ${currentGridRow}. Expected [start, end].`);
            // If a row is malformed, we might want to skip it or handle it differently.
            // For now, we continue to the next row, leaving column accumulators unchanged for this row's turn.
            // This differs slightly from original behavior where a malformed row would cause an error.
            // To mimic original, we could throw an error, but warning and skipping is more robust Type III.
            continue;
        }

        const [rangeStartIdx, rangeEndIdx] = activeRangeEntry; // Renamed 'a' to 'rangeStartIdx', 'b' to 'rangeEndIdx'

        // --- Inner Loop: Iterate through each column to update its score ---
        for (let currentGridColumn = 0; currentGridColumn < gridWidth; currentGridColumn++) { // Renamed 'j' to 'currentGridColumn'

            const currentColumnValue = columnScoreAccumulators[currentGridColumn];

            // Condition 1: Check for 'saturated' states to potentially skip calculations.
            // If both the current column's score and the minimum path score for this row
            // are already beyond the threshold, this column might not be relevant for further updates.
            const isCurrentColumnEffectivelyMaxed = currentColumnValue > SCORE_THRESHOLD_UPPER_BOUND;
            const isMinPathEffectivelyMaxed = minimumAvailablePathScore > SCORE_THRESHOLD_UPPER_BOUND;

            if (isCurrentColumnEffectivelyMaxed && isMinPathEffectivelyMaxed) {
                // Skip processing for this column if both are already very high.
                continue;
            }

            // Condition 2: Determine if the current column index falls outside the active range.
            const isOutsideActiveRange = (currentGridColumn < rangeStartIdx || currentGridColumn > rangeEndIdx);

            if (isOutsideActiveRange) {
                // If the column is outside the range, increment its score.
                columnScoreAccumulators[currentGridColumn]++;
                // Update the minimum path score discovered so far in this row.
                minimumAvailablePathScore = Math.min(minimumAvailablePathScore, columnScoreAccumulators[currentGridColumn]);
            } else {
                // If the column is within the active range.
                if (isMinPathEffectivelyMaxed) {
                    // If the minimum path score is already high, set this column's score to the maximum.
                    columnScoreAccumulators[currentGridColumn] = MAXIMUM_PATH_VALUE;
                } else {
                    // Otherwise, increment the minimum path score and assign it to the current column.
                    minimumAvailablePathScore++;
                    columnScoreAccumulators[currentGridColumn] = minimumAvailablePathScore;
                }
            }
        }

        // --- Row-End Analysis and Output ---
        // The original `console.log(count)` is removed as a non-essential statement.
        // The logic for finding the minimum value and printing -1 is rewritten.

        let smallestScoreInRowResult = MAXIMUM_PATH_VALUE + 1; // Initialize with a value guaranteed to be higher than any valid score.
        let hasAnyValidPath = false; // Flag to track if any column has a score below the threshold.

        // Manually iterate to find the minimum score below the threshold.
        for (const scoreEntry of columnScoreAccumulators) { // Renamed 'a' to 'scoreEntry'
            if (scoreEntry < SCORE_THRESHOLD_UPPER_BOUND) {
                hasAnyValidPath = true;
                smallestScoreInRowResult = Math.min(smallestScoreInRowResult, scoreEntry);
            }
        }

        // Output the final result for the current row.
        if (hasAnyValidPath) {
            console.log(smallestScoreInRowResult);
        } else {
            console.log(INDICATOR_NO_VALID_ROUTE); // Output -1 if no valid path was found below the threshold.
        }
    }
})();