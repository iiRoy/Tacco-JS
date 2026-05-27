function processInputData(rawInputString) {
    // Helper function to parse a single line of space-separated integers.
    // This replicates the original behavior where an empty string split(" ")
    // results in [""] and parseInt("", 10) results in NaN.
    const parseNumericLine = (lineContent) => {
        return lineContent.split(" ").map(strValue => parseInt(strValue, 10));
    };

    // Step 1: Split the raw input string into individual lines.
    const inputLines = rawInputString.split("\n");

    // Step 2: Parse each line into an array of integers.
    // We do not filter empty lines here to preserve the original indexing behavior
    // for accessing specific lines (e.g., parsedNumericData[1]).
    const parsedNumericData = inputLines.map(parseNumericLine);

    // The problem's logic operates on the second line of input (index 1).
    // This variable makes the intent clearer.
    const targetDataRow = parsedNumericData[1];

    // Helper function to calculate the sum of products for a sub-array.
    // This replaces the inner 'reduce' with an explicit loop for structural variation.
    const calculateInnerProductSum = (elementsToSum, multiplier) => {
        let currentInnerSum = 0;
        // Iterate through the elements and accumulate their product with the multiplier.
        for (let i = 0; i < elementsToSum.length; i++) {
            const currentElement = elementsToSum[i];
            currentInnerSum += multiplier * currentElement;
        }
        return currentInnerSum;
    };

    // Step 3: Perform the main calculation.
    // The outer 'reduce' iterates through the 'targetDataRow'.
    const totalCalculatedSum = targetDataRow.reduce((currentTotalAccumulator, currentElementValue, currentIndex, fullSourceArray) => {
        // Create a sub-array starting from the current element's index.
        // This represents the 'array' variable in the original code.
        const remainingElementsFromCurrentIndex = fullSourceArray.slice(currentIndex);

        // The first element of this sub-array acts as the multiplier for subsequent elements.
        const primaryMultiplierForIteration = remainingElementsFromCurrentIndex[0];

        // Extract the elements that need to be multiplied by the primaryMultiplier.
        // This corresponds to 'array.slice(1, array.length)' in the original.
        const elementsToProcessForProduct = remainingElementsFromCurrentIndex.slice(1);

        // Calculate the sum of products for the current iteration using the helper function.
        const iterationResultSum = calculateInnerProductSum(elementsToProcessForProduct, primaryMultiplierForIteration);

        // Add the result of this iteration to the overall total.
        return currentTotalAccumulator + iterationResultSum;
    }, 0); // Initialize the total sum to 0.

    // Step 4: Output the final calculated sum.
    console.log(totalCalculatedSum);
}

// Read input from standard input and pass it to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
