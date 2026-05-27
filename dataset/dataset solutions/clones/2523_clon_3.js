function processInputData(rawDataContent) {
    const LINE_SEPARATOR = "\n";
    const VALUE_SEPARATOR = " ";

    // Helper function to split a string by a specified delimiter
    const splitStringByDelimiter = (sourceString, delimiter) => {
        return sourceString.split(delimiter);
    };

    // Helper function to convert a string representation of a number to an integer
    const parseStringToInt = (strValue) => {
        return parseInt(strValue, 10);
    };

    // Divide the entire raw input content into an array of individual lines
    const allInputLines = splitStringByDelimiter(rawDataContent, LINE_SEPARATOR);

    // Process the first line, which contains the iteration count and the comparison threshold
    const firstLineValues = splitStringByDelimiter(allInputLines[0], VALUE_SEPARATOR);

    // The original code processes the second line but does not use its result.
    // This assignment is redundant for the observable behavior and can be removed.
    // const secondLineValues = splitStringByDelimiter(allInputLines[1], VALUE_SEPARATOR);

    let eligibleItemCount = 0;

    // Extract the string values for the loop limit and the comparison threshold
    const iterationLimitString = firstLineValues[0];
    const comparisonThresholdString = firstLineValues[1];

    // Convert these string values to numbers for use in the loop and comparison
    const totalIterations = parseStringToInt(iterationLimitString);
    const thresholdValue = parseStringToInt(comparisonThresholdString);

    // Helper function to encapsulate the comparison logic and increment the count
    const evaluateAndIncrement = (itemString, currentThreshold, currentCount) => {
        const numericItem = parseStringToInt(itemString);
        if (numericItem <= currentThreshold) {
            return currentCount + 1;
        }
        return currentCount;
    };

    // Iterate through the relevant elements of the first line based on the parsed limit
    for (let currentIdx = 0; currentIdx < totalIterations; currentIdx++) {
        const itemToCheckString = firstLineValues[currentIdx];
        eligibleItemCount = evaluateAndIncrement(itemToCheckString, thresholdValue, eligibleItemCount);
    }

    // Output the final calculated count to the console
    console.log(eligibleItemCount);
}

// This section handles reading input from standard input and calling the main processing function.
// It should not be modified as per the original file's instructions.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
