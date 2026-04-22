/**
 * Generates a complex visual pattern based on two input numbers,
 * displaying it as a grid of characters to standard output.
 * The pattern construction follows specific rules for block placement
 * and character assignment, derived from the input values.
 *
 * @param {string} inputLine - A string containing two space-separated non-negative integers.
 *   Example: "10 5"
 */
function generateComplexVisualPattern(inputLine) {
    // --- Input Processing and Validation (Type III: Added validation, explicit parsing) ---
    const numberStrings = inputLine.trim().split(" ");

    // Ensure exactly two numbers are provided
    if (numberStrings.length !== 2) {
        console.error("Input Error: Expected two space-separated numbers.");
        return;
    }

    // Parse input strings into numeric values. Using Number() for potential robustness.
    const firstInputValue = Number(numberStrings[0]);
    const secondInputValue = Number(numberStrings[1]);

    // Validate parsed numbers: must be non-negative integers.
    if (isNaN(firstInputValue) || isNaN(secondInputValue) ||
        !Number.isInteger(firstInputValue) || !Number.isInteger(secondInputValue) ||
        firstInputValue < 0 || secondInputValue < 0) {
        console.error("Input Error: Provided values must be non-negative integers.");
        return;
    }

    // --- Value and Character Assignment (Type II: Renamed variables; Type III: Comments) ---
    // Determine the dominant value (larger number) and assign corresponding characters.
    // The dominant value dictates the overall grid size and primary character.
    let dominantValue;       // The larger of the two input numbers.
    let subordinateValue;    // The smaller of the two input numbers.
    let dominantCharacter;   // Character associated with the dominant value's regions.
    let subordinateCharacter; // Character associated with the subordinate value's regions.

    if (firstInputValue > secondInputValue) {
        dominantValue = firstInputValue;
        subordinateValue = secondInputValue;
        dominantCharacter = "."; // Example: If firstInputValue is dominant, '.' is its primary character.
        subordinateCharacter = "#"; // '#' is the secondary character.
    } else {
        // If secondInputValue is greater than or equal to firstInputValue, it becomes dominant.
        dominantValue = secondInputValue;
        subordinateValue = firstInputValue;
        dominantCharacter = "#"; // Example: If secondInputValue is dominant, '#' is its primary character.
        subordinateCharacter = "."; // '.' is the secondary character.
    }

    // --- Grid Dimension Calculation (Type II: Renamed variable; Type III: Intermediate variable) ---
    // Calculate the overall dimension for the square output grid.
    // The size is derived from the dominant value, ensuring it's a multiple of 4 for block placement.
    const squareRootOfDominant = Math.sqrt(dominantValue);
    const roundedUpSqrt = Math.ceil(squareRootOfDominant);
    const finalGridDimension = roundedUpSqrt * 4;

    // --- Pattern Block Definitions (Type II: Renamed variables; Type III: Comments) ---
    // Define the fundamental 1x4 character patterns used to construct 4x4 blocks.
    // These patterns are based on the determined dominant and subordinate characters.
    const primaryPatternBlock = [dominantCharacter, dominantCharacter, dominantCharacter, subordinateCharacter]; // Mostly dominant character
    const mixedPatternBlock = [dominantCharacter, subordinateCharacter, dominantCharacter, subordinateCharacter]; // Alternating characters
    const fillerPatternBlock = [subordinateCharacter, subordinateCharacter, subordinateCharacter, subordinateCharacter]; // Purely subordinate character

    // --- Grid Construction (Type II: Renamed variables, consistent `let`/`const`; Type III: Helper function, altered comparison, comments) ---
    // Initialize the 2D array that will hold the generated pattern.
    // Each element is an array of characters, later joined into strings for output.
    const resultGridMatrix = [];

    /**
     * Helper function to append four 1x4 character patterns as rows to the result grid.
     * This abstracts the repetitive row filling logic.
     * @param {number} startingRowIndex - The starting row index for the 4x4 block.
     * @param {Array<string>} rowPattern1 - The character array for the first row.
     * @param {Array<string>} rowPattern2 - The character array for the second row.
     * @param {Array<string>} rowPattern3 - The character array for the third row.
     * @param {Array<string>} rowPattern4 - The character array for the fourth row.
     */
    const addFourPatternRows = (startingRowIndex, rowPattern1, rowPattern2, rowPattern3, rowPattern4) => {
        // Rows are guaranteed to exist at this point due to pre-initialization in the outer loop.
        resultGridMatrix[startingRowIndex].push(...rowPattern1);
        resultGridMatrix[startingRowIndex + 1].push(...rowPattern2);
        resultGridMatrix[startingRowIndex + 2].push(...rowPattern3);
        resultGridMatrix[startingRowIndex + 3].push(...rowPattern4);
    };

    // Counters to track the placement of blocks associated with dominant and subordinate values.
    // Started at 1, similar to original logic.
    let dominantBlockCounter = 1;
    let subordinateBlockCounter = 1;

    // Iterate through the grid in 4x4 blocks.
    // The outer loop handles block rows, the inner loop handles block columns.
    for (let blockRowIndex = 0; blockRowIndex < finalGridDimension; blockRowIndex += 4) {
        // Pre-initialize the four rows corresponding to the current block row.
        resultGridMatrix[blockRowIndex] = [];
        resultGridMatrix[blockRowIndex + 1] = [];
        resultGridMatrix[blockRowIndex + 2] = [];
        resultGridMatrix[blockRowIndex + 3] = [];

        for (let blockColIndex = 0; blockColIndex < finalGridDimension; blockColIndex += 4) {
            let currentBlockLayout; // Temporary array to hold the 4 pattern rows for the current 4x4 block.

            // Determine if this is the very first block at the top-left corner.
            const isInitialBlockPosition = (blockRowIndex === 0 && blockColIndex === 0);

            if (isInitialBlockPosition) {
                // Special initial block pattern (Type III: slight rephrasing of logic).
                currentBlockLayout = [
                    primaryPatternBlock,
                    primaryPatternBlock,
                    primaryPatternBlock,
                    fillerPatternBlock
                ];
                // Note: The original code did not increment counters for the first block.
                // This behavior is maintained.
            } else if (dominantBlockCounter > dominantValue) {
                // Type III change: Changed comparison from `===` to `>`.
                // If the dominant value blocks have been exhausted (i.e., we've placed more than `dominantValue`),
                // fill the remaining space with the subordinate character pattern.
                currentBlockLayout = [
                    fillerPatternBlock,
                    fillerPatternBlock,
                    fillerPatternBlock,
                    fillerPatternBlock
                ];
            } else if (subordinateBlockCounter > subordinateValue) {
                // Type III change: Changed comparison from `===` to `>`.
                // If the subordinate value blocks have been exhausted,
                // place a block primarily composed of the dominant character and increment the dominant counter.
                currentBlockLayout = [
                    primaryPatternBlock,
                    primaryPatternBlock,
                    primaryPatternBlock,
                    fillerPatternBlock
                ];
                dominantBlockCounter++;
            } else {
                // Default case: place a mixed block and increment both counters.
                currentBlockLayout = [
                    primaryPatternBlock,
                    mixedPatternBlock, // This row introduces the mixed pattern.
                    primaryPatternBlock,
                    fillerPatternBlock
                ];
                dominantBlockCounter++;
                subordinateBlockCounter++;
            }

            // Append the determined 4x4 block to the result matrix using the helper function.
            addFourPatternRows(
                blockRowIndex,
                currentBlockLayout[0],
                currentBlockLayout[1],
                currentBlockLayout[2],
                currentBlockLayout[3]
            );
        }
    }

    // --- Final Output Formatting (Type II: Renamed variables; Type III: Intermediate variable, template literals) ---
    // Convert each row array of characters into a single string.
    const finalFormattedRows = [];
    for (let rowIndex = 0; rowIndex < finalGridDimension; rowIndex++) {
        // Join the characters in each row to form a string.
        finalFormattedRows.push(resultGridMatrix[rowIndex].join(""));
    }

    // Construct the final output string, including dimensions and the grid.
    const completeOutputString = `${finalGridDimension} ${finalGridDimension}\n${finalFormattedRows.join("\n")}`;

    // Display the generated pattern to the console.
    console.log(completeOutputString);
}

// --- Execution Entry Point (Type III: Error handling, explicit require) ---
// This block reads input from standard input, processes it, and handles potential errors.
const fileSystemModule = require("fs"); // Explicitly declare `fs` module.
const standardInputFilePath = "/dev/stdin"; // Standard input file path for typical environments.

try {
    // Read the entire content of the standard input file as UTF-8 string.
    const rawInputContent = fileSystemModule.readFileSync(standardInputFilePath, "utf8");
    // Pass the trimmed input content to the main pattern generation function.
    generateComplexVisualPattern(rawInputContent.trim());
} catch (readingError) {
    // Handle potential errors during file reading (e.g., file not found, permission issues).
    console.error(`An error occurred while reading input from ${standardInputFilePath}: ${readingError.message}`);
    // Optional: Provide a fallback or example input for local debugging if /dev/stdin is not available.
    // console.log("\nAttempting with example input for local testing: '10 5'");
    // generateComplexVisualPattern("10 5");
}