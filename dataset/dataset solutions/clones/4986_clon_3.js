// Resume the standard input stream to allow data reception.
process.stdin.resume();

// Set the character encoding for the input stream to UTF-8.
process.stdin.setEncoding('utf-8');

// Declare an array to store all incoming lines of data.
let collectedInputData = [];

// Initialize a readline interface to process input line by line.
// This interface reads from standard input and writes to standard output (though output is not used here).
const inputModule = require('readline');
const streamProcessor = inputModule.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Register an event listener for each line received from the input stream.
// When a line is received, it is pushed into our data collection array.
streamProcessor.on('line', (inputSegment) => {
  collectedInputData.push(inputSegment);
});

// Register an event listener for when the input stream closes.
// This is where the primary logic of the application will execute after all input has been received.
streamProcessor.on('close', () => {
    // --- Input Validation and Parsing ---

    // Guard clause: Check if any input was received.
    if (collectedInputData.length === 0) {
        console.error("Error: No input data was provided. Please ensure input is piped or typed.");
        process.exit(1); // Exit with a non-zero code to indicate an error.
    }

    // Retrieve the first line of input, which is expected to contain three numbers.
    const rawInputLine = collectedInputData[0];

    // Split the raw input string by spaces and convert each part to a number.
    // The filter is added for robustness against multiple spaces or leading/trailing spaces.
    const numericStrings = rawInputLine.split(' ').filter(s => s.trim() !== '');
    const [operandOne, operandTwo, operandThree] = numericStrings.map(Number);

    // Validate that all parsed values are actual numbers.
    if (isNaN(operandOne) || isNaN(operandTwo) || isNaN(operandThree)) {
        console.error(`Error: Invalid numeric input detected. Expected three numbers, but received: "${rawInputLine}"`);
        // As per problem context, output 0 for invalid input or if an even number is present.
        // This case can be treated as if an even number was found.
        console.log(0);
        process.exit(1);
    }

    // --- Core Logic Implementation ---

    // Helper function to determine if a number is even using a bitwise operation.
    const isNumberEven = (numValue) => (numValue & 1) === 0;

    let finalComputationResult; // Declare a variable to hold the outcome of the calculation.

    // Check if any of the three operands are even.
    // If at least one number is even, the problem states the result is 0.
    if (isNumberEven(operandOne) || isNumberEven(operandTwo) || isNumberEven(operandThree)) {
        finalComputationResult = 0; // Assign the zero outcome.
    } else {
        // If all three numbers are odd, proceed with calculating the products and finding the minimum.
        
        // Calculate the pairwise products of the operands.
        const productXY = operandOne * operandTwo;
        const productYZ = operandTwo * operandThree;
        const productXZ = operandOne * operandThree;

        // Determine the smallest value among the three products.
        finalComputationResult = Math.min(productXY, productYZ, productXZ);
    }

    // --- Output Result ---

    // Display the final computed result to the standard output.
    console.log(finalComputationResult);
});