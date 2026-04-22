// Function to generate a complex grid pattern based on two input numbers.
// This utility processes an input string, extracts two numeric values,
// and constructs a visual pattern using two distinct characters.
function generateComplexPattern(inputLine) {
    // Validate input before processing.
    // Ensures the input is a non-empty string.
    if (!inputLine || typeof inputLine !== 'string' || inputLine.trim().length === 0) {
        console.error("Error: Input line is empty or invalid.");
        return; // Exit if input is bad
    }

    // Parse the input string into an array of numbers.
    // We expect two space-separated integers.
    const numericValues = inputLine.split(/\s+/).map(Number);

    // Ensure we have exactly two valid numbers.
    // Basic validation to prevent unexpected behavior with malformed input.
    if (numericValues.length !== 2 || isNaN(numericValues[0]) || isNaN(numericValues[1])) {
        console.error("Error: Expected two valid numbers in the input.");
        return;
    }

    // Initialize variables for cell counts and character types.
    // `primaryCellCount` will always hold the larger of the two input numbers,
    // and `secondaryCellCount` the smaller.
    let primaryCellCount;
    let secondaryCellCount;
    let primaryFillChar;   // Character for the primary pattern blocks (e.g., '.', '#')
    let secondaryFillChar; // Character for the secondary pattern blocks (e.g., '#', '.')

    // Determine which number is larger and assign characters accordingly.
    // This logic sets up the dominant and subordinate counts/characters.
    if (numericValues[0] > numericValues[1]) {
        primaryCellCount = numericValues[0];
        secondaryCellCount = numericValues[1];
        primaryFillChar = ".";
        secondaryFillChar = "#";
    } else {
        primaryCellCount = numericValues[1];
        secondaryCellCount = numericValues[0];
        primaryFillChar = "#";
        secondaryFillChar = ".";
    }

    // Calculate the overall dimension of the square grid.
    // The grid size is a multiple of 4, determined by the ceiling of the square root
    // of the primary cell count, multiplied by 4 to accommodate 4x4 blocks.
    const gridDimension = Math.ceil(Math.sqrt(primaryCellCount)) * 4;

    // Define the fundamental 4x1 block configurations.
    // These arrays represent individual rows within a 4x4 block.
    const blockRowConfigPrimaryDominant = [primaryFillChar, primaryFillChar, primaryFillChar, secondaryFillChar]; // 3 primary, 1 secondary
    const blockRowConfigMixed = [primaryFillChar, secondaryFillChar, primaryFillChar, secondaryFillChar]; // Alternating primary/secondary
    const blockRowConfigSecondaryOnly = [secondaryFillChar, secondaryFillChar, secondaryFillChar, secondaryFillChar]; // All secondary

    // Initialize the 2D array that will hold the final grid pattern.
    // Each element will be an array of characters, representing a row of the grid.
    const outputGrid = [];

    // Counters to track how many primary and secondary 'cells' have been symbolically filled.
    // These determine which block pattern to use.
    let currentPrimaryFilled = 1;
    let currentSecondaryFilled = 1;

    // Pre-define the full 4x4 block patterns using the row configurations.
    // This enhances readability and reduces repetition in the main loop.
    const initialBlockPattern = [
        blockRowConfigPrimaryDominant,
        blockRowConfigPrimaryDominant,
        blockRowConfigPrimaryDominant,
        blockRowConfigSecondaryOnly
    ];
    const primaryReachedBlockPattern = [
        blockRowConfigSecondaryOnly,
        blockRowConfigSecondaryOnly,
        blockRowConfigSecondaryOnly,
        blockRowConfigSecondaryOnly
    ];
    const secondaryReachedBlockPattern = [
        blockRowConfigPrimaryDominant,
        blockRowConfigPrimaryDominant,
        blockRowConfigPrimaryDominant,
        blockRowConfigSecondaryOnly
    ];
    const standardMixedBlockPattern = [
        blockRowConfigPrimaryDominant,
        blockRowConfigMixed,
        blockRowConfigPrimaryDominant,
        blockRowConfigSecondaryOnly
    ];

    // Iterate through the grid in 4x4 blocks.
    // `rowBase` and `colBase` represent the top-left corner of each 4x4 block.
    for (let rowBase = 0; rowBase < gridDimension; rowBase += 4) {
        // Initialize the 4 rows for the current block iteration if they don't exist.
        // This ensures `outputGrid[rowBase + k]` is an array before pushing elements.
        for (let k = 0; k < 4; k++) {
            if (!outputGrid[rowBase + k]) {
                outputGrid[rowBase + k] = [];
            }
        }

        for (let colBase = 0; colBase < gridDimension; colBase += 4) {
            // Determine which 4x4 block pattern to apply based on counters and position.
            let activePatternBlock;

            if (rowBase === 0 && colBase === 0) {
                // Special case for the very first 4x4 block.
                activePatternBlock = initialBlockPattern;
            } else if (currentPrimaryFilled >= primaryCellCount) {
                // If the primary cell count is met or exceeded, fill with secondary-only blocks.
                activePatternBlock = primaryReachedBlockPattern;
            } else if (currentSecondaryFilled >= secondaryCellCount) {
                // If secondary cell count is met, but not primary, use the 'secondary reached' pattern.
                activePatternBlock = secondaryReachedBlockPattern;
                currentPrimaryFilled++; // Only primary count increments here.
            } else {
                // Default case: use the standard mixed pattern.
                activePatternBlock = standardMixedBlockPattern;
                currentPrimaryFilled++;
                currentSecondaryFilled++;
            }

            // Append the determined 4x4 block to the output grid.
            // This loop iterates through the 4 rows of the chosen block pattern.
            for (let blockRowOffset = 0; blockRowOffset < 4; blockRowOffset++) {
                outputGrid[rowBase + blockRowOffset].push(...activePatternBlock[blockRowOffset]);
            }
        }
    }

    // After populating the grid with characters, join each row's characters into a single string.
    const finalPatternRows = outputGrid.map(rowArray => rowArray.join(""));

    // Output the grid dimensions followed by the pattern.
    // Using multiple console logs for distinct output parts.
    console.log(`${gridDimension} ${gridDimension}`);
    console.log(finalPatternRows.join("\n"));
}

// --- Main execution block ---
// Read input from standard input, process it, and generate the pattern.
// Includes error handling for file reading.
try {
    const rawInput = require("fs").readFileSync("/dev/stdin", "utf8");
    const cleanedInput = rawInput.trim(); // Remove leading/trailing whitespace
    generateComplexPattern(cleanedInput);
} catch (error) {
    console.error("An error occurred during input reading or processing:", error.message);
    // Optionally, could provide a default input or exit with a specific code.
    process.exit(1);
}