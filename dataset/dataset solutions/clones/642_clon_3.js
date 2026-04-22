const fileSystem = require('fs'); // Import the Node.js file system module for input operations.

/**
 * Calculates the minimum cost to transform a given flag into a specific
 * three-stripe pattern: White (top), Blue (middle), Red (bottom).
 * Each stripe must consist of at least one row.
 * The input is read from /dev/stdin.
 */
function calculateOptimalFlagTransformationCost() {
    // Read the raw input string from standard input.
    // The input is expected to contain flag dimensions and then color data.
    const rawFlagData = fileSystem.readFileSync('/dev/stdin', 'utf8');

    // --- Phase 1: Input Processing and Normalization ---

    // Clean up the raw input: remove leading/trailing whitespace,
    // then replace 'W', 'B', 'R' characters with numeric equivalents ('0', '1', '2').
    // Finally, split the entire string into an array of individual lines.
    const normalizedLines = rawFlagData
        .trim()
        .replace(/W/g, "0") // Convert White to '0'
        .replace(/B/g, "1") // Convert Blue to '1'
        .replace(/R/g, "2") // Convert Red to '2'
        .split("\n");

    // Extract the flag's dimensions (number of rows and columns) from the very first line.
    // The `shift()` method removes this line from the `normalizedLines` array.
    const [numRowsStr, numColsStr] = normalizedLines.shift().split(" ");
    const totalFlagRows = Number(numRowsStr);    // Corresponds to 'n' in the original code
    const totalFlagColumns = Number(numColsStr); // Corresponds to 'm' in the original code

    // --- Phase 2: Pre-calculate Transformation Costs per Row ---

    // Construct a cost matrix where each entry `rowCosts[k]` is an array:
    // `[cost_to_make_row_k_white, cost_to_make_row_k_blue, cost_to_make_row_k_red]`.
    // The cost for a specific color is the number of cells in that row
    // that are NOT the desired color.
    const rowTransformationCosts = normalizedLines.map(lineCharData => {
        // Initialize counters for each color present in the current row.
        // Index 0 for '0' (White), 1 for '1' (Blue), 2 for '2' (Red).
        const colorCountsInCurrentRow = [0, 0, 0];

        // Iterate through each character (color) in the current row's data.
        for (let charIndex = 0; charIndex < totalFlagColumns; charIndex++) {
            // Increment the counter for the color found at `charIndex`.
            // `parseInt` converts '0', '1', '2' characters to numbers for array indexing.
            colorCountsInCurrentRow[parseInt(lineCharData[charIndex])]++;
        }

        // Calculate and return the costs:
        // Cost to make row entirely White = total columns - count of '0's in this row.
        // Cost to make row entirely Blue  = total columns - count of '1's in this row.
        // Cost to make row entirely Red   = total columns - count of '2's in this row.
        return [
            totalFlagColumns - colorCountsInCurrentRow[0], // Cost to convert row to all White
            totalFlagColumns - colorCountsInCurrentRow[1], // Cost to convert row to all Blue
            totalFlagColumns - colorCountsInCurrentRow[2]  // Cost to convert row to all Red
        ];
    });

    // --- Phase 3: Determine Minimum Overall Transformation Cost ---

    // Initialize the minimum cost with a value guaranteed to be higher than any possible actual cost.
    // The maximum possible cost would be changing every cell in every row, i.e., totalFlagRows * totalFlagColumns.
    let minimumTotalCost = (totalFlagRows * totalFlagColumns) + 1;

    // Special handling for flags with exactly 3 rows.
    // In this case, there's only one possible valid configuration:
    // Row 0 is White, Row 1 is Blue, Row 2 is Red.
    if (totalFlagRows === 3) {
        minimumTotalCost = rowTransformationCosts[0][0] + // Cost to make row 0 White
                           rowTransformationCosts[1][1] + // Cost to make row 1 Blue
                           rowTransformationCosts[2][2];  // Cost to make row 2 Red
        console.log(minimumTotalCost);
        return; // Exit early as no other configurations are possible or need checking.
    }

    // Iterate through all valid split points for the White and Blue stripes.
    // `whiteStripeLastRowIndex` marks the last row belonging to the White stripe (0-indexed).
    // `blueStripeLastRowIndex` marks the last row belonging to the Blue stripe (0-indexed).
    // The loops ensure each stripe (White, Blue, Red) has at least one row,
    // and specifically, that the Red stripe has at least two rows, as implied by the original problem's loop bounds.
    // White stripe: rows 0 to `whiteStripeLastRowIndex`
    // Blue stripe: rows `whiteStripeLastRowIndex + 1` to `blueStripeLastRowIndex`
    // Red stripe: rows `blueStripeLastRowIndex + 1` to `totalFlagRows - 1`
    for (let whiteStripeLastRowIndex = 0; whiteStripeLastRowIndex <= totalFlagRows - 4; whiteStripeLastRowIndex++) {
        for (let blueStripeLastRowIndex = whiteStripeLastRowIndex + 1; blueStripeLastRowIndex <= totalFlagRows - 3; blueStripeLastRowIndex++) {
            let currentCombinationCost = 0; // Accumulated cost for this specific W-B-R configuration.

            // Sum costs for the White stripe.
            for (let rowNum = 0; rowNum <= whiteStripeLastRowIndex; rowNum++) {
                currentCombinationCost += rowTransformationCosts[rowNum][0]; // Add cost to make this row White.
            }

            // Sum costs for the Blue stripe.
            for (let rowNum = whiteStripeLastRowIndex + 1; rowNum <= blueStripeLastRowIndex; rowNum++) {
                currentCombinationCost += rowTransformationCosts[rowNum][1]; // Add cost to make this row Blue.
            }

            // Sum costs for the Red stripe.
            // This loop correctly includes all rows from `blueStripeLastRowIndex + 1` up to the last row (`totalFlagRows - 1`).
            for (let rowNum = blueStripeLastRowIndex + 1; rowNum < totalFlagRows; rowNum++) {
                currentCombinationCost += rowTransformationCosts[rowNum][2]; // Add cost to make this row Red.
            }

            // Update the overall minimum cost if the current configuration is more economical.
            minimumTotalCost = Math.min(minimumTotalCost, currentCombinationCost);
        }
    }

    // Output the final calculated minimum transformation cost.
    console.log(minimumTotalCost);
}

// Execute the main function to start the flag cost calculation process.
calculateOptimalFlagTransformationCost();