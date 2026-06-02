'use strict';

// This function is responsible for processing the incoming raw data.
function processInput(rawData) {
    // First, we determine the total number of elements expected from the input.
    // This value is extracted from the first part of the first line.
    let countElements = Number(rawData.split('\n')[0].split(' ')[0]);

    // An array is initialized to hold the numerical values that will be parsed.
    let numericValues = [];

    // We iterate 'countElements' times to populate our array with numbers.
    // These numbers are taken from the second line of the raw data.
    for (let idx = 0; idx < countElements; idx++) {
        numericValues[idx] = Number(rawData.split('\n')[1].split(' ')[idx]);
    }

    // A counter is set up to track how many times a specific condition is met.
    let oddCount = 0;

    // We loop through the 'numericValues' array, extending one position beyond its actual length.
    // This is to accommodate the specific logic of the problem.
    for (let currentIdx = 0; currentIdx < numericValues.length + 1; currentIdx++) {
        // The condition checks if the current index (plus one) is odd,
        // AND if the element at the current index is also an odd number.
        // Note: Accessing numericValues[currentIdx] when currentIdx equals numericValues.length
        // will result in `undefined`. The behavior of `undefined % 2` (which is `NaN`)
        // and `NaN !== 0` (which is `true`) is preserved, though in this specific
        // condition, the first part `(currentIdx + 1) % 2 !== 0` might short-circuit.
        if ((currentIdx + 1) % 2 !== 0 && numericValues[currentIdx] % 2 !== 0) {
            oddCount++; // Increment the counter if both conditions are true.
        }
    }

    // Finally, the calculated total count is printed to the console.
    console.log(oddCount);
}

// The program starts by reading the entire content of standard input.
// The input is then passed to our main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
