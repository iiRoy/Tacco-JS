const fileSystemModule = require('fs'); // Import the core file system module for I/O operations.

// Read all incoming raw content from the standard input stream, assuming UTF-8 encoding.
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Define the standard line termination character.
const lineDelimiter = '\n';

// Process the raw input: remove leading/trailing whitespace, split into individual lines,
// and filter out any resulting empty strings (e.g., from a trailing newline in the input).
let parsedInputLines = rawInputContent.trim().split(lineDelimiter).filter(Boolean);

// The very first line is expected to be an integer indicating the number of processing cycles.
// Extract this value and convert it to a base-10 integer.
const numberOfProcessingCycles = parseInt(parsedInputLines.shift(), 10);

// Implement a robust check for the extracted cycle count.
if (isNaN(numberOfProcessingCycles) || numberOfProcessingCycles < 0) {
    console.error('Error: The initial input did not provide a valid non-negative number for processing cycles.');
    process.exit(1); // Terminate execution due to invalid input.
}

// Define a regular expression to target and truncate decimal parts of numbers within expressions.
// For example, "12.34" will become "12".
const decimalTruncationPattern = /(\d+)\.\d+/g;

// Iterate through the remaining lines, performing the specified operations for each.
for (let currentCycleIndex = 0; currentCycleIndex < numberOfProcessingCycles; ++currentCycleIndex) {
    // Retrieve the current mathematical expression string from the parsed lines array.
    let currentExpressionString = parsedInputLines[currentCycleIndex];

    // Basic validation: ensure an expression string actually exists for the current cycle.
    if (!currentExpressionString) {
        console.error(`Warning: No expression found for processing cycle ${currentCycleIndex}. Skipping.`);
        continue; // Move to the next cycle if the current line is missing.
    }

    // Sanitize the expression string by removing all decimal parts from numbers.
    // The callback function ensures only the integer part is retained.
    const sanitizedExpression = currentExpressionString.replace(decimalTruncationPattern, (fullMatch, integerPart) => integerPart);

    // WARNING: Use of eval() can pose significant security risks if the input is not fully trusted
    // or properly sanitized, as it executes arbitrary JavaScript code.
    // For this specific problem, it's used as per the original functionality.
    const computedIntermediateResult = eval(sanitizedExpression);

    // Convert the computed result to its integer floor value before logging.
    // Math.floor() ensures that any floating-point result (e.g., from division) is truncated downwards.
    const finalIntegerOutput = Math.floor(computedIntermediateResult);

    // Print the final integer result for the current expression.
    console.log(finalIntegerOutput);
}