/**
 * Processes raw input data to determine if a smaller pattern matrix
 * is present within a larger grid matrix. This function performs
 * extensive data validation and refactoring compared to its original form,
 * including robust error handling and improved readability.
 *
 * @param {string} rawInputData - The complete input as a single string,
 *                                typically read from standard input or a file.
 */
function processInputData(rawInputData) {
    // --- Type III: Added Robustness & Validation ---
    // Validate the initial input: ensure it's a non-empty string.
    if (typeof rawInputData !== 'string' || rawInputData.length === 0) {
        console.log("No"); // Output "No" for invalid or empty input.
        return;
    }

    // --- Type II: Renamed Variables, Improved Parsing ---
    // Split the entire input string into an array of individual lines.
    // `trim()` is used to handle potential leading/trailing whitespace in the whole input.
    const allInputLines = rawInputData.trim().split('\n');

    // --- Type III: Added Validation ---
    // Ensure there's at least one line to read the grid and pattern dimensions.
    if (allInputLines.length < 1) {
        console.log("No"); // Not enough input to even read dimensions.
        return;
    }

    // --- Type II: Renamed Variables, Used `const` and `map` for parsing ---
    // Parse the grid and pattern dimensions from the first line.
    // Using array destructuring and `map(Number)` for cleaner and more explicit type conversion.
    const dimensionStrings = allInputLines[0].split(' ');
    if (dimensionStrings.length < 2) {
        console.log("No"); // Not enough dimension values on the first line.
        return;
    }
    const [gridOverallDimension, patternSubDimension] = dimensionStrings.map(Number);

    // --- Type III: Added Comprehensive Dimension Validation ---
    // Validate the parsed dimensions. Dimensions must be positive integers,
    // and the pattern's size cannot exceed the grid's size.
    if (
        !Number.isInteger(gridOverallDimension) || gridOverallDimension <= 0 ||
        !Number.isInteger(patternSubDimension) || patternSubDimension <= 0 ||
        patternSubDimension > gridOverallDimension
    ) {
        console.log("No"); // Invalid dimensions detected (e.g., non-numeric, zero, negative, or pattern too large).
        return;
    }

    // --- Type III: Added Intermediate Variable for Clarity & Validation ---
    // Calculate the total number of lines expected for the grid and pattern data.
    const requiredMatrixDataLines = gridOverallDimension + patternSubDimension;

    // --- Type III: Added Validation ---
    // Further input validation: check if enough lines are provided for the matrices themselves.
    // (+1 because the first line contains the dimensions).
    if (allInputLines.length < 1 + requiredMatrixDataLines) {
        console.log("No"); // Insufficient data lines for the specified dimensions.
        return;
    }

    // --- Type II & III: Refactored Matrix Creation ---
    // Extract and transform the main grid data into a 2D array of characters.
    // The grid data starts from the second line (index 1) and covers 'gridOverallDimension' lines.
    const mainGridMatrix = allInputLines
        .slice(1, 1 + gridOverallDimension)
        .map(line => line.split('')); // Each line string is split into an array of characters.

    // Extract and transform the pattern data into a 2D array of characters.
    // The pattern data starts immediately after the grid lines.
    const searchPatternMatrix = allInputLines
        .slice(1 + gridOverallDimension, 1 + gridOverallDimension + patternSubDimension)
        .map(line => line.split('')); // Each pattern line string is split into an array of characters.

    // --- Type III: Added Matrix Structure Validation ---
    // Validate the actual dimensions of the created matrices. This checks if
    // each line had the expected number of characters, preventing ragged arrays or malformed input.
    if (
        mainGridMatrix.length !== gridOverallDimension ||
        !mainGridMatrix.every(row => row.length === gridOverallDimension) ||
        searchPatternMatrix.length !== patternSubDimension ||
        !searchPatternMatrix.every(row => row.length === patternSubDimension)
    ) {
        console.log("No"); // Mismatched matrix dimensions (e.g., ragged rows or wrong character count per line).
        return;
    }

    let isPatternSuccessfullyLocated = false; // --- Type II: Renamed flag variable, used `let` ---

    /**
     * --- Type III: Extracted Logic into Helper Function ---
     * Helper function to check if the pattern matrix exactly matches a sub-section
     * of the main grid, starting at a given top-left coordinate.
     *
     * @param {number} startRow - The starting row index in the main grid for comparison.
     * @param {number} startCol - The starting column index in the main grid for comparison.
     * @returns {boolean} True if the pattern matches the sub-grid, false otherwise.
     */
    const checkSubMatrixMatch = (startRow, startCol) => {
        // Iterate through each element of the pattern matrix.
        for (let patternRowIndex = 0; patternRowIndex < patternSubDimension; patternRowIndex++) {
            for (let patternColIndex = 0; patternColIndex < patternSubDimension; patternColIndex++) {
                // Compare corresponding characters from the main grid and the pattern.
                // The indices for the main grid are offset by `startRow` and `startCol`.
                if (
                    mainGridMatrix[startRow + patternRowIndex][startCol + patternColIndex] !==
                    searchPatternMatrix[patternRowIndex][patternColIndex]
                ) {
                    return false; // A mismatch was found, so this sub-section does not contain the pattern.
                }
            }
        }
        return true; // All characters matched, indicating the pattern was found in this sub-section.
    };

    // --- Type II: Renamed Loop Labels and Variables ---
    // Outer loops iterate through all possible top-left starting positions
    // for the pattern within the main grid.
    // The loops run from 0 up to (grid_dimension - pattern_dimension), inclusive.
    mainSearchLoop:
    for (let currentGridRowOffset = 0;
         currentGridRowOffset <= gridOverallDimension - patternSubDimension;
         currentGridRowOffset++) {

        for (let currentGridColOffset = 0;
             currentGridColOffset <= gridOverallDimension - patternSubDimension;
             currentGridColOffset++) {

            // --- Type III: Utilized Helper Function ---
            // Call the helper function to check for a pattern match at the current offset.
            if (checkSubMatrixMatch(currentGridRowOffset, currentGridColOffset)) {
                isPatternSuccessfullyLocated = true; // Set the flag to true as the pattern has been found.
                break mainSearchLoop; // Pattern found, exit all search loops immediately for efficiency.
            }
        }
    }

    // --- Type III: Simplified Output Logic ---
    // Output the final result based on whether the pattern was found.
    console.log(isPatternSuccessfullyLocated ? "Yes" : "No");
}

// --- Type II & III: Refactored Entry Point and Added Error Handling ---
// This block serves as the program's entry point.
// It reads input from /dev/stdin (standard input) or an optional file path
// provided as a command-line argument (process.argv[2]).
// A `try-catch` block is added for robust error handling during file operations
// or any unhandled exceptions during data processing.
try {
    const inputFilePath = process.argv[2] || "/dev/stdin";
    const fileContents = require("fs").readFileSync(inputFilePath, "utf8");
    processInputData(fileContents);
} catch (executionError) {
    // Log the error details for debugging purposes (e.g., file not found, permission issues).
    console.error("An error occurred during program execution:", executionError.message);
    // As a robust default, output "No" if any unhandled error occurs,
    // indicating that the pattern could not be successfully located due to an issue.
    console.log("No");
}