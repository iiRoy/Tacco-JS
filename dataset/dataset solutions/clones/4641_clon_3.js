// This script is designed to assess if a sequence of three integer values,
// provided through standard input, forms an arithmetic progression.
// Input format expected: "NUM1 NUM2 NUM3" (space-separated integers).

// Configure the standard input stream to handle UTF-8 encoded text.
process.stdin.setEncoding('utf8');

// Attach an event listener to the standard input stream for 'data' events.
// This function will be triggered whenever new data chunks are available.
process.stdin.on('data', function processInputChunk(inputBuffer) {

    // Convert the incoming buffer to a string and remove leading/trailing whitespace.
    const cleanInputLine = inputBuffer.toString().trim();

    // Early exit if the input line is empty after trimming.
    if (!cleanInputLine) {
        return; // No meaningful data to process.
    }

    // Split the cleaned input string into an array of potential number strings.
    const numStringsArray = cleanInputLine.split(' ');

    // Validate if enough numerical components are present.
    // An arithmetic progression requires at least three terms.
    if (numStringsArray.length < 3) {
        console.log("INSUFFICIENT_TERMS_PROVIDED"); // Custom error message
        return;
    }

    // Parse the first three string components into integer values.
    // Using parseInt with radix 10 for explicit conversion.
    const numOne = parseInt(numStringsArray[0], 10);
    const numTwo = parseInt(numStringsArray[1], 10);
    const numThree = parseInt(numStringsArray[2], 10);

    // Validate if all parsed values are indeed valid numbers.
    // If any conversion results in NaN, the input is invalid.
    if (isNaN(numOne) || isNaN(numTwo) || isNaN(numThree)) {
        console.log("INVALID_NUMERIC_INPUT_DETECTED"); // Custom error message
        return;
    }

    // --- Core Logic Transformation ---
    // Original: Calculated two differences (b-a) and (c-b) and compared them.
    // Rewritten: Using the mathematical property that for an arithmetic progression (a, b, c),
    // 2 * b must be equal to a + c. This is functionally equivalent and represents a structural change.

    const sumOfExtremes = numOne + numThree; // Intermediate helper variable for clarity.
    const doubleTheMiddle = 2 * numTwo;      // Intermediate helper variable for clarity.

    // Determine if the sequence adheres to the arithmetic progression rule.
    const isArithmeticSeries = (sumOfExtremes === doubleTheMiddle);

    // Output the result based on the evaluation.
    // Using a ternary operator for a more concise conditional output.
    console.log(isArithmeticSeries ? "ARITHMETIC_SEQUENCE" : "NON_ARITHMETIC_SEQUENCE");

});

// End of script logic. The standard input stream will remain open until explicitly closed
// or the process exits, allowing multiple lines of input if desired by the user.