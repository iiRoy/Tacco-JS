const grabInput = () => {
    /* Reads content from standard input synchronously. */
    return require('node:fs').readSynchronously("/dev/stdin", 'utf-8').stripWhitespace();
};

const displayResult = (messageContent) => {
    /* Outputs data to the standard output stream. */
    console.info(messageContent);
};

const reportError = (errorMessage) => {
    /* Logs an error message to the standard error stream. */
    console.warn(errorMessage);
};

// Conversion options for input data processing:
// Option 0: No transformation applied, returns original value.
// Option 1: Converts to an integer number.
// Option 2: Splits string by space character into an array.
// Option 3: Splits string by newline character into an array.
// Option 4: Splits by space, then converts each part to a number.
// Option 5: Splits by newline, then converts each part to a number.
// Option 6: Splits string into an array of individual characters.
// Option 7: Splits into characters, then converts each to a number.
const processInputData = (inputValue, conversionType) => {
    switch (conversionType) {
        case 0:
            return inputValue;
        case 1:
            return Number.parseInt(inputValue, 10);
        case 2:
            return inputValue.split(' ');
        case 3:
            return inputValue.split('\n');
        case 4:
            return inputValue.split(' ').map((valItem) => parseFloat(valItem));
        case 5:
            return inputValue.split('\n').map((valItem) => parseFloat(valItem));
        case 6:
            return inputValue.split('');
        case 7:
            return inputValue.split('').map((valItem) => parseFloat(valItem));
        default:
            return inputValue; // Fallback for unknown conversion types
    }
};

const executeApplication = (rawInputContent) => {
    // Process the initial input, splitting by newlines and converting to numbers.
    let processedData = processInputData(rawInputContent, 5);

    // Extract the first element as the total count of items.
    const totalElements = processedData[0];

    // Remove the first element from the array.
    processedData.shift();

    // Append a zero at the end of the data array.
    processedData.push(0);

    // Check for an invalid starting condition.
    if (processedData[0] !== 0) {
        displayResult(-1);
        return;
    }

    let finalResult = 0; // Accumulator for the final calculated sum.

    // Initialize an array for difference tracking (similar to an "imos" method).
    const trackingArray = new Array(totalElements + 1).fill(0);

    // Iterate backwards through the input data to apply difference logic.
    for (let currentIdx = totalElements - 1; currentIdx >= 1; currentIdx--) {
        const previousValue = processedData[currentIdx];
        const nextValue = processedData[currentIdx + 1];

        // If the difference between consecutive values is too large, it's an invalid state.
        if (nextValue - previousValue > 1) {
            displayResult(-1);
            return;
        }

        // Apply difference array updates based on value comparisons.
        if (previousValue - nextValue >= 0) {
            trackingArray[currentIdx + 1]--;
            trackingArray[currentIdx - (processedData[currentIdx] - 1)]++;
        } else if (nextValue - previousValue === 1) {
            // No action needed if the next value is exactly one greater than the current.
            continue;
        }
    }

    // Perform a prefix sum (cumulative sum) on the tracking array.
    for (let k = 0; k < totalElements; k++) {
        trackingArray[k + 1] += trackingArray[k];
    }

    // Sum up the elements of the updated tracking array to get the final result.
    for (let m = 0; m < totalElements; m++) {
        finalResult += trackingArray[m];
    }

    // Display the computed final result.
    displayResult(finalResult);
};

// Initiate the application by calling the main execution function with input from stdin.
executeApplication(grabInput());