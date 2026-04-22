const processNumericDataSet = (inputDataString) => {
    // Stage 1: Initial data parsing and validation
    const rawLines = inputDataString.split('\n');

    // Early exit for malformed or empty input
    if (!rawLines || rawLines.length < 2) {
        console.log(0);
        return;
    }

    const expectedNumberCountStr = rawLines[0];
    const expectedItemCount = parseInt(expectedNumberCountStr.trim(), 10);

    // Validate the declared count
    if (isNaN(expectedItemCount) || expectedItemCount < 0 || expectedItemCount > rawLines.length - 1) {
        console.log(0);
        return;
    }

    // Stage 2: Populate an array with actual numeric values
    let numericElements = [];
    for (let k = 1; k <= expectedItemCount; ++k) {
        const currentLineValue = rawLines[k];
        const parsedNumericValue = parseInt(currentLineValue.trim(), 10);

        // Only add valid numbers to our collection
        if (!isNaN(parsedNumericValue)) {
            numericElements.push(parsedNumericValue);
        }
        // Optionally, handle non-numeric lines here (e.g., log a warning, skip, or error out)
    }

    // If no valid numbers were found, the sum is zero
    if (numericElements.length === 0) {
        console.log(0);
        return;
    }

    // Stage 3: Calculate the initial aggregate sum
    let cumulativeSum = numericElements.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    // Stage 4: Iteratively adjust the sum if it's divisible by 10
    // The loop continues as long as the sum is non-zero and perfectly divisible by 10.
    while (cumulativeSum !== 0 && cumulativeSum % 10 === 0) {
        // If there are no elements left to remove, we must break to prevent infinite loop
        if (numericElements.length === 0) {
            break;
        }

        let smallestElementValue = Number.MAX_SAFE_INTEGER;
        let elementRemovalIndex = -1;

        // Find the smallest number and its position in the current collection
        for (let itemPosition = 0; itemPosition < numericElements.length; ++itemPosition) {
            const currentObservedValue = numericElements[itemPosition];
            if (currentObservedValue < smallestElementValue) {
                smallestElementValue = currentObservedValue;
                elementRemovalIndex = itemPosition;
            }
        }

        // If no element was found (shouldn't happen if numericElements.length > 0), exit
        if (elementRemovalIndex === -1) {
            break;
        }

        // Remove the smallest element from the collection
        numericElements.splice(elementRemovalIndex, 1);

        // Deduct the removed value from the running total
        cumulativeSum -= smallestElementValue;

        // Special condition: If the sum drops to zero or below, reset to zero and stop
        if (cumulativeSum <= 0) {
            cumulativeSum = 0;
            break;
        }
    }

    // Stage 5: Output the final calculated sum
    console.log(cumulativeSum);
};

// Execute the main processing function by reading input from standard input
processNumericDataSet(require("node:fs").readFileSync("/dev/stdin", { encoding: "utf8" }));