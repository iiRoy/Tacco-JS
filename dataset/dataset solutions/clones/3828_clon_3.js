let collectedInputStrings = [];
let computedFinalValue = 0; // This variable will store the final numerical outcome.

// Load the 'readline' module, responsible for handling stream-based input.
const inputLineProcessor = require('readline');

// Configure an interface to manage standard input/output operations.
// This abstraction allows us to read user input line by line.
const ioInterface = inputLineProcessor.createInterface({
    input: process.stdin,  // Connects to the standard input stream.
    output: process.stdout // Connects to the standard output stream (not used for direct prompts in this setup).
});

// Attach a listener for the 'line' event. Each time a new line of text
// is received from the input stream, this callback function is invoked.
ioInterface.on('line', (currentLineData) => {
    // Add the received line (as a string) to our growing collection.
    collectedInputStrings.push(currentLineData);
});

// Attach a listener for the 'close' event. This signifies that the
// input stream has ended, and all data has been received.
// It's time to process the accumulated input.
ioInterface.on('close', () => {
    // Perform a preliminary check to ensure we actually received some input.
    if (collectedInputStrings.length === 0) {
        console.error("Input processing terminated: No data lines were provided for computation.");
        return; // Halt execution if no input exists.
    }

    // Attempt to convert the very first line of input into a floating-point number.
    // This number will serve as the upper limit for our subsequent calculations.
    const targetValueLimit = parseFloat(collectedInputStrings[0]);

    // Validate the parsed numerical input: ensure it's a valid number and non-negative.
    if (isNaN(targetValueLimit) || targetValueLimit < 0) {
        console.error("Input processing terminated: The initial input value is not a valid non-negative number.");
        return; // Halt execution if the input is invalid.
    }

    // Define the boundaries for the exponents used in power calculations.
    // The problem specifies powers from 2 up to 10.
    const MIN_POWER_EXPONENT = 2;
    const MAX_POWER_EXPONENT = 10;

    // Begin the primary iteration: cycle through potential base numbers.
    // The base number starts from 1 and goes up to our 'targetValueLimit'.
    for (let baseNumberCandidate = 1; baseNumberCandidate <= targetValueLimit; baseNumberCandidate++) {
        // For each 'baseNumberCandidate', we now check its powers.
        // The original logic implicitly overwrites values,
        // so we iterate exponents downwards to mimic this overwrite behavior,
        // ensuring the assignment from the *smallest* valid exponent persists.
        for (let currentExponent = MAX_POWER_EXPONENT; currentExponent >= MIN_POWER_EXPONENT; currentExponent--) {
            // Compute the power of the base number using the current exponent.
            // The ES6 exponentiation operator (**) is used for clarity and conciseness.
            const calculatedPower = baseNumberCandidate ** currentExponent;

            // If the calculated power does not exceed our 'targetValueLimit',
            // it's a valid candidate for our final result. We update 'computedFinalValue'.
            // Because we iterate exponents downwards, the value corresponding to the
            // smallest valid exponent for this 'baseNumberCandidate' will be the last one assigned.
            if (calculatedPower <= targetValueLimit) {
                computedFinalValue = calculatedPower;
            }
        }
    }

    // After all iterations and computations are complete,
    // output the final 'computedFinalValue' to the standard output.
    console.log(computedFinalValue);
});