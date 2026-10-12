'use strict'; // Enforce strict mode for better error handling and cleaner code.

/**
 * Processes the raw input data to identify and count specific array element swaps.
 * This function expects the input to be a string where the second line contains
 * space-separated numbers.
 *
 * @param {string} rawData - The complete input string, typically read from standard input.
 */
function ProcessInput(rawData) {
    // Parse the input string:
    // 1. Split by newline to get individual lines.
    // 2. Take the second line (index 1).
    // 3. Split that line by space to get string representations of numbers.
    // 4. Map each string to its numerical equivalent.
    const numberArray = rawData.split('\n')[1].split(' ').map(valStr => Number(valStr));

    let swapCount = 0; // Initialize a counter for the total number of swaps performed.

    // Iterate through the array using an index.
    // The loop continues as long as the index is within the bounds of the array.
    for (let idx = 0; idx < numberArray.length; idx++) {
        // Check if the current number at 'idx' is equal to its expected 1-based position.
        // For example, if numberArray[0] should be 1, numberArray[1] should be 2, etc.
        if (numberArray[idx] === idx + 1) {
            // If the number is in the "wrong" position (i.e., it matches its 1-based index),
            // a swap operation is initiated.

            // Attempt to retrieve the value of the next element in the array.
            let tempValue = numberArray[idx + 1];

            // Check if 'tempValue' is truthy (i.e., the element at 'idx + 1' exists and is not 0, null, undefined, etc.).
            // This effectively checks if 'idx' is not the last element in the array.
            if (tempValue) {
                // If the next element exists, swap the current element with the next one.
                numberArray[idx + 1] = numberArray[idx]; // Assign current element's value to the next position.
                numberArray[idx] = tempValue;             // Assign the next element's original value to the current position.
                swapCount += 1;                           // Increment the swap counter.
            } else {
                // If 'tempValue' is falsy (meaning 'idx' is the last element),
                // swap the current element with the previous one.
                tempValue = numberArray[idx];             // Store the current element's value.
                numberArray[idx] = numberArray[idx - 1];  // Assign the previous element's value to the current position.
                numberArray[idx - 1] = tempValue;         // Assign the current element's original value to the previous position.
                swapCount += 1;                           // Increment the swap counter.
            }
        }
    }

    // Output the final count of swaps to the console.
    console.log(swapCount);
}

// Read the entire content of standard input synchronously using Node.js 'fs' module.
// The input is expected to be UTF-8 encoded.
// Then, pass this raw input string to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
