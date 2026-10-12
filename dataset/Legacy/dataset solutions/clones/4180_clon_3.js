function processInput(rawData) {
    const lines = rawData.split("\n");
    const arraySize = parseInt(lines[0].split(" ")[0]);
    const initialValuesStr = lines[1].split(" ");

    let currentArray = new Array(arraySize);
    const operationsList = [];

    // Helper function to determine array extrema and their first indices
    const getArrayExtrema = (arr) => {
        let currentMinVal = Number.MAX_SAFE_INTEGER;
        let currentMaxVal = Number.MIN_SAFE_INTEGER;
        let firstMinIndex = -1;
        let firstMaxIndex = -1;

        for (let k = 0; k < arr.length; k++) {
            const val = arr[k];
            if (val > currentMaxVal) {
                currentMaxVal = val;
                firstMaxIndex = k;
            }
            if (val < currentMinVal) {
                currentMinVal = val;
                firstMinIndex = k;
            }
        }
        return { minVal: currentMinVal, maxVal: currentMaxVal, minIdx: firstMinIndex, maxIdx: firstMaxIndex };
    };

    // Populate the array with parsed integers
    for (let idx = 0; idx < arraySize; idx++) {
        currentArray[idx] = parseInt(initialValuesStr[idx]);
    }

    // Get initial min/max values and their first occurrences' indices
    const initialExtrema = getArrayExtrema(currentArray);
    const minValue = initialExtrema.minVal;
    const maxValue = initialExtrema.maxVal;
    const minValFirstIndex = initialExtrema.minIdx;
    const maxValFirstIndex = initialExtrema.maxIdx;

    // Apply operations based on array characteristics
    if (minValue >= 0) { // All elements are non-negative
        for (let idx = 0; idx < arraySize; idx++) {
            if (idx > 0 && currentArray[idx] < currentArray[idx - 1]) {
                const operationPair = [idx, idx + 1];
                operationsList.push(operationPair);
                currentArray[idx] = currentArray[idx - 1] + currentArray[idx];
            }
        }
    } else if (maxValue < 0) { // All elements are negative
        for (let idx = arraySize - 1; idx >= 0; idx--) {
            if (idx < arraySize - 1 && currentArray[idx] > currentArray[idx + 1]) {
                const operationPair = [idx + 1, idx];
                operationsList.push(operationPair);
                currentArray[idx] = currentArray[idx + 1] + currentArray[idx];
            }
        }
    } else if (maxValue > Math.abs(minValue)) { // Positive maximum dominates
        // Phase 1: Add the maximum value to all other elements
        for (let idx = 0; idx < arraySize; idx++) {
            if (maxValFirstIndex !== idx) {
                const operationPair = [maxValFirstIndex, idx + 1];
                operationsList.push(operationPair);
                currentArray[idx] = currentArray[idx] + maxValue;
            }
        }
        // Phase 2: Sort in ascending order (similar to the all non-negative case)
        for (let idx = 0; idx < arraySize; idx++) {
            if (idx > 0 && currentArray[idx] < currentArray[idx - 1]) {
                const operationPair = [idx, idx + 1];
                operationsList.push(operationPair);
                currentArray[idx] = currentArray[idx - 1] + currentArray[idx];
            }
        }
    } else if (Math.abs(minValue) > maxValue) { // Absolute negative minimum dominates
        // Phase 1: Add the minimum value to all other elements
        for (let idx = 0; idx < arraySize; idx++) {
            if (minValFirstIndex !== idx) {
                const operationPair = [minValFirstIndex, idx + 1];
                operationsList.push(operationPair);
                currentArray[idx] = currentArray[idx] + minValue;
            }
        }
        // Phase 2: Sort in descending order (similar to the all negative case)
        for (let idx = arraySize - 1; idx >= 0; idx--) {
            if (idx < arraySize - 1 && currentArray[idx] > currentArray[idx + 1]) {
                const operationPair = [idx + 1, idx];
                operationsList.push(operationPair);
                currentArray[idx] = currentArray[idx + 1] + currentArray[idx];
            }
        }
    }

    // Construct the final output string
    let resultOutput = operationsList.length.toString();
    resultOutput += operationsList.map(op => `\n${op[0]} ${op[1]}`).join('');

    console.log('%s', resultOutput);
}

// Execute the main processing function with input from stdin
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
