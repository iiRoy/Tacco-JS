'use strict'; // Enforce strict mode for cleaner code execution

/**
 * Processes input data to find the minimum absolute difference
 * between two sums formed by splitting an array.
 * @param {string} rawData - The raw input string, typically from stdin.
 */
function ProcessInput(rawData) {
    // Split the entire input string into an array of lines.
    const linesOfData = rawData.split("\n");

    // Parse the first line to get the count of elements.
    const countOfElements = parseInt(linesOfData[0], 10);

    // Parse the second line, splitting by space and converting each part to an integer.
    const numericValues = linesOfData[1].split(' ').map(itemValue => parseInt(itemValue, 10));

    // Calculate the total sum of all numeric values in the array.
    const totalSum = numericValues.reduce((accumulator, currentValue) => accumulator + currentValue);

    // Initialize the minimum difference found so far. Use -1 to indicate no difference has been set yet.
    let minimumDifference = -1;

    // Initialize a variable to hold the current partial sum as we iterate.
    let currentPartialSum = 0;

    // Loop through the array, excluding the last element, to find all possible split points.
    for (let loopIndex = 0; loopIndex < countOfElements - 1; loopIndex++) {
        // Add the current element to the partial sum.
        currentPartialSum += numericValues[loopIndex];

        // Calculate the absolute difference between the total sum and twice the current partial sum.
        // This effectively calculates |(sum of first part) - (sum of second part)|.
        const absoluteDifference = Math.abs(totalSum - 2 * currentPartialSum);

        // If this is the first difference calculated, or if the current difference is smaller, update minimumDifference.
        if (minimumDifference < 0 || minimumDifference > absoluteDifference) {
            minimumDifference = absoluteDifference;
        }
    }

    // Output the final minimum absolute difference to the console.
    console.log(minimumDifference);
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
