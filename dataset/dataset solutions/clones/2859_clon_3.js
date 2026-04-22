// This module processes numerical data sets to find optimal partitions.
function ProcessDataSet(rawData) {
    // Validate initial input: ensure it's a non-empty string.
    if (typeof rawData !== 'string' || rawData.trim() === '') {
        console.error("Input processing error: Provided data is empty or not a valid string.");
        return; // Terminate execution or handle as appropriate.
    }

    // Divide the raw input string into individual lines.
    const dataLines = rawData.trim().split("\n");

    // Attempt to parse the first line as the total count of elements.
    const declaredItemCountStr = dataLines[0];
    const actualItemQuantity = parseInt(declaredItemCountStr, 10);

    // Perform basic validation on the parsed item quantity.
    if (isNaN(actualItemQuantity) || actualItemQuantity < 1) {
        console.error("Input processing error: Invalid or missing item quantity specified on the first line.");
        return;
    }

    // Split the second line into string representations of individual elements.
    const elementStringSegments = dataLines[1].split(" ");
    // Convert string segments into an array of numbers.
    const numericalValues = elementStringSegments.map(str => parseInt(str, 10));

    // Verify that the number of parsed numerical values matches the declared item quantity.
    if (numericalValues.length !== actualItemQuantity) {
        console.warn(`Data mismatch warning: Declared count (${actualItemQuantity}) differs from actual element count (${numericalValues.length}). Using actual count for calculations.`);
        // In a real-world scenario, one might adjust `actualItemQuantity` here or throw an error.
        // For this exercise, we proceed with the actual length of `numericalValues`.
    }

    // Handle the trivial case where there are only two elements.
    // The difference is simply the absolute difference between them.
    if (actualItemQuantity === 2) {
        const firstValue = numericalValues[0];
        const secondValue = numericalValues[1];
        const trivialAbsoluteDifference = Math.abs(firstValue - secondValue);
        console.log(trivialAbsoluteDifference);
        return; // Exit after printing the result for the base case.
    }

    // For scenarios with more than two elements, determine the minimum absolute difference
    // between two partitions of the array.
    
    // First, compute the sum of all numerical values.
    let grandTotalSum = 0;
    for (const singleValue of numericalValues) {
        if (isNaN(singleValue)) {
            console.error("Calculation error: Encountered a non-numeric value in the element list.");
            return;
        }
        grandTotalSum += singleValue;
    }

    let currentLeftPartitionTotal = 0;
    let minimumObservedDifference = Infinity; // Initialize with a very large value.

    // Iterate through all possible split points to find the optimal partition.
    // A split point means the first partition ends at `numericalValues[segmentIndex]`,
    // and the second partition begins at `numericalValues[segmentIndex + 1]`.
    // The loop runs from `0` to `actualItemQuantity - 2` to ensure both partitions contain at least one element.
    for (let segmentIndex = 0; segmentIndex <= actualItemQuantity - 2; ++segmentIndex) {
        currentLeftPartitionTotal += numericalValues[segmentIndex]; // Add current element to the left partition.
        const currentRightPartitionTotal = grandTotalSum - currentLeftPartitionTotal; // Calculate the sum of the right partition.
        
        // Compute the absolute difference between the two partition sums.
        const instantaneousPartitionDelta = Math.abs(currentLeftPartitionTotal - currentRightPartitionTotal);
        
        // Update the overall minimum difference if the current one is smaller.
        if (instantaneousPartitionDelta < minimumObservedDifference) {
            minimumObservedDifference = instantaneousPartitionDelta;
        }
    }

    // Output the smallest absolute difference found across all partitions.
    console.log(minimumObservedDifference);
}

// This self-executing anonymous function handles the standard input/output interface.
// It's designed to be robust in competitive programming environments.
(function() {
    // Attempt to read input from '/dev/stdin' which is common in Linux-based contest systems.
    try {
        const fileSystemModule = require("fs");
        const inputDataBuffer = fileSystemModule.readFileSync("/dev/stdin", "utf8");
        ProcessDataSet(inputDataBuffer); // Invoke the main processing function.
    } catch (ioError) {
        // Log an error if standard input cannot be read.
        // For local testing, one might replace this with a sample data string.
        console.error("Execution error: Failed to read from standard input (/dev/stdin). Details:", ioError.message);
    }
})();