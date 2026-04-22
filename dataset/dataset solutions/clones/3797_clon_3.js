function processInputData(rawDataString) {
    // Define a constant for the numerical base, enhancing readability.
    const DECIMAL_RADIX = 10;

    // Process the raw input string: remove leading/trailing whitespace, then split into individual lines.
    const linesOfText = rawDataString.trim().split('\n');

    // Implement a preliminary validation check for the input structure.
    // We expect at least two lines: one for the count and one for the sequence.
    if (linesOfText.length < 2) {
        console.error("Input processing error: Not enough data lines were provided. Expected at least two lines.");
        return; // Terminate execution if input is malformed.
    }

    // Extract the number of elements from the first line, ensuring it's a valid integer.
    // Utilize Number.parseInt for explicit base handling and trim to clean the string.
    const elementCount = Number.parseInt(linesOfText[0].trim(), DECIMAL_RADIX);

    // Validate the parsed element count to ensure it's a non-negative number.
    if (Number.isNaN(elementCount) || elementCount < 0) {
        console.error("Input processing error: The specified element count is invalid or negative.");
        return; // Terminate if the count is unusable.
    }

    // Parse the second line: split by spaces and convert each part to an integer.
    // The map function efficiently handles the transformation of all string elements.
    let numericSequence = linesOfText[1].split(' ').map(valStr => Number.parseInt(valStr.trim(), DECIMAL_RADIX));

    // A more robust check: ensure the actual number of parsed elements matches the declared count.
    // If fewer elements are found than declared, it indicates a discrepancy in the input.
    if (numericSequence.length < elementCount) {
        console.error(`Input processing error: Declared ${elementCount} elements, but only ${numericSequence.length} were found in the sequence.`);
        return; // Terminate to prevent out-of-bounds access or incorrect calculations.
    }
    // Note: If numericSequence.length > elementCount, the loops below will naturally adhere to elementCount,
    // so no explicit error is strictly necessary for an excess of elements.

    // Initialize a variable to accumulate the total number of matching subarrays.
    let resultTally = 0;

    // Begin the primary iteration through the numeric sequence.
    // The 'currentPosition' tracks the starting index of potential subarrays.
    for (let currentPosition = 0; currentPosition < elementCount; ++currentPosition) {
        // For each starting element, initialize two accumulators:
        // 'bitwiseResult' for the XOR sum and 'arithmeticResult' for the regular sum.
        let bitwiseResult = numericSequence[currentPosition];
        let arithmeticResult = numericSequence[currentPosition];

        // Every single element itself forms a valid subarray where XOR sum equals arithmetic sum.
        // This is because XORing a number with itself is 0, but the initial value is the number.
        // (XOR sum of a single element 'A' is 'A', arithmetic sum of 'A' is 'A').
        resultTally++;

        // Initiate a nested loop to extend subarrays from 'currentPosition' to the end of the sequence.
        // 'subsequentPosition' iterates through elements following 'currentPosition'.
        for (let subsequentPosition = currentPosition + 1; subsequentPosition < elementCount; ++subsequentPosition) {
            // Update both accumulators with the next element in the sequence.
            bitwiseResult ^= numericSequence[subsequentPosition];       // Bitwise XOR operation.
            arithmeticResult += numericSequence[subsequentPosition];    // Arithmetic addition.

            // Compare the accumulated XOR sum and arithmetic sum.
            // If they are identical, it signifies a matching subarray.
            if (bitwiseResult === arithmeticResult) {
                resultTally++; // Increment the counter for matching subarrays.
            }
        }
    }

    // Output the final count of subarrays where the bitwise XOR sum equals the arithmetic sum.
    // Using console.info for informational output.
    console.info(resultTally);
}

// Define an execution wrapper to handle external dependencies and potential errors gracefully.
function executeSolution() {
    try {
        // Attempt to read input from the standard input stream.
        const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
        // Pass the read content to the core processing function.
        processInputData(fileContent);
    } catch (error) {
        // Catch and report any errors that occur during file reading or initial processing.
        console.error("Execution failed: An error occurred while reading input or during initial setup.", error.message);
    }
}

// Invoke the solution wrapper to start the program.
executeSolution();