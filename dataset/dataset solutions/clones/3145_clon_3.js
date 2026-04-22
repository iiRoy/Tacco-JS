// This script processes numerical input from standard input to determine a specific calculated outcome.

// A helper function to safely transform an array of string representations of numbers into actual integers.
const parseNumericArray = (stringElements) => {
    // We use parseInt with radix 10 to ensure correct conversion to base-10 integers.
    // trim() is used to handle potential leading/trailing whitespace around number strings.
    return stringElements.map(item => parseInt(item.trim(), 10));
};

// Encapsulates the core logic for determining the final result based on two input values.
const determineResult = (primaryValue, secondaryValue) => {
    let finalCalculationResult; // Variable to store the outcome of the calculation.

    // First condition: if both input values are exactly the same.
    if (primaryValue === secondaryValue) {
        finalCalculationResult = primaryValue; // The result is simply one of the identical values.
    } else {
        // If values are different, proceed with further checks.
        const sumOfOperands = primaryValue + secondaryValue; // Compute the sum for parity check.
        const bitwiseXorOutcome = primaryValue ^ secondaryValue; // Compute the bitwise XOR operation once.

        // Second condition: if the values are different AND their sum is an even number.
        if ((sumOfOperands % 2) === 0) {
            finalCalculationResult = bitwiseXorOutcome - 1; // Apply the specific rule for an even sum.
        } else {
            // Third (default) condition: if values are different AND their sum is an odd number.
            finalCalculationResult = bitwiseXorOutcome; // Apply the specific rule for an odd sum.
        }
    }
    return finalCalculationResult; // Return the determined result.
};

// The main entry point function that orchestrates the input parsing and calculation.
function processNumericalInput(rawInputString) {
    // Split the entire input string into an array of individual lines.
    const inputRecordLines = rawInputString.split('\n');

    // Guard clause: Check if there's any input data at all.
    if (!inputRecordLines || inputRecordLines.length === 0 || inputRecordLines[0].trim() === '') {
        console.error("Input processing error: No valid input data found or first line is empty.");
        return; // Terminate execution if no meaningful input is present.
    }

    // Extract the very first line which is expected to contain the numerical operands.
    const firstLineContent = inputRecordLines.shift();
    if (!firstLineContent) {
        console.error("Input processing error: The first line of input was unexpectedly empty.");
        return;
    }

    // Split the first line by space(s) and filter out any empty strings that might result from multiple spaces.
    const stringOperands = firstLineContent.split(' ').filter(segment => segment !== '');

    // Guard clause: Ensure we have at least two string segments to parse into numbers.
    if (stringOperands.length < 2) {
        console.error(`Input processing error: Expected at least two numerical operands, but found ${stringOperands.length}.`);
        return;
    }

    // Convert the string segments into an array of actual numbers using the helper.
    const numericOperands = parseNumericArray(stringOperands);

    // Extract the two primary operands from the parsed array.
    const firstOperand = numericOperands[0];
    const secondOperand = numericOperands[1];

    // Perform the core calculation using the dedicated function.
    const finalComputedValue = determineResult(firstOperand, secondOperand);

    // Output the final result to the console in a descriptive format.
    console.log(`The final computed value is: ${finalComputedValue}`);
}

// --- Program Execution Start ---
const fileSystemModule = require("fs"); // Import Node.js's file system module.

try {
    // Attempt to read the entire content from standard input asynchronously.
    // Explicitly specify 'utf8' encoding for consistent text processing.
    const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", { encoding: "utf8" });
    // Invoke the main processing function with the content read from stdin.
    processNumericalInput(standardInputContent);
} catch (errorReadingInput) {
    // Catch and report any errors that occur during the file reading process.
    console.error("An unhandled error occurred while attempting to read standard input:", errorReadingInput.message);
}
// --- Program Execution End ---