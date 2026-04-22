// This script is designed to process numerical data provided via standard input.
// Its primary function is to read four distinct integer values, perform a series of
// arithmetic operations, and then output a conditionally determined result.
// This implementation includes robust input handling and clear step-by-step calculations.

// Utilize the built-in Node.js 'fs' (File System) module for synchronous file operations.
const fileSystemInterface = require('fs');

// Define the file path for retrieving input. In many Unix-like environments,
// '/dev/stdin' is a symbolic link to the standard input stream.
const inputSourceIdentifier = '/dev/stdin';

// --- Phase 1: Input Acquisition and Initial Parsing ---

// Read the entire content of the specified input source synchronously.
// The data is expected to be encoded as UTF-8 text.
const completeRawInputBuffer = fileSystemInterface.readFileSync(inputSourceIdentifier, 'utf8');

// Break down the raw input buffer into an array of individual lines.
// We are specifically interested in processing only the very first line of input.
const allInputLines = completeRawInputBuffer.split('\n');
const primaryInputLine = allInputLines[0];

// Further segment the primary input line into an array of string tokens.
// These tokens are assumed to be separated by single space characters.
const candidateNumericStrings = primaryInputLine.split(' ');

// Define the expected number of numerical parameters.
const requiredParameterCount = 4;

// Implement a basic validation check to ensure sufficient input tokens are provided.
if (candidateNumericStrings.length < requiredParameterCount) {
    // If the input is incomplete, log a warning message to the error stream.
    // To prevent script termination, default values (zeros) are assigned for missing parameters.
    console.error(`Warning: Insufficient input values detected. Expected ${requiredParameterCount} numbers, but only ${candidateNumericStrings.length} were found. Defaulting to zero for missing values.`);
    // Fill the array with zeros if it's too short.
    while (candidateNumericStrings.length < requiredParameterCount) {
        candidateNumericStrings.push("0");
    }
}

// Extract and convert the string tokens into their numerical representations.
// The `Number()` constructor is used for explicit type conversion, providing flexibility
// for both integer and floating-point inputs, though integers are typically expected here.

// The initial numerical operand, often referred to as 'A'.
const firstNumericalOperand = Number(candidateNumericStrings.shift());

// The second numerical operand, often referred to as 'B'.
const secondNumericalOperand = Number(candidateNumericStrings.shift());

// The third numerical operand, often referred to as 'C'.
const thirdNumericalOperand = Number(candidateNumericStrings.shift());

// The fourth numerical operand, often referred to as 'D'.
const fourthNumericalOperand = Number(candidateNumericStrings.shift());

// --- Phase 2: Intermediate Calculations ---

// Pre-calculate the necessary products to enhance code readability and potentially
// avoid redundant computations if these values were to be used multiple times.

// Compute the product of the first and second operands (A * B).
const productOfOperandsOneAndTwo = firstNumericalOperand * secondNumericalOperand;

// Compute the product of the second and third operands (B * C).
const productOfOperandsTwoAndThree = secondNumericalOperand * thirdNumericalOperand;

// Compute the product of the third and fourth operands (C * D).
const productOfOperandsThreeAndFour = thirdNumericalOperand * fourthNumericalOperand;

// --- Phase 3: Conditional Logic and Result Determination ---

let resultantValue; // Declare a variable to store the final outcome of the logic.

// Evaluate the primary condition: Is (A * B) strictly greater than (B * C)?
if (productOfOperandsOneAndTwo > productOfOperandsTwoAndThree) {
    // If the condition holds true, the resultant value is (A * B).
    resultantValue = productOfOperandsOneAndTwo;
} else {
    // Otherwise, if the condition is false or equal, the resultant value is (C * D).
    resultantValue = productOfOperandsThreeAndFour;
}

// --- Phase 4: Output Presentation ---

// Display the final computed result to the standard output stream.
// A descriptive message is prepended to the numerical output for clarity.
console.log(`The final calculated outcome is: ${resultantValue}`);