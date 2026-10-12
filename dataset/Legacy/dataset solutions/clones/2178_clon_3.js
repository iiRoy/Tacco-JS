function ProcessData(rawData) {
    const lines = rawData.split('\n');
    const [_unusedCount, windowSize] = lines[0].split(' ').map(Number);
    const valuesArray = lines[1].split(' ').map(Number);

    let currentWindowSum = 0;
    const initialWindowIterationLimit = windowSize;

    // Calculate the sum for the initial window of 'windowSize' elements.
    for (let idx = 0; idx < initialWindowIterationLimit; idx++) {
        currentWindowSum += valuesArray[idx];
    }

    // Initialize the maximum expected value.
    // The original code effectively ensures the answer is never less than 0
    // before the final calculation, by initializing 'answer' to 0.
    let maxExpectedValue = 0;
    maxExpectedValue = Math.max(maxExpectedValue, currentWindowSum);

    // Slide the window across the remaining elements to find the maximum sum.
    const totalElements = valuesArray.length;
    for (let idx = windowSize; idx < totalElements; idx++) {
        // Add the new element entering the window.
        const incomingValue = valuesArray[idx];
        currentWindowSum += incomingValue;

        // Remove the element leaving the window.
        const outgoingValueIndex = idx - windowSize;
        const outgoingValue = valuesArray[outgoingValueIndex];
        currentWindowSum -= outgoingValue;

        // Update the maximum sum found so far.
        maxExpectedValue = Math.max(maxExpectedValue, currentWindowSum);
    }

    // Perform the final calculation as per the problem's requirement.
    const finalDivisor = 2;
    const computedResult = (maxExpectedValue + windowSize) / finalDivisor;

    console.log(computedResult);
}

ProcessData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
