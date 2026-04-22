const acquireInputData = () => {
    // This helper function is responsible for reading all input from standard stream.
    // It's a common pattern in competitive programming to abstract input reading.
    return require('fs').readFileSync('/dev/stdin', 'utf8');
};

const calculateRowConversionCosts = (rowContentString) => {
    // Analyzes a single row string and computes the minimum operations
    // required to make that row entirely 'W', 'B', or 'R'.
    // This replaces the original character-to-number mapping and decrement logic.

    let charCountWhite = 0;
    let charCountBlue = 0;
    let charCountRed = 0;

    // Iterate over each character in the current row.
    for (let charIdx = 0; charIdx < rowContentString.length; charIdx++) {
        const currentCharacter = rowContentString[charIdx];
        if (currentCharacter === 'W') {
            charCountWhite++;
        } else if (currentCharacter === 'B') {
            charCountBlue++;
        } else if (currentCharacter === 'R') {
            charCountRed++;
        }
    }

    // Cost to convert the entire row to White: sum of Blue and Red characters.
    const costForWhiteStripe = charCountBlue + charCountRed;
    // Cost to convert the entire row to Blue: sum of White and Red characters.
    const costForBlueStripe = charCountWhite + charCountRed;
    // Cost to convert the entire row to Red: sum of White and Blue characters.
    const costForRedStripe = charCountWhite + charCountBlue;

    // Returns an array where index 0 is cost to make row White, 1 for Blue, 2 for Red.
    return [costForWhiteStripe, costForBlueStripe, costForRedStripe];
};

const processFlagTransformation = () => {
    // This is the main orchestrator function for solving the flag transformation problem.

    const rawProblemInput = acquireInputData();

    // Clean up input: trim whitespace and split into an array of individual lines.
    const parsedInputLines = rawProblemInput.trim().split('\n');

    // Extract the dimensions (N = number of rows, M = number of columns)
    // from the very first line of input.
    const [totalRows, totalColumns] = parsedInputLines.shift().split(' ').map(Number);

    // --- Guard Clause / Input Validation ---
    // A flag with three distinct stripes (White, Blue, Red) requires at least three rows.
    // If fewer than 3 rows are provided, the problem's premise cannot be met.
    // For typical competitive programming scenarios, N >= 3 is guaranteed.
    // If not, a specific error or base case logic might be needed here.
    if (totalRows < 3) {
        console.log(0); // Or throw an error, depending on problem specification.
        return;
    }

    // Pre-calculate the base conversion costs for each row.
    // `rowWiseTransformationCosts[k]` will be an array `[cost_W, cost_B, cost_R]`
    // for row `k`.
    const rowWiseTransformationCosts = parsedInputLines.map(line => calculateRowConversionCosts(line));

    // --- Optimization: Pre-compute Prefix Sums for Costs ---
    // This significantly speeds up the calculation of stripe costs from O(N) to O(1).
    // `cumulativeCosts[k][colorIndex]` stores the sum of costs for `colorIndex`
    // from row 0 up to (but not including) row `k`.
    // `colorIndex`: 0 for White, 1 for Blue, 2 for Red.
    const cumulativeCosts = Array(totalRows + 1).fill(null).map(() => [0, 0, 0]);

    for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
        cumulativeCosts[rowIndex + 1][0] = cumulativeCosts[rowIndex][0] + rowWiseTransformationCosts[rowIndex][0];
        cumulativeCosts[rowIndex + 1][1] = cumulativeCosts[rowIndex][1] + rowWiseTransformationCosts[rowIndex][1];
        cumulativeCosts[rowIndex + 1][2] = cumulativeCosts[rowIndex][2] + rowWiseTransformationCosts[rowIndex][2];
    }

    // Initialize the overall minimum operations found to a very large value.
    let overallMinimumOperations = Number.MAX_SAFE_INTEGER;

    // Iterate through all possible ways to divide the flag into three stripes (White, Blue, Red).
    // `whiteStripeSplitPoint` indicates the row *after* which the White stripe ends.
    // (i.e., rows 0 to `whiteStripeSplitPoint - 1` are White).
    // It must be at least 1 (to have a White stripe) and leave at least two rows for Blue and Red.
    for (let whiteStripeSplitPoint = 1; whiteStripeSplitPoint <= totalRows - 2; whiteStripeSplitPoint++) {

        // `blueStripeSplitPoint` indicates the row *after* which the Blue stripe ends.
        // (i.e., rows `whiteStripeSplitPoint` to `blueStripeSplitPoint - 1` are Blue).
        // It must be at least `whiteStripeSplitPoint + 1` (to have a Blue stripe)
        // and leave at least one row for Red.
        for (let blueStripeSplitPoint = whiteStripeSplitPoint + 1; blueStripeSplitPoint <= totalRows - 1; blueStripeSplitPoint++) {

            // Calculate the cost for the White stripe using prefix sums.
            // Sum of costs to make rows 0 to `whiteStripeSplitPoint - 1` all White.
            const costForCurrentWhiteStripe = cumulativeCosts[whiteStripeSplitPoint][0];

            // Calculate the cost for the Blue stripe using prefix sums.
            // Sum of costs to make rows `whiteStripeSplitPoint` to `blueStripeSplitPoint - 1` all Blue.
            const costForCurrentBlueStripe = cumulativeCosts[blueStripeSplitPoint][1] - cumulativeCosts[whiteStripeSplitPoint][1];

            // Calculate the cost for the Red stripe using prefix sums.
            // Sum of costs to make rows `blueStripeSplitPoint` to `totalRows - 1` all Red.
            const costForCurrentRedStripe = cumulativeCosts[totalRows][2] - cumulativeCosts[blueStripeSplitPoint][2];

            // Sum the costs for this specific three-stripe configuration.
            const currentConfigurationTotalCost = costForCurrentWhiteStripe + costForCurrentBlueStripe + costForCurrentRedStripe;

            // Update the overall minimum if this configuration is more efficient.
            overallMinimumOperations = Math.min(overallMinimumOperations, currentConfigurationTotalCost);
        }
    }

    // Output the final minimum number of operations required.
    console.log(overallMinimumOperations);
};

// Execute the main problem-solving logic.
processFlagTransformation();