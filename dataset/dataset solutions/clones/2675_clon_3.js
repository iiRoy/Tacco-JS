const parseNumericSequence = (textualInput) => {
    // Verify the input is a non-empty string before processing.
    if (typeof textualInput !== 'string' || textualInput.trim() === '') {
        console.error("Error: Input for numeric sequence parsing must be a non-empty string.");
        return []; // Return an empty array if input is invalid.
    }

    // Split the input string by spaces to get individual string segments.
    // Then, attempt to convert each segment into a floating-point number.
    const rawSegments = textualInput.split(" ");
    const potentialNumbers = rawSegments.map(segment => parseFloat(segment));

    // Filter out any elements that did not successfully convert to a valid number (e.g., NaN).
    const validatedNumbers = potentialNumbers.filter(num => !isNaN(num));

    return validatedNumbers; // Return the array of successfully parsed numbers.
};

const executeValueCalculation = (inputPayload) => {
    // Retrieve an array of numbers from the provided input string using a dedicated parser.
    const dataSeries = parseNumericSequence(inputPayload);

    // Define the minimum count of numbers required for the subsequent calculation.
    const REQUIRED_ELEMENT_COUNT = 3;

    // Implement a pre-check: if the number of parsed elements is insufficient,
    // output a warning and return a default value (zero in this context).
    if (dataSeries.length < REQUIRED_ELEMENT_COUNT) {
        console.warn(`Warning: Expected at least ${REQUIRED_ELEMENT_COUNT} numeric elements, but found only ${dataSeries.length}. Outputting default value.`);
        process.stdout.write('0\n'); // Output '0' followed by a newline.
        return; // Terminate execution of this function.
    }

    // Extract the specific elements needed for the primary calculation,
    // assigning them to descriptive variable names for clarity.
    const firstValue = dataSeries[0];  // Corresponds to the first number in the input.
    const secondValue = dataSeries[1]; // Corresponds to the second number in the input.
    const thirdValue = dataSeries[2];  // Corresponds to the third number in the input.

    // Perform the core arithmetic operation: (third + second - first).
    const intermediateCalculationResult = thirdValue + secondValue - firstValue;

    let finalOutputValue; // Declare a variable to store the final, conditionally adjusted result.

    // Apply a conditional adjustment: if the intermediate result is negative,
    // it is overridden to zero; otherwise, the original result is retained.
    if (intermediateCalculationResult < 0) {
        finalOutputValue = 0; // Ensure the result is never negative.
    } else {
        finalOutputValue = intermediateCalculationResult; // Use the calculated value directly.
    }

    // Write the final computed numeric value to the standard output stream,
    // ensuring it's converted to a string and followed by a newline character.
    process.stdout.write(String(finalOutputValue) + '\n');
};

// This section serves as the program's entry point.
// It reads the entire content from standard input (typically '/dev/stdin' on Unix-like systems)
// as a UTF-8 encoded string and then passes it to the main processing function.
const rawInputFromStandardStream = require('fs').readFileSync('/dev/stdin', 'utf8');
executeValueCalculation(rawInputFromStandardStream);