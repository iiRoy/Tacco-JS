function processDataStreams(incomingTextStream) {
    // Define some constants for clarity and potential reuse throughout the parsing process.
    const LINE_DELIMITER_CHAR = "\n";
    const VALUE_DELIMITER_CHAR = " ";
    const DECIMAL_RADIX = 10; // Standard decimal radix for number parsing.

    // --- Input Processing and Initial Validation ---

    // Split the entire input block into individual lines based on the newline character.
    let contentLines = incomingTextStream.split(LINE_DELIMITER_CHAR);

    // Basic validation: Ensure that a sufficient number of lines are present
    // for the expected data structure (N, Sequence A, Q, Sequence B).
    if (contentLines.length < 4) {
        console.error("INPUT_ERROR: Insufficient data lines provided in the input stream.");
        return; // Terminate execution if input is malformed.
    }

    // Extract and parse the declared lengths of the two numeric sequences.
    // Using Number() constructor is a concise way to convert string to number.
    let primarySequenceLength = Number(contentLines[0]);
    let secondarySequenceLength = Number(contentLines[2]);

    // Validate that the parsed lengths are indeed positive integers.
    // Non-numeric or zero/negative lengths indicate invalid input.
    if (isNaN(primarySequenceLength) || primarySequenceLength <= 0 ||
        isNaN(secondarySequenceLength) || secondarySequenceLength <= 0) {
        console.error("INPUT_ERROR: Invalid sequence size definitions detected. Expected positive integers.");
        return;
    }

    // --- Data Transformation for Numeric Sequences ---

    // Split the string representations of the sequences into arrays of string tokens,
    // then map these tokens to actual numeric values.
    // This approach avoids direct modification of the `contentLines` array and uses
    // modern JavaScript array methods for transformation.
    let primaryRawValues = contentLines[1].split(VALUE_DELIMITER_CHAR);
    let secondaryRawValues = contentLines[3].split(VALUE_DELIMITER_CHAR);

    // Perform an additional validation step: check if the number of actual elements
    // in the split strings matches the declared lengths.
    if (primaryRawValues.length !== primarySequenceLength ||
        secondaryRawValues.length !== secondarySequenceLength) {
        console.error("DATA_MISMATCH_ERROR: The number of provided elements does not match the declared sequence lengths.");
        return;
    }

    // Convert the arrays of string values into arrays of numbers.
    // The `map(Number)` method efficiently parses each string element.
    let firstCollectionOfNumbers = primaryRawValues.map(val => Number(val));
    let secondCollectionOfNumbers = secondaryRawValues.map(val => Number(val));

    // --- Core Logic: Pairwise Comparison and Accumulation ---

    // Initialize a counter to keep track of how many pairs of elements
    // (one from each collection) are found to be identical.
    let totalIdenticalPairsCount = 0;

    // Utilize nested loops to iterate through every possible combination of elements
    // from the first and second numeric collections.
    // This maintains the original O(N*Q) time complexity for the comparison phase.
    for (let indexForPrimary = 0; indexForPrimary < primarySequenceLength; ++indexForPrimary) {
        // Cache the current element from the first collection for efficiency within the inner loop.
        let currentPrimaryValue = firstCollectionOfNumbers[indexForPrimary];

        for (let indexForSecondary = 0; indexForSecondary < secondarySequenceLength; ++indexForSecondary) {
            // Cache the current element from the second collection.
            let currentSecondaryValue = secondCollectionOfNumbers[indexForSecondary];

            // Compare the two current elements for strict equality.
            // If they are identical, increment the total count of matching pairs.
            if (currentPrimaryValue === currentSecondaryValue) {
                totalIdenticalPairsCount++;
            }
        }
    }

    // Output the final accumulated count of identical pairs to the console.
    console.log(totalIdenticalPairsCount);
}

// --- Application Entry Point ---

// Define constants for file system operations and standard input path.
const fileSystemModuleReference = require("fs");
const standardInputFilePath = "/dev/stdin";
const defaultEncoding = "utf8";

// Execute the main data processing function by reading input from standard input.
// A try-catch block is added for robust error handling during file system operations.
try {
    const rawInputContentString = fileSystemModuleReference.readFileSync(standardInputFilePath, defaultEncoding);
    processDataStreams(rawInputContentString);
} catch (inputReadingError) {
    console.error("SYSTEM_ERROR: An issue occurred while attempting to read from standard input.", inputReadingError);
}