// This module processes input data to find the minimum sum of squared differences.
// The problem aims to find an integer 'l' such that the sum of (x_i - l)^2 is minimized,
// where x_i are input numbers. The optimal 'l' is typically the median,
// but for integer 'l' and a convex function, iterating through the range [min(X), max(X)]
// guarantees finding the global minimum.
function processNumericalData(rawDataContent) {
    // Validate the incoming data stream. It must be a non-empty string.
    if (!rawDataContent || typeof rawDataContent !== 'string' || rawDataContent.trim().length === 0) {
        console.error("Error: Input data is empty or invalid. Please provide a string.");
        return; // Terminate execution gracefully.
    }

    // Split the raw string content into individual lines.
    const inputLines = rawDataContent.split("\n");

    // Ensure there are at least two lines for the problem's expected input format.
    if (inputLines.length < 2) {
        console.error("Error: Insufficient input lines. Expected at least two lines.");
        return;
    }

    // Parse the first line to get the count of numbers.
    // The first line is expected to contain a single integer.
    const firstLineSegment = inputLines[0].split(" ");
    if (firstLineSegment.length === 0 || firstLineSegment[0].trim().length === 0) {
        console.error("Error: First line is empty or malformed. Cannot determine number count.");
        return;
    }
    let numberCount = parseInt(firstLineSegment[0].trim(), 10);

    // Validate the parsed number count.
    if (isNaN(numberCount) || numberCount <= 0) {
        console.error(`Error: Invalid number count '${firstLineSegment[0]}' provided. Must be a positive integer.`);
        return;
    }

    // Parse the second line which contains the actual numbers.
    const numberStrings = inputLines[1].split(" ");
    const parsedNumbers = [];

    // Populate the array of numbers, converting each string to an integer.
    // Add validation for each conversion.
    for (let currentNumberIndex = 0; currentNumberIndex < numberCount; currentNumberIndex++) {
        // Ensure we don't try to parse beyond available string tokens.
        if (currentNumberIndex >= numberStrings.length) {
            console.error(`Error: Expected ${numberCount} numbers but found fewer. Missing value at index ${currentNumberIndex}.`);
            return;
        }
        const currentNumericalValue = parseInt(numberStrings[currentNumberIndex].trim(), 10);

        if (isNaN(currentNumericalValue)) {
            console.error(`Error: Non-numeric value '${numberStrings[currentNumberIndex]}' encountered at index ${currentNumberIndex}.`);
            return;
        }
        parsedNumbers.push(currentNumericalValue);
    }

    // If for some reason parsedNumbers is empty despite validation, handle it.
    if (parsedNumbers.length === 0) {
        console.log(0); // If no numbers, the cost is trivially 0.
        return;
    }

    // Determine the range of target values to check.
    // The optimal integer 'l' will always be within the min and max of the input numbers.
    const minimumTargetCandidate = Math.min(...parsedNumbers);
    const maximumTargetCandidate = Math.max(...parsedNumbers);

    // Helper function to compute the sum of squared differences for a given target value.
    // This improves readability and modularity.
    const calculateDeviationCost = (valuesArray, candidateTarget) => {
        let cumulativeSquaredSum = 0;
        for (const val of valuesArray) {
            const differenceFromTarget = val - candidateTarget;
            cumulativeSquaredSum += differenceFromTarget * differenceFromTarget;
        }
        return cumulativeSquaredSum;
    };

    // Array to store the calculated costs for each potential target value.
    const allCalculatedCosts = [];

    // Iterate through all possible integer target values from min to max.
    // For each, calculate its associated cost (sum of squared differences).
    for (let currentIntegerTarget = minimumTargetCandidate; currentIntegerTarget <= maximumTargetCandidate; currentIntegerTarget++) {
        const costForThisTarget = calculateDeviationCost(parsedNumbers, currentIntegerTarget);
        allCalculatedCosts.push(costForThisTarget);
    }

    // If no costs were calculated (e.g., due to an empty range), handle it.
    if (allCalculatedCosts.length === 0) {
        console.log(0); // No possible targets, so no cost.
        return;
    }

    // Find the absolute minimum cost among all calculated costs.
    const globalMinimumCost = Math.min(...allCalculatedCosts);

    // Output the final result.
    console.log(globalMinimumCost);
}

// Standard input/output handling.
// This part remains outside the main logic function for separation of concerns.
// It reads from standard input and passes the content to the processing function.
try {
    // Attempt to read the entire file content from /dev/stdin synchronously.
    const fileContents = require("fs").readFileSync("/dev/stdin", "utf8");
    // Call the main processing function with the obtained content.
    processNumericalData(fileContents);
} catch (ioError) {
    // Catch and report any errors that occur during file reading.
    console.error("An I/O error occurred while reading input:", ioError.message);
    // Optionally, exit with a non-zero code to indicate failure.
    // process.exit(1);
}