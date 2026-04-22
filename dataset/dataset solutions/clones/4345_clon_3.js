// Function to orchestrate the main data processing flow.
function ProcessInputData(rawDataString) {

    // Internal utility function to robustly parse a string into an integer.
    // It includes error handling for non-numeric inputs.
    const parseNumericValue = (textualData) => {
        const convertedValue = Number.parseInt(textualData, 10);
        // Implement a basic check for parsing failures.
        if (Number.isNaN(convertedValue)) {
            // Log a warning for malformed data, but allow processing to continue
            // by substituting a default value (e.g., zero).
            console.warn(`Data parsing issue: "${textualData}" is not a valid number. Using 0 instead.`);
            return 0;
        }
        return convertedValue;
    };

    // Divide the entire input string into an array of separate lines.
    // This regex accounts for both Unix-like (\n) and Windows-like (\r\n) newlines.
    const individualInputLines = rawDataString.split(/\r?\n/);

    // Perform an initial validation to ensure minimum expected input lines are present.
    if (individualInputLines.length < 3) {
        console.error("Input format error: Not enough lines provided. At least 3 lines are required.");
        // Terminate execution if the fundamental input structure is invalid.
        return;
    }

    // The first line, originally designated 'N', is not utilized in the core logic.
    // Its parsing has been removed to simplify the process and demonstrate code deletion.
    // const elementCount = parseNumericValue(individualInputLines[0]);

    // Extract and parse the threshold value from the second line of input.
    const comparisonThreshold = parseNumericValue(individualInputLines[1]);

    // Break down the third line into an array of string-based data points,
    // assuming they are separated by single spaces.
    const stringDataPoints = individualInputLines[2].split(' ');

    // Initialize the aggregate variable that will store the cumulative sum.
    let finalAggregatedTotal = 0;

    // Iterate over each string data point to apply the calculation rules.
    // A `for...of` loop is used here as an alternative to `Array.prototype.reduce`,
    // showcasing a structural change while preserving equivalent functionality.
    for (const currentStringPoint of stringDataPoints) {
        // Convert the current string data point into its numeric representation.
        const numericPointValue = parseNumericValue(currentStringPoint);

        // Calculate the absolute difference between the threshold and the current numeric point.
        const calculatedDifference = Math.abs(comparisonThreshold - numericPointValue);

        // The original logic compared the absolute difference with the raw string 'x'.
        // This has been corrected to compare against the numeric value of the data point itself.
        // This ensures a proper numeric comparison.
        if (calculatedDifference < numericPointValue) {
            // If the difference is smaller, add the difference to the total.
            finalAggregatedTotal += calculatedDifference;
        } else {
            // Otherwise, add the numeric point value itself to the total.
            // Note: In the original, `i(sum)` was redundant as `sum` was already a number.
            // This has been simplified.
            finalAggregatedTotal += numericPointValue;
        }
    }

    // Display the final computed sum to the standard output.
    console.log(finalAggregatedTotal);
}

// Execute the primary function by reading input from standard input.
// Utilizes Node.js's built-in file system module for synchronous file reading.
ProcessInputData(require("node:fs").readFileSync("/dev/stdin", "utf8"));