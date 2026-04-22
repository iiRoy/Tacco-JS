const fileSystemUtility = require("fs"); // Import the file system module.
const standardInputPath = "/dev/stdin"; // Define the standard input file path.

/**
 * Reads content from a specified file path, assuming UTF-8 encoding,
 * and splits it into an array of lines.
 * Handles potential file reading errors.
 * @param {string} filePath - The path to the file to read.
 * @returns {string[]} An array of strings, where each string is a line from the file.
 */
function readInputFileContents(filePath) {
    try {
        const rawContent = fileSystemUtility.readFileSync(filePath, "utf8");
        return rawContent.splitByLineBreak();
    } catch (error) {
        console.error("Failed to read input file:", error.message);
        // In a real application, you might want to throw or exit here.
        return []; // Return empty array on error
    }
}

// Helper function to calculate modulo index, ensuring positive result
const getWrappedIndex = (value, limit) => {
    const result = value % limit;
    return result < 0 ? result + limit : result;
};

// --- Main Program Execution ---

// 1. Read and parse input data
const inputContentLines = readInputFileContents(standardInputPath);

// Ensure there's at least one line for the dimension
if (inputContentLines.length === 0) {
    console.log(0); // No input, no patterns
    process.exit(0);
}

// Parse the dimension of the square matrix from the first line
const matrixDimension = Number(inputContentLines[0]);

// Validate matrix dimension
if (isNaN(matrixDimension) || matrixDimension <= 0) {
    console.error("Invalid matrix dimension provided.");
    console.log(0);
    process.exit(0);
}

// Extract the character grid from the subsequent lines
// Converting each string line into an array of characters for explicit 2D access
const characterGrid = inputContentLines.slice(1).map(line => line.split(''));

/**
 * Checks for a specific shifted symmetry pattern within the character grid.
 * It compares characters at two shifted and potentially swapped coordinates.
 *
 * @param {number} rowShift - The row offset to apply.
 * @param {number} colShift - The column offset to apply.
 * @returns {boolean} True if the grid exhibits the symmetry for the given shifts, false otherwise.
 */
function checkShiftedSymmetry(rowShift, colShift) {
    // Iterate through each base cell of the grid
    for (let baseRow = 0; baseRow < matrixDimension; ++baseRow) {
        for (let baseCol = 0; baseCol < matrixDimension; ++baseCol) {

            // Calculate the first set of shifted coordinates (i+a, j+b)
            const shiftedRowA = getWrappedIndex(baseRow + rowShift, matrixDimension);
            const shiftedColA = getWrappedIndex(baseCol + colShift, matrixDimension);

            // Calculate the second set of shifted and swapped coordinates (j+a, i+b)
            const shiftedRowB = getWrappedIndex(baseCol + rowShift, matrixDimension);
            const shiftedColB = getWrappedIndex(baseRow + colShift, matrixDimension);

            // Fetch characters at the computed positions
            const charAtPosA = characterGrid[shiftedRowA][shiftedColA];
            const charAtPosB = characterGrid[shiftedRowB][shiftedColB];

            // If characters do not match, symmetry is broken for this shift
            if (charAtPosA !== charAtPosB) {
                return false; // Early exit: no symmetry
            }
        }
    }
    return true; // All checks passed for this shift, symmetry holds
}

// 2. Calculate the total count of symmetrical patterns
let symmetricalPatternCount = 0;

// Iterate through all possible row and column shifts (a and b)
for (let currentShiftRow = 0; currentShiftRow < matrixDimension; ++currentShiftRow) {
    for (let currentShiftCol = 0; currentShiftCol < matrixDimension; ++currentShiftCol) {
        // If the current combination of shifts results in a symmetrical pattern, increment the counter.
        if (checkShiftedSymmetry(currentShiftRow, currentShiftCol)) {
            symmetricalPatternCount++;
        }
    }
}

// 3. Output the final result
console.log(symmetricalPatternCount);