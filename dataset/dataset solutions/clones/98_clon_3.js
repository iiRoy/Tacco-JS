// A utility module for performing file system operations.
const fileSystemModule = require("fs");

// Define constants for the standard input source path and its character encoding.
const standardInputFilePath = "/dev/stdin";
const fileContentEncoding = "utf8";

// Define constants used in the core mathematical computation.
const primaryDivisorConstant = 98.0; // Explicitly a floating-point number.
const additiveOffsetConstant = 2;

let allInputLines; // This variable will store an array of lines read from the input.

// Attempt to read the entire content from the specified standard input file.
try {
    const rawBufferContent = fileSystemModule.readFileSync(standardInputFilePath, fileContentEncoding);
    // Split the raw content into an array of lines.
    // The regular expression `/\r?\n/` handles both Unix (`\n`) and Windows (`\r\n`) line endings.
    allInputLines = rawBufferContent.split(/\r?\n/);
} catch (readOperationError) {
    // If any error occurs during the file reading operation,
    // log the error message and initialize `allInputLines` as an empty array.
    // This prevents subsequent errors when attempting to iterate over a non-existent array.
    console.error("Input data acquisition failed:", readOperationError.message);
    allInputLines = [];
}

// Initialize a cursor to track the current position within the `allInputLines` array.
let lineCursor = 0;

// Declare a variable that will hold the parsed numeric value of the current line.
let currentProcessedNumber;

// Begin the iteration process through the collected input lines.
// The `for` loop's condition is designed to:
// 1. Attempt to parse the string at `allInputLines[lineCursor]` into a number using `Number()`.
// 2. Assign the result of this parsing to `currentProcessedNumber`.
// 3. Increment `lineCursor` for the next iteration.
// 4. Evaluate `currentProcessedNumber` as a boolean. The loop continues only if it's a truthy value.
//    (This precisely mimics the original code's behavior where 0 or NaN would terminate the loop).
for (
    /* Initialization of lineCursor and allInputLines occurs above */;
    (currentProcessedNumber = Number(allInputLines[lineCursor++]));
) {
    // Step 1: Calculate the square of the current numeric input.
    // Using simple multiplication here, but `Math.pow(currentProcessedNumber, 2)` could also be used.
    const numberSquared = currentProcessedNumber * currentProcessedNumber;

    // Step 2: Divide the squared value by the predefined divisor constant.
    const intermediateDivisionResult = numberSquared / primaryDivisorConstant;

    // Step 3: Add the predefined offset constant to the result of the division.
    const finalArithmeticValue = intermediateDivisionResult + additiveOffsetConstant;

    // Step 4: Truncate the floating-point result to its integer part.
    // `Math.trunc()` is used here as a Type III replacement for the bitwise `~~` operator.
    const integerOutputResult = Math.trunc(finalArithmeticValue);

    // Output the final computed integer result to the console.
    console.log(integerOutputResult);
}