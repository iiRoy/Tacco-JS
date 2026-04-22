// Initialize the standard input stream for data reception.
// This ensures that the process doesn't terminate prematurely while waiting for input.
process.stdin.resume();

// Set the character encoding for the incoming data to UTF-8.
// This is crucial for correct interpretation of various characters.
process.stdin.setEncoding('utf8');

// Declare an array to store all lines of input received from the standard input.
// This acts as a buffer for the incoming data.
var incomingDataStore = [];

// Create an interface for reading lines from the standard input.
// This utility simplifies line-by-line input processing.
var inputProcessor = require('readline').createInterface({
    input: process.stdin,   // Specify standard input as the source.
    output: process.stdout  // Specify standard output for any potential prompts (though not used here).
});

// Attach an event listener for the 'line' event.
// This callback function is executed every time a new line of input is received.
inputProcessor.on('line', (currentInputLineSegment) => {
    // Each received line is appended to our data storage array.
    // This accumulates all input until the stream closes.
    incomingDataStore.push(currentInputLineSegment);
});

// Attach an event listener for the 'close' event.
// This callback function is executed once the input stream has ended and all data has been received.
inputProcessor.on('close', () => {
    // --- Post-input processing begins here ---

    // Stage 1: Input Validation and Extraction
    // Check if any data was actually received before attempting to process.
    if (incomingDataStore.length === 0) {
        // If no data was received, indicate an error and terminate the process.
        console.error("Error: No input data detected. Please provide at least one line for computation.");
        process.exit(1); // Exit with a non-zero status code to indicate an error.
    }

    // Retrieve the very first line of input from our collected data.
    const firstInputEntry = incomingDataStore[0];

    // Stage 2: Data Type Conversion and Pre-computation Validation
    // Convert the extracted string input into a numeric type.
    // The 'Number()' constructor handles both integers and floating-point numbers.
    const numericalInputEntity = Number(firstInputEntry);

    // Validate if the conversion resulted in a valid number.
    if (isNaN(numericalInputEntity)) {
        // If the input could not be converted to a number, log an error and terminate.
        console.error(`Error: The provided input '${firstInputEntry}' is not a valid number. Cannot proceed with computation.`);
        process.exit(1);
    }

    let finalCalculatedValue; // This variable will store the ultimate result of our computation.

    // Stage 3: Conditional Calculation Logic
    // Explicitly handle the edge case where the numerical input value is zero.
    // For n=0, the original expression (0 + (0 % 2)) / (2 * 0) simplifies to 0/0, which mathematically results in NaN (Not a Number).
    if (numericalInputEntity === 0) {
        finalCalculatedValue = NaN; // Assign NaN to match the original expression's behavior.
    } else {
        // Determine the parity (whether the number is even or odd) of the numerical input.
        const isInputEven = (numericalInputEntity % 2 === 0);

        if (isInputEven) {
            // If the input number is even:
            // The original expression (n + (n % 2)) / (2 * n) simplifies to (n + 0) / (2 * n),
            // which further reduces to n / (2 * n). Assuming n is not zero (already handled), this is 1/2.
            finalCalculatedValue = 0.5; // Represented as a float for exactness.
        } else {
            // If the input number is odd:
            // The original expression becomes (n + 1) / (2 * n).
            // We break this down into intermediate steps for enhanced readability and clarity.
            const incrementedNumerator = numericalInputEntity + 1; // Calculate the numerator.
            const doubledDenominator = 2 * numericalInputEntity; // Calculate the denominator.
            finalCalculatedValue = incrementedNumerator / doubledDenominator; // Perform the division.
        }
    }

    // Stage 4: Output the final computed result.
    // The output format is kept identical to the original script to ensure functional equivalence.
    console.log(finalCalculatedValue);
});