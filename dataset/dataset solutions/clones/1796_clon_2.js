"use strict";

// This function processes the raw input string to solve the problem.
const processInput = rawData => {
    // Trim leading/trailing whitespace and split the input into an array of lines.
    const lines = rawData.trim().split("\n");

    // Parse the first line to extract the number of elements (numElements)
    // and the number of iterations (numIterations).
    const [numElements, numIterations] = lines[0].split(" ").map(elementStr => parseInt(elementStr, 10));

    // Parse the second line to get the initial array of integer values.
    let currentArray = lines[1].split(" ").map(elementStr => parseInt(elementStr, 10));

    // Iterate for the specified number of iterations.
    for (let iterCount = 0; iterCount < numIterations; iterCount++) {
        // Initialize a difference array (using the IMOS method) with numElements + 1 zeros.
        // This array will track changes for the current transformation step.
        let diffArray = new Array(numElements + 1).fill(0);

        // Populate the difference array based on the values in currentArray.
        for (let idx = 0; idx < numElements; idx++) {
            // Calculate the effective left boundary for the current element's influence.
            // It's the maximum of 0 and (current index - current element's value).
            let leftBound = Math.max(0, idx - currentArray[idx]);
            // Calculate the effective right boundary for the current element's influence.
            // It's the minimum of (current index + current element's value + 1) and numElements.
            // The +1 makes it an exclusive upper bound for the range.
            let rightBound = Math.min(idx + currentArray[idx] + 1, numElements);

            // Increment the count at the left boundary and decrement at the right boundary.
            diffArray[leftBound]++;
            diffArray[rightBound]--;
        }

        // Apply the prefix sum to the difference array to get the actual values
        // after the current transformation.
        for (let idx = 0; idx < numElements; idx++) {
            diffArray[idx + 1] += diffArray[idx];
        }

        // Check if all elements in the transformed array have reached the maximum possible value (numElements).
        let allFilled = true;
        for (let idx = 0; idx < numElements; idx++) {
            // If any element is not equal to numElements, the array is not yet "fully lit".
            if (diffArray[idx] !== numElements) {
                allFilled = false;
                break; // No need to check further if one is found.
            }
        }

        // Remove the last auxiliary element from the difference array.
        diffArray.pop();
        // Update currentArray with the newly calculated values.
        currentArray = diffArray;

        // If all elements are numElements, further iterations will not change the array,
        // so we can break early.
        if (allFilled) {
            break;
        }
    }

    // Output the final array elements, joined by spaces.
    console.log(currentArray.join(" "));
};

// Read the input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
