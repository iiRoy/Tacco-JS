const calculateAggregateSum = (inputLines) => {
    // Validate that the necessary input lines are provided.
    // The algorithm requires at least two lines: one for metadata (ignored) and one for numbers.
    if (!inputLines || inputLines.length < 2) {
        console.error("Input error: Expected at least two lines of input data.");
        return; // Exit early if input is insufficient.
    }

    // Extract the second line (index 1) which is expected to contain space-separated numbers.
    // Then, convert these string representations into actual numeric values.
    const rawNumericString = inputLines[1];
    const numericValues = rawNumericString.split(' ').map(Number); // Efficiently converts each string to a number.

    // Define a large prime modulus constant. This is used in all arithmetic operations
    // to prevent integer overflow and ensure results remain within a specific range,
    // common in competitive programming problems.
    const modulusConstant = 1000000007; // This is 10^9 + 7.

    // Initialize the primary accumulator variable that will store the final computed sum.
    let finalAccumulator = 0;

    // Store the length of the numeric array in a constant for efficient loop iterations.
    const dataArrayLength = numericValues.length;

    // If the array contains fewer than two elements, the inner loop will never execute,
    // and the final sum will naturally be zero. An explicit check can clarify this.
    if (dataArrayLength < 2) {
        console.log(finalAccumulator); // Output 0 as no calculations are possible.
        return;
    }

    // Outer loop: Iterates through each element in the array from the beginning.
    for (let currentOuterIndex = 0; currentOuterIndex < dataArrayLength; currentOuterIndex++) {
        // Initialize a temporary sum for elements that follow the current outer element.
        let runningSubsequentSum = 0;

        // Inner loop: Iterates through all elements *after* the current outer element.
        // It accumulates their sum modulo the modulusConstant.
        for (let currentInnerIndex = currentOuterIndex + 1; currentInnerIndex < dataArrayLength; currentInnerIndex++) {
            const valueForInnerSum = numericValues[currentInnerIndex];
            // Add the current subsequent value to the running sum, applying the modulus.
            runningSubsequentSum = (runningSubsequentSum + valueForInnerSum) % modulusConstant;
        }

        // Retrieve the numeric value of the current element from the outer loop.
        const currentOuterValue = numericValues[currentOuterIndex];

        // Calculate the product of the current outer value and the accumulated subsequent sum.
        // Apply the modulus to this product to keep it within bounds.
        const intermediateProductTerm = (currentOuterValue * runningSubsequentSum) % modulusConstant;

        // Add this intermediate product term to the final accumulator.
        // Again, apply the modulus to the total sum.
        finalAccumulator = (finalAccumulator + intermediateProductTerm) % modulusConstant;
    }

    // Output the final calculated aggregate sum to the console.
    console.log(finalAccumulator);
};

// --- Standard Input Handling Section ---
// This part of the code is responsible for reading all incoming data
// from the standard input stream (e.g., piped input or user typing).

// A string buffer to incrementally store all received data chunks.
let inputDataBuffer = '';

// Attach an event listener to the 'data' event of standard input.
// This event fires whenever a new chunk of data becomes available.
process.stdin.on('data', (dataChunk) => {
    inputDataBuffer += dataChunk; // Append the new chunk to our buffer.
});

// Attach an event listener to the 'end' event of standard input.
// This event fires when the input stream has finished sending all its data.
process.stdin.on('end', () => {
    // Dynamically import the 'os' module to obtain the correct End-Of-Line character
    // for the current operating system, ensuring accurate line splitting.
    const { EOL } = require('os');
    // Split the entire accumulated input buffer into an array of strings, where each
    // element represents a single line from the input.
    const parsedLinesArray = inputDataBuffer.split(EOL);

    // Invoke the main data processing function with the prepared array of lines.
    calculateAggregateSum(parsedLinesArray);
});

// Optional: Add an error handler for the standard input stream.
// This can help in debugging issues related to input operations.
process.stdin.on('error', (err) => {
    console.error("An error occurred while reading from standard input:", err);
});