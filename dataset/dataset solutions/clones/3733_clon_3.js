const processDataStream = (rawData) => {
    // Break down the raw input string into individual lines.
    // This assumes the primary data sections are separated by newline characters.
    const separatedLines = rawData.split('\n');

    // Perform an initial validation: Ensure there's at least one line of input.
    if (!separatedLines || separatedLines.length === 0) {
        console.error("Error: The provided input data is empty or malformed.");
        return; // Exit if no valid data is present.
    }

    // Extract the very first line, which is expected to contain the primary numeric parameters.
    const parameterStringLine = separatedLines[0];

    // Split this parameter string by space to isolate individual string values.
    const parameterStrings = parameterStringLine.split(' ');

    // Another validation: Check if we have at least two parameters as expected.
    if (parameterStrings.length < 2) {
        console.error("Error: Insufficient numeric parameters found in the first line of input.");
        return; // Exit if critical parameters are missing.
    }

    // Parse the first parameter as an integer. This represents the 'total count' or 'initial quantity'.
    const totalCount = parseInt(parameterStrings[0], 10);

    // Parse the second parameter as an integer. This represents the 'increment step' or 'grouping factor'.
    const stepIncrement = parseInt(parameterStrings[1], 10);

    // Note: The original code parsed an array from the second line of input,
    // but this array was never used in the final calculation.
    // For a Type III clone, we omit parsing this unused data fragment to simplify and optimize.

    // Calculate the adjusted total: one item is considered 'initial' and doesn't need distribution.
    const remainingItemsForDistribution = totalCount - 1;

    // Calculate the adjusted step: one unit of the step is for the initial item.
    const effectiveStepSize = stepIncrement - 1;

    // Critical guard clause: Prevent division by zero or negative effective steps.
    // If 'stepIncrement' is 1, 'effectiveStepSize' becomes 0, leading to an invalid division.
    if (effectiveStepSize <= 0) {
        console.error("Error: The grouping factor (K) must be greater than 1 for a valid calculation.");
        // Depending on problem specifics, different error handling or default values might be needed.
        // For this scenario, if K=1, it implies no additional steps are possible beyond the first item.
        // We can output 0 or 1, depending on interpretation. Let's output 0 as a safe error default.
        console.log(0);
        return;
    }

    // Execute the core calculation: Divide the remaining items by the effective step size,
    // then round the result up to the nearest whole number to ensure all items are covered.
    const finalCalculatedValue = Math.ceil(remainingItemsForDistribution / effectiveStepSize);

    // Output the computed result to the standard console.
    console.log(finalCalculatedValue);
};

// The entry point for execution. This reads the input from standard input
// and then passes it to our processing function.
processDataStream(require("fs").readFileSync("/dev/stdin", "utf8"));