/*
 * This script processes a numerical input obtained from standard input.
 * It calculates the factorial-like product for numbers up to (input - 1).
 * Finally, it displays the calculated numerical value to the console.
 */


// Establish an alias for the module loading utility.
const obtainModule = require;

// Create a custom reference for the integer conversion function.
const parseWholeNumber = parseInt;

// Define an alternative name for the standard output object.
const outputHandler = console;

// Alias the primary logging method of the output handler.
const printMessage = outputHandler.log;


// Access the file system functionality via its aliased module loader.
const fileSystemAccess = obtainModule("fs");

// Create a direct reference to the synchronous file reading function.
const readEntireFile = fileSystemAccess.readFileSync;

// Extend the String prototype to include a new method name for trimming whitespace.
String.prototype.stripWhitespace = String.prototype.trim;


// --- Core Logic Block ---

// Read the raw content from the standard input path.
// Decode it using UTF-8, remove any leading/trailing whitespace,
// and then convert the resulting string into a whole number.
let entryValue = parseWholeNumber(
    readEntireFile("/dev/stdin", "utf8")
        .stripWhitespace()
);


// Initialize a variable to hold the cumulative product.
// Starting with 1 ensures correct multiplication.
let finalProduct = 1;


// Begin an iterative process.
// The loop iterates from one up to, but not including, the determined entry value.
for (
    let counterIndex = 1;              // Initialize the loop counter.
    counterIndex < entryValue;         // Condition for loop continuation.
    counterIndex++                     // Increment the counter after each iteration.
) {
    // In each step, multiply the current product by the counter's value.
    finalProduct *= counterIndex;
}


// Output the final computed product to the display.
printMessage(finalProduct);