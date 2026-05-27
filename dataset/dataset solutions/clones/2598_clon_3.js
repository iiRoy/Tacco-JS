function processInputData(rawInputString) {
    const inputLines = rawInputString.split("\n");

    // Helper function to parse a string into a decimal integer
    const parseDecimalInteger = (strValue) => parseInt(strValue, 10);

    // The first line contains the count of elements, as a string
    const elementCountString = inputLines[0];
    // The second line contains space-separated numbers
    const numberSequence = inputLines[1].split(" ").map(parseDecimalInteger);

    // Convert the element count string to an actual number
    const totalElements = parseDecimalInteger(elementCountString);

    let maximumConsecutiveDecreases = 0;
    let currentConsecutiveDecreaseCount = 0;

    // Iterate through the sequence from the second-to-last element down to the first.
    // The loop includes index 0, where 'precedingElementValue' will be undefined.
    // This behavior (comparing with undefined) is critical to preserve.
    const loopStartingIndex = totalElements - 1;

    for (let loopIndex = loopStartingIndex; loopIndex >= 0; loopIndex--) {
        const currentElementValue = numberSequence[loopIndex];
        // Accessing an element at index -1 results in 'undefined'
        const precedingElementValue = numberSequence[loopIndex - 1];

        // Preserve the exact console output, including 'undefined' for the last iteration
        console.log(currentElementValue, precedingElementValue);

        // JavaScript's comparison rules with 'undefined':
        // 'number <= undefined' is false
        // 'number > undefined' is false
        // This ensures 'currentConsecutiveDecreaseCount' is not modified when 'precedingElementValue' is undefined.
        if (currentElementValue <= precedingElementValue) {
            currentConsecutiveDecreaseCount++;
            // Update the overall maximum if the current streak is longer
            if (currentConsecutiveDecreaseCount > maximumConsecutiveDecreases) {
                maximumConsecutiveDecreases = currentConsecutiveDecreaseCount;
            }
        } else if (currentElementValue > precedingElementValue) {
            // Reset the counter if the non-increasing sequence is broken
            currentConsecutiveDecreaseCount = 0;
        }
    }

    // Output the final calculated maximum consecutive decreases
    console.log(maximumConsecutiveDecreases);
}

// Don't edit this line!
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
