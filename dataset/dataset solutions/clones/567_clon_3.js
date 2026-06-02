(function (rawData) {
    const processedLines = rawData.replace(/\r/g, '').split("\n");

    // Helper function to encapsulate the specific coin-counting logic
    const calculateMinimumOperations = (targetValue) => {
        let currentRemaining = targetValue;
        let operationCounter = 0;
        // Define the denominations in descending order, as per original logic's priority
        const availableDenominations = [500, 100, 50, 10, 5, 1];

        while (currentRemaining !== 0) {
            // Flag to ensure an operation is always performed in each step of the outer loop
            let operationFoundThisIteration = false;
            for (let i = 0; i < availableDenominations.length; i++) {
                const currentDenom = availableDenominations[i];
                // Check if the current remaining amount is perfectly divisible by the denomination
                if (currentRemaining % currentDenom === 0) {
                    currentRemaining -= currentDenom; // Subtract the denomination
                    operationFoundThisIteration = true;
                    break; // Exit inner loop, one operation completed
                }
            }
            // Increment the total operation count for this step
            operationCounter++;
            // The original logic guarantees an operation because 1 is always a divisor.
            // Therefore, operationFoundThisIteration will always be true before incrementing operationCounter.
        }
        return operationCounter;
    };

    let currentLineIndex = 0; // Use an index to iterate through processed lines
    while (true) {
        const lineContent = processedLines[currentLineIndex];
        currentLineIndex++; // Advance the index for the next iteration

        const numericInput = parseInt(lineContent, 10); // Parse the string to an integer with explicit radix

        if (numericInput === 0) {
            break; // Terminate loop if input is 0
        }

        const requiredAmount = 1000 - numericInput;
        const totalOperations = calculateMinimumOperations(requiredAmount);
        console.log(totalOperations);
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));
