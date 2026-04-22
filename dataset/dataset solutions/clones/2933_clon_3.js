function EvaluateFeasibleRange(rawConstraintData) {
    // This routine processes a series of numerical range constraints
    // to determine the total count of valid items within the final feasible interval.

    // --- Type III: Introduce helper variable for all input lines, and trim any leading/trailing whitespace ---
    const allInputLines = rawConstraintData.trim().split('\n');

    // --- Type III: Add a basic validation/guard clause for completely empty input ---
    if (!allInputLines || allInputLines.length === 0 || allInputLines[0].trim() === '') {
        // If no data is provided, no items can be considered valid.
        console.log(0);
        return;
    }

    // --- Type III: Extract and parse the initial system configuration parameters ---
    const initialConfigurationLineTokens = allInputLines[0].split(' ');

    // --- Type III: Add validation for the structure of the initial parameter line ---
    if (initialConfigurationLineTokens.length < 2) {
        // console.error("Initial configuration line is malformed or incomplete.");
        console.log(0); // Treat as no valid items if configuration is bad
        return;
    }

    // --- Type II: Rename identifiers for the system's overall bounds and number of constraints ---
    const overallMaximumIdentifierValue = Number(initialConfigurationLineTokens[0]); // Corresponds to N
    const totalNumberOfConstraintDefinitions = Number(initialConfigurationLineTokens[1]);    // Corresponds to M

    // Initialize the current active range based on the overall possible identifiers.
    // The range is inclusive, starting from 1 up to the overallMaximumIdentifierValue.
    // --- Type II: Rename variables to reflect their role more clearly ---
    let currentFeasibleLowerBound = 1;
    let currentFeasibleUpperBound = overallMaximumIdentifierValue;

    // --- Type III: Add a verbose comment about the processing loop ---
    // Now, iterate through each provided constraint definition to progressively narrow down the feasible range.
    // --- Type II: Rename the loop counter variable for better readability ---
    for (let currentConstraintIndex = 1; currentConstraintIndex <= totalNumberOfConstraintDefinitions; ++currentConstraintIndex) {
        // --- Type III: Add a validation check for insufficient constraint lines in the input ---
        if (currentConstraintIndex >= allInputLines.length) {
            // console.warn(`Warning: Expected ${totalNumberOfConstraintDefinitions} constraint lines, but only found ${currentConstraintIndex - 1}. Processing with available data.`);
            break; // Stop processing if we've run out of input data lines prematurely.
        }

        const specificConstraintDefinitionLine = allInputLines[currentConstraintIndex];
        // --- Type III: Rewrite parsing for the constraint line, using `map(Number)` for conciseness ---
        const currentBoundaryValues = specificConstraintDefinitionLine.split(' ').map(Number);

        // --- Type II: Rename temporary variables holding the constraint's min and max ---
        const constraintMinimumValue = currentBoundaryValues[0];
        const constraintMaximumValue = currentBoundaryValues[1];

        // Update the overall active range by taking the intersection of the current feasible range
        // and the bounds specified by the new constraint.
        currentFeasibleLowerBound = Math.max(currentFeasibleLowerBound, constraintMinimumValue);
        currentFeasibleUpperBound = Math.min(currentFeasibleUpperBound, constraintMaximumValue);

        // --- Type III: Optional intermediate step/comment for understanding range collapse ---
        // At this point, if currentFeasibleLowerBound > currentFeasibleUpperBound, the range is empty.
        // The final calculation will correctly handle this, so no early exit is strictly necessary.
    }

    // Calculate the final count of valid identifiers within the determined feasible range.
    // --- Type III: Rewrite the final calculation using an explicit conditional branch for clarity ---
    let calculatedValidItemsCount;
    if (currentFeasibleUpperBound >= currentFeasibleLowerBound) {
        // If the upper bound is greater than or equal to the lower bound, the range is valid and non-empty.
        calculatedValidItemsCount = currentFeasibleUpperBound - currentFeasibleLowerBound + 1;
    } else {
        // If the upper bound is less than the lower bound, the range is empty.
        calculatedValidItemsCount = 0;
    }

    // --- Type III: Introduce a new variable to hold the final result before logging ---
    const finalResultQuantity = calculatedValidItemsCount;

    // Output the calculated count of valid items to the console.
    console.log(finalResultQuantity);
}

// --- Type III: Encapsulate the standard input reading into a variable before passing ---
const inputDataFromStandardStream = require("fs").readFileSync("/dev/stdin", "utf8");

// --- Type II: Call the renamed main processing function with the obtained input data ---
EvaluateFeasibleRange(inputDataFromStandardStream);