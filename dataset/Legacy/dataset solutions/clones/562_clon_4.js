(function (sourceData) {
    const allInputLines = sourceData.replace(/\r/g, '').split("\n");
    let currentLinePointer = 0;

    // Helper function to abstract line consumption, replacing direct array shifts.
    const retrieveNextLine = () => allInputLines[currentLinePointer++];

    // Main processing loop for multiple test cases.
    while (true) {
        const configurationDetails = retrieveNextLine().split(' ');
        const totalElements = parseInt(configurationDetails[0], 10);
        const subArrayLength = parseInt(configurationDetails[1], 10);

        // Termination condition for the input stream.
        if (totalElements === 0 && subArrayLength === 0) {
            break;
        }

        // Populate the sequence of numbers using a functional approach.
        const numericSequence = Array.from({ length: totalElements }, () => parseInt(retrieveNextLine(), 10));

        let maximumWindowSum;

        // Handle edge cases for subArrayLength to match original behavior.
        if (subArrayLength === 0) {
            maximumWindowSum = 0; // An empty window sum is 0.
        } else if (subArrayLength > totalElements) {
            maximumWindowSum = undefined; // No valid window can be formed.
        } else {
            let currentAccumulatedSum = 0;

            // Calculate the sum of the very first window.
            for (let i = 0; i < subArrayLength; i++) {
                currentAccumulatedSum += numericSequence[i];
            }
            maximumWindowSum = currentAccumulatedSum; // Initialize max with the first window's sum.

            // Efficiently slide the window across the sequence.
            // Instead of re-summing, update the sum by subtracting the outgoing element
            // and adding the incoming element.
            for (let i = subArrayLength; i < totalElements; i++) {
                currentAccumulatedSum += numericSequence[i] - numericSequence[i - subArrayLength];
                if (currentAccumulatedSum > maximumWindowSum) {
                    maximumWindowSum = currentAccumulatedSum;
                }
            }
        }
        console.log(maximumWindowSum);
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));
