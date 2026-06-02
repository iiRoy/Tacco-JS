let inputData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split(/\s/);

// Define a fixed array of reference numbers for comparison.
const referenceNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Iterate through the input data, processing it in chunks of three elements.
for (let outerIndex = 0; outerIndex < inputData.length - 1; outerIndex += 3) {
    let validCount = 0; // Initialize a counter for valid conditions within each chunk.

    // Loop through the reference numbers array.
    for (let innerIndex = 0; innerIndex < 10; innerIndex++) {
        // Calculate a threshold based on the first two input elements in the current chunk.
        // The `*1` explicitly converts string inputs to numbers for arithmetic operations.
        const currentThreshold = 20 - (inputData[outerIndex] * 1 + inputData[outerIndex + 1] * 1);

        // Check multiple conditions for the current reference number:
        // 1. Is it less than or equal to the calculated threshold?
        // 2. Is it not equal to the third input element in the chunk?
        // 3. Is it not equal to the second input element in the chunk?
        // 4. Is it not equal to the first input element in the chunk?
        if (referenceNumbers[innerIndex] <= currentThreshold &&
            referenceNumbers[innerIndex] !== inputData[outerIndex + 2] &&
            referenceNumbers[innerIndex] !== inputData[outerIndex + 1] &&
            referenceNumbers[innerIndex] !== inputData[outerIndex]) {
            validCount++; // Increment the counter if all conditions are met.
        }
    }

    // After checking all reference numbers for the current input chunk,
    // determine if the number of valid conditions meets the criteria.
    if (validCount >= 4) {
        console.log("Yes"); // Output "Yes" if four or more conditions were met.
    } else {
        console.log("No"); // Otherwise, output "No".
    }
}
