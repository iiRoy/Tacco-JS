// This self-executing anonymous function processes input data
// to determine the maximum difference between any two elements
// in a sequence, where the second element appears after the first.
// It applies an optimized single-pass algorithm for efficiency.
((sourceDataString) => {
    // --- Input Parsing and Validation ---

    // Split the raw input string into an array of lines.
    // Each line is expected to contain a number.
    const rawInputLines = sourceDataString.split('\n');

    // Add a guard clause for insufficient input data.
    // We expect at least one line for the count and at least one for data.
    if (!rawInputLines || rawInputLines.length < 2 || rawInputLines[0].trim() === '') {
        // If input is clearly insufficient, log an error and output -Infinity,
        // consistent with the result of no valid pairs in the original logic.
        console.error("Error: Insufficient input data provided. Expected at least two non-empty lines.");
        console.log("-Infinity");
        return;
    }

    // The first line indicates the number of actual data elements to consider.
    // Use parseInt with radix for robustness and trim to handle whitespace.
    const expectedItemCount = parseInt(rawInputLines[0].trim(), 10);

    // Validate the parsed count.
    if (isNaN(expectedItemCount) || expectedItemCount < 0) {
        console.error("Error: Invalid or negative number of elements specified on the first line.");
        console.log("-Infinity"); // Consistent with no valid pairs
        return;
    }

    // An array to hold the successfully parsed numeric values.
    const numericalSequence = [];

    // Iterate through the raw input lines, starting from the second line (index 1),
    // to extract the actual numeric values.
    // We process up to `expectedItemCount` lines, ignoring any excess input.
    for (let currentLineIdx = 1; currentLineIdx <= expectedItemCount; currentLineIdx++) {
        // Ensure the current line index is within the bounds of the raw input.
        if (currentLineIdx >= rawInputLines.length) {
            console.warn(`Warning: Expected ${expectedItemCount} data points, but only ${numericalSequence.length} found. Input truncated.`);
            break; // Stop if we run out of lines prematurely.
        }

        const lineContent = rawInputLines[currentLineIdx].trim();
        // Use parseFloat for potentially decimal numbers, and trim whitespace.
        const parsedNumber = parseFloat(lineContent);

        // Validate each parsed number. If it's not a valid number, skip it
        // and issue a warning. This prevents NaN from propagating into calculations.
        if (isNaN(parsedNumber)) {
            console.warn(`Skipping invalid numeric entry at line ${currentLineIdx + 1}: '${lineContent}'.`);
            continue; // Move to the next line.
        }
        numericalSequence.push(parsedNumber);
    }

    // After parsing, check if we have enough data points to calculate a difference.
    // A difference requires at least two elements (one to "buy", one to "sell").
    if (numericalSequence.length < 2) {
        console.log("-Infinity"); // No valid pairs, so max difference is -Infinity.
        return;
    }

    // --- Core Logic: Calculate Maximum Difference (Optimized Single Pass) ---

    // Initialize the minimum value encountered so far.
    // This variable tracks the lowest "buy" price seen up to the current point in the sequence.
    let lowestPriceEncountered = numericalSequence[0];

    // Initialize the maximum difference (profit) found.
    // Start with negative infinity to ensure any actual calculated difference will be greater.
    let maximumAchievableProfit = -Infinity;

    // Traverse the numerical sequence starting from the second element.
    // This allows us to compare each element with the minimum value found *before* it.
    for (let analysisIndex = 1; analysisIndex < numericalSequence.length; analysisIndex++) {
        const currentValueBeingAnalyzed = numericalSequence[analysisIndex];

        // Calculate the potential profit if we "sell" at `currentValueBeingAnalyzed`
        // and "bought" at `lowestPriceEncountered`.
        // Update `maximumAchievableProfit` if this new difference is larger than the current max.
        maximumAchievableProfit = Math.max(maximumAchievableProfit, currentValueBeingAnalyzed - lowestPriceEncountered);

        // Update `lowestPriceEncountered` if the `currentValueBeingAnalyzed` is smaller.
        // This ensures `lowestPriceEncountered` always holds the absolute lowest value
        // encountered from the beginning of the sequence up to the `analysisIndex`.
        lowestPriceEncountered = Math.min(lowestPriceEncountered, currentValueBeingAnalyzed);
    }

    // --- Output Result ---

    // Display the final computed maximum difference (or profit) to the standard output.
    console.log(maximumAchievableProfit);

})(
    // Read the entire content of standard input (`/dev/stdin`) as a UTF-8 string.
    // This is the standard way to receive input in competitive programming environments
    // using Node.js on Linux-like systems.
    require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' })
);