function ProcessInput(rawData) {
    // This function takes raw input, processes it, and prints a result.
    // First, split the input string by newlines and convert each part to a number.
    let numericData = rawData.split("\n").map(Number);

    // Remove the initial element from the array, as it's often metadata.
    numericData.shift();

    // Calculate the sum of all remaining numbers in the array.
    const totalSum = calculateArraySum(numericData);

    // Check if the calculated total sum is an odd number.
    if (totalSum % 2 === 1) {
        // If the sum is odd, output "first".
        console.log("first");
    } else {
        // Otherwise (if the sum is even), output "second".
        console.log("second");
    }
}

// Immediately invoke the main processing function with data read from standard input.
// The input is read as a UTF-8 string and any leading/trailing whitespace is removed.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());

/**
 * Computes the sum of all numerical elements within a given array.
 * @param {Array<number>} dataArray - An array containing numbers to be summed.
 * @returns {number} The aggregate sum of all elements in the array.
 */
function calculateArraySum(dataArray) {
    let accumulator = 0; // Initialize a variable to store the running total.

    // Iterate through each element of the input array using a traditional for loop.
    for (let idx = 0, arrayLength = dataArray.length; idx < arrayLength; ++idx) {
        // Add the current element's value to the accumulator.
        accumulator += dataArray[idx];
    }
    // Return the final sum after iterating through all elements.
    return accumulator;
}
