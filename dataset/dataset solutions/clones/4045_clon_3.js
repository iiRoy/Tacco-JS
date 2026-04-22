const readlineModule = require("readline");

// A dynamic array to hold the raw string inputs received from the user.
let inputCollection = [];

// Establish an interface for standard input/output operations.
const interfaceInstance = readlineModule.createInterface({
    input: process.stdin,  // Directs input from the standard input stream.
    output: process.stdout // Directs output to the standard output stream.
});

/**
 * This generator function orchestrates the sequential capture of user input
 * and the subsequent arithmetic processing. It uses `yield` to pause execution
 * until a line of input is available, ensuring asynchronous input handling.
 */
const computationSequence = (function* () {
    /**
     * Internal helper function to set up a one-time listener for a new line of input.
     * When a line is received, it resumes the generator, passing the line content.
     */
    const setupLineListener = () => {
        interfaceInstance.once("line", (receivedInputChunk) => {
            // Resume the generator, providing the received line as the result of the `yield` expression.
            computationSequence.next(receivedInputChunk);
        });
    };

    // --- Input Capture Phase ---

    // Await and capture the first line of input.
    let firstRawValue = yield setupLineListener();
    inputCollection.push(firstRawValue); // Store the string representation.

    // Await and capture the second line of input.
    let secondRawValue = yield setupLineListener();
    inputCollection.push(secondRawValue); // Store the string representation.

    // Await and capture the third line of input.
    let thirdRawValue = yield setupLineListener();
    inputCollection.push(thirdRawValue); // Store the string representation.

    // --- Data Processing and Calculation Phase ---

    // Explicitly convert the collected string inputs into numerical types.
    // This helps prevent unexpected behavior from implicit type coercion during arithmetic.
    const numericOperandA = Number(inputCollection[0]);
    const numericOperandB = Number(inputCollection[1]);
    const numericOperandC = Number(inputCollection[2]);

    // Validation: Check if any of the inputs failed to convert to a valid number.
    // If so, log an error and potentially use default values or terminate.
    if (isNaN(numericOperandA) || isNaN(numericOperandB) || isNaN(numericOperandC)) {
        console.error("Error: One or more inputs were not valid numbers. Calculations may yield unexpected results (NaN).");
        // For robustness, could assign defaults like 0 here, but preserving NaN propagation for similar behavior.
    }

    // Step 1: Perform the subtraction operation.
    // This result is stored in an intermediate variable for clarity.
    let intermediateSubtractionResult = numericOperandA - numericOperandB;

    // Step 2: Perform the modulo operation.
    let finalComputedValue;
    // Guard clause: Check if the divisor for the modulo operation is zero.
    // Modulo by zero results in NaN in JavaScript. Explicitly handling this
    // provides better readability and allows for specific error/warning messages.
    if (numericOperandC === 0) {
        console.warn("Warning: Attempted modulo by zero. The resulting value will be Not-a-Number (NaN).");
        finalComputedValue = NaN; // Explicitly assign NaN.
    } else {
        finalComputedValue = intermediateSubtractionResult % numericOperandC;
    }

    // Update the first element of our input collection with the final computed result.
    // This mirrors the original code's behavior of modifying the first element in place.
    inputCollection[0] = finalComputedValue;

    // --- Output Phase ---

    // Display the final computed value to the standard output.
    console.log(inputCollection[0]);

    // Ensure a clean exit of the Node.js process after all operations are complete.
    // An exit code of 0 typically indicates successful execution.
    process.exit(0);
})();

// Initiate the generator sequence to begin prompting for the first user input.
computationSequence.next();