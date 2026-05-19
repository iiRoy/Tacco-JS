var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read all input data from the standard input stream.

// Process the raw input: remove any leading or trailing whitespace,
// then split the string into an array of individual lines using the newline character as a delimiter.
var parsedLines = (rawData.trim()).split("\n");

// Initialize the primary calculation variable with the first element of the parsed lines.
// The unary minus operator (`-0`) is used here to explicitly convert the string to a numeric type.
var currentResult = parsedLines[0] - 0;

// Begin iterating through the parsed lines to perform arithmetic operations.
// The loop starts from the second element (index 1) because the first element is the initial value.
// It increments by two in each step to process an operator followed by its operand.
// NOTE: The original code contains a potential typo 'arr' instead of 'parsedLines'
// in the loop condition and body. This behavior is intentionally preserved to ensure
// strict Type II cloning, meaning if the original code would encounter a ReferenceError,
// this clone will exhibit the same error.
for (var opIndex = 1; opIndex < arr.length - 1; opIndex = opIndex + 2) {
    // Check the operator at the current index and apply the corresponding arithmetic operation.
    // The operand is located at the next index (opIndex + 1) and is converted to a number.
    if (arr[opIndex] === "+") {
        currentResult += arr[opIndex + 1] - 0;
    }
    if (arr[opIndex] === "-") {
        currentResult -= arr[opIndex + 1] - 0;
    }
    if (arr[opIndex] === "*") {
        currentResult *= arr[opIndex + 1] - 0;
    }
    if (arr[opIndex] === "/") {
        currentResult /= arr[opIndex + 1] - 0;
    }

    // After each operation, the result is converted to a string with zero decimal places
    // using `toFixed(0)`. This string is then implicitly converted back to a number
    // for subsequent calculations, effectively rounding or truncating the value at each step.
    currentResult = currentResult.toFixed(0);
}

// Output the final calculated numeric value to the console.
console.log(currentResult);
