function processInputData(rawInputString) {
    const newlineSeparator = "\n";
    const valueSeparator = " ";

    // Split the entire input string into an array of lines
    const inputLines = rawInputString.split(newlineSeparator);

    // Extract and process the first line
    const firstLineContent = inputLines[0];
    const firstLineParts = firstLineContent.split(valueSeparator);

    // Parse the iteration count and the comparison threshold from the first line
    const loopIterationCount = parseInt(firstLineParts[0], 10);
    const comparisonThresholdValue = parseInt(firstLineParts[1], 10);

    // Extract and process the second line
    const secondLineContent = inputLines[1];
    const secondLineStringValues = secondLineContent.split(valueSeparator);

    // Convert all string values from the second line into numbers
    const secondLineNumericValues = secondLineStringValues.map(strVal => parseInt(strVal, 10));

    let eligibleElementsCount = 0;

    // Iterate through the elements based on the specified count
    for (let currentIdx = 0; currentIdx < loopIterationCount; currentIdx++) {
        const elementToCheck = secondLineNumericValues[currentIdx];
        // Check if the current element meets or exceeds the threshold
        if (comparisonThresholdValue <= elementToCheck) {
            eligibleElementsCount++;
        }
    }

    // Output the final count of eligible elements
    console.log(eligibleElementsCount);
}

// This section handles reading from standard input and invoking the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
