const acquireInputSource = () => {
    // This function encapsulates the acquisition of raw data from standard input.
    // It uses the Node.js 'fs' module to synchronously read the entire input.
    try {
        const fileSystem = require("fs");
        // Read from /dev/stdin, interpret as UTF-8, and remove leading/trailing whitespace.
        return fileSystem.readFileSync("/dev/stdin", "utf8").trim();
    } catch (inputError) {
        // In case of any error during file reading, log it and return an empty string.
        console.error("Error encountered while reading standard input:", inputError.message);
        return "";
    }
};

const parseNumericalString = (textSegment) => {
    // This utility function takes a string, splits it by spaces, and converts parts to numbers.
    // It also filters out any non-numeric results (like NaN from empty strings or invalid parsing).
    if (typeof textSegment !== 'string' || textSegment.length === 0) {
        // If the segment is not a valid string or is empty, return an empty array.
        return [];
    }
    // Split the string by one or more spaces and convert each part to a Number.
    // Filter out any entries that result in NaN (Not-a-Number).
    return textSegment.split(/\s+/).map(Number).filter(val => !isNaN(val));
};

function analyzeNumberParity(rawInputData) {
    // The main function to process the input and determine the outcome.

    // Step 1: Input validation and initial processing.
    if (!rawInputData || rawInputData.length === 0) {
        // If the input data is missing or empty, issue a warning and exit.
        console.warn("No input data provided for analysis. Exiting.");
        return;
    }

    // Split the entire input string into an array of lines.
    const inputLines = rawInputData.split('\n');

    // Ensure there are enough lines for the second line to exist.
    if (inputLines.length < 2) {
        console.error("Insufficient lines in input. Expected at least two lines.");
        return;
    }

    // The problem statement implies the numbers are on the second line (index 1).
    const targetNumberLine = inputLines[1];

    // Step 2: Parse the numeric sequence from the target line.
    const numericSequence = parseNumericalString(targetNumberLine);

    if (numericSequence.length === 0) {
        // If no valid numbers were found after parsing, warn and proceed with zero counts.
        console.warn("The second line did not contain any valid numbers to process.");
        // We will proceed, which means oddNumberTally will remain 0.
    }

    // Step 3: Initialize counters for even and odd numbers.
    let evenNumberTally = 0; // Counter for numbers divisible by 2.
    let oddNumberTally = 0;  // Counter for numbers not divisible by 2.

    // Step 4: Iterate through the numeric sequence to categorize numbers.
    // Using a 'for...of' loop for clear iteration over array elements.
    for (const currentNumValue of numericSequence) {
        // Basic type check to ensure we are only processing actual numbers.
        if (typeof currentNumValue !== 'number' || !Number.isInteger(currentNumValue)) {
            // Skip non-integer or non-numeric values.
            continue;
        }

        // Determine if the current number is even or odd using the modulo operator.
        // A number is even if the remainder when divided by 2 is 0.
        if (currentNumValue % 2 === 0) {
            evenNumberTally = evenNumberTally + 1; // Increment even counter.
        } else {
            oddNumberTally += 1; // Increment odd counter.
        }
    }

    // Step 5: Determine the final output based on the parity of the odd number count.
    let finalVerdict;
    // Check if the total count of odd numbers is itself an even number.
    if (oddNumberTally % 2 === 0) {
        finalVerdict = "YES"; // If the count of odd numbers is even.
    } else {
        finalVerdict = "NO";  // If the count of odd numbers is odd.
    }

    // Step 6: Display the final result.
    console.log(finalVerdict);
}

// Execute the primary analysis function using data obtained from standard input.
analyzeNumberParity(acquireInputSource());