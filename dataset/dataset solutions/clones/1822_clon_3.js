// This module is designed to process a block of textual data,
// typically originating from standard input, to derive a specific
// numerical range based on a set of rules.

const SPACE_SEPARATOR_CHAR = ' '; // Define a constant for the space character, improving readability.

/**
 * Executes the primary data processing logic on the provided raw input string.
 * It parses numerical data, applies conditional calculations, and outputs a result.
 * @param {string} rawInputString - The complete string content read from an input source.
 */
function initiateDataCalculation(rawInputString) {
    // Step 1: Prepare the input data.
    // First, remove any leading or trailing whitespace from the entire input.
    // Then, split the cleaned string into an array of individual lines.
    const parsedInputLines = rawInputString.trim().split('\n');

    // Step 2: Extract the initial count parameter.
    // The very first line is expected to contain a single number representing the total count
    // of subsequent data pairs. We remove this line from the array and convert it to a number.
    // Using parseFloat to handle potential non-integer inputs gracefully, though integers are expected.
    const totalElementQuantity = parseFloat(parsedInputLines.shift());

    // --- Type III Addition: Input Validation ---
    // It's crucial to ensure that the extracted quantity is a valid, positive number.
    // If it's not, we log an error and exit or return an indicator of failure.
    if (isNaN(totalElementQuantity) || totalElementQuantity <= 0) {
        console.error("Processing Error: The provided element quantity is invalid or non-positive.");
        // A robust system might throw an exception here, but for this clone, a log and early return suffice.
        return -1; // Indicate a failure to calculate.
    }

    // Type III Addition: Helper function to parse a single line into a numeric pair.
    // This encapsulates the logic for extracting two numbers from a line, making the main
    // loop cleaner and more focused.
    const extractPairFromLine = (singleLineContent) => {
        const partsOfLine = singleLineContent.split(SPACE_SEPARATOR_CHAR);
        const firstNumericalValue = parseFloat(partsOfLine[0]);
        const secondNumericalValue = parseFloat(partsOfLine[1]);

        // Type III Addition: Basic validation for individual line parsing.
        if (isNaN(firstNumericalValue) || isNaN(secondNumericalValue)) {
            console.warn(`Data Warning: Encountered non-numeric data in line: "${singleLineContent}". Skipping or using NaN.`);
            // Depending on requirements, could filter these out or provide default values.
        }
        return {
            first: firstNumericalValue,
            second: secondNumericalValue
        };
    };

    // Step 3: Populate the arrays for left and right bounds.
    // Instead of two separate map calls, we use a single loop for efficiency and to
    // demonstrate an alternative structural approach (Type III modification).
    const collectionOfLeftBounds = [];
    const collectionOfRightBounds = [];

    for (let currentLineIndex = 0; currentLineIndex < parsedInputLines.length; currentLineIndex++) {
        const lineData = extractPairFromLine(parsedInputLines[currentLineIndex]);
        collectionOfLeftBounds.push(lineData.first);
        collectionOfRightBounds.push(lineData.second);
    }

    let calculatedLowerMedian; // Variable to hold the derived lower median.
    let calculatedUpperMedian; // Variable to hold the derived upper median.
    let finalResultantRange; // The ultimate value to be output.

    // Step 4: Apply conditional logic based on the parity of the total element quantity.
    if (totalElementQuantity % 2 !== 0) { // Case: The quantity of elements is odd.
        // For an odd count, there's a single central element.
        // The index is simply the floor of (count / 2).
        const singleMidPointIndex = Math.floor(totalElementQuantity / 2);

        // Retrieve values directly from the central index.
        calculatedLowerMedian = collectionOfLeftBounds[singleMidPointIndex];
        calculatedUpperMedian = collectionOfRightBounds[singleMidPointIndex];

        // The range calculation for odd counts.
        finalResultantRange = calculatedUpperMedian - calculatedLowerMedian + 1;
    } else { // Case: The quantity of elements is even.
        // For an even count, there are two central elements.
        // Identify the indices of these two central elements.
        const firstCentralIndex = (totalElementQuantity / 2) - 1;
        const secondCentralIndex = totalElementQuantity / 2;

        // Type III Addition: Introduce intermediate sums for clarity.
        // Calculate the sum of the two central left values.
        const sumOfCentralLeftValues = collectionOfLeftBounds[firstCentralIndex] + collectionOfLeftBounds[secondCentralIndex];
        // The lower median is the average of these two values.
        calculatedLowerMedian = sumOfCentralLeftValues / 2.0; // Explicit float division.

        // Calculate the sum of the two central right values.
        const sumOfCentralRightValues = collectionOfRightBounds[firstCentralIndex] + collectionOfRightBounds[secondCentralIndex];
        // The upper median is the average of these two values.
        calculatedUpperMedian = sumOfCentralRightValues / 2.0;

        // The range calculation for even counts.
        finalResultantRange = (calculatedUpperMedian - calculatedLowerMedian) * 2 + 1;
    }

    // Step 5: Output the final calculated range.
    console.log(finalResultantRange);
}

// --- Entry Point and Error Handling (Type III Addition) ---
// This block handles the reading of input from the file system and
// passes it to the main processing function. It includes basic error handling.
try {
    // Attempt to read the entire content from standard input synchronously.
    // This assumes the environment supports 'fs' module and '/dev/stdin'.
    const fileSystemInputContent = require("fs").readFileSync("/dev/stdin", "utf8");

    // Invoke the primary function with the obtained file content.
    initiateDataCalculation(fileSystemInputContent);
} catch (ioError) {
    // If there's an issue reading the file or the 'fs' module is unavailable.
    console.error("Input/Output Error: Failed to read from /dev/stdin or 'fs' module issue.", ioError.message);
    // Terminate the process with an error code.
    process.exit(1);
}