// Function responsible for processing an input string to determine a specific symmetry.
function processInputString(rawData) {
    // Pre-define standard messages for output to enhance clarity and maintainability.
    const POSITIVE_OUTCOME_MESSAGE = "Yes";
    const NEGATIVE_OUTCOME_MESSAGE = "No";

    // Establish a mapping for characters that have symmetric counterparts.
    // Using a Map provides an efficient lookup and is more explicit than a switch statement
    // for defining static character transformations.
    const SYMMETRY_TRANSFORMATIONS = new Map([
        ['b', 'd'],
        ['d', 'b'],
        ['p', 'q'],
        ['q', 'p']
    ]);

    // Helper function to retrieve the symmetric character for a given input character.
    // If no symmetric character is defined in the map, it will return 'undefined',
    // mirroring the behavior of the original 'switch' statement without a 'default' case.
    const obtainSymmetricCharacter = (sourceChar) => {
        return SYMMETRY_TRANSFORMATIONS.get(sourceChar);
    };

    // Convert the raw input string into an array of characters for easier manipulation.
    const characterSequence = Array.from(rawData);
    const currentSequenceLength = characterSequence.length;

    // Implement early exit conditions for invalid input scenarios.

    // Guard clause: An empty input sequence cannot form a symmetric pair.
    if (currentSequenceLength === 0) {
        console.log(NEGATIVE_OUTCOME_MESSAGE);
        return; // Terminate execution early.
    }

    // Guard clause: A sequence must have an even number of characters to be split into
    // two equal halves for symmetry comparison. Using a bitwise AND for parity check.
    if ((currentSequenceLength & 1) === 1) { // Equivalent to: currentSequenceLength % 2 !== 0
        console.log(NEGATIVE_OUTCOME_MESSAGE);
        return; // Terminate execution early.
    }

    // Determine the exact midpoint of the character sequence.
    // This will be an integer as we've already validated for even length.
    const divisionPoint = currentSequenceLength / 2;

    // Extract the first half of the characters from the sequence.
    const firstHalfSegment = characterSequence.slice(0, divisionPoint);
    // Convert the first half back into a string for direct comparison later.
    const firstHalfAsString = firstHalfSegment.join('');

    // Extract the second half of the characters from the sequence.
    // The 'slice' method automatically goes to the end if the second argument is omitted.
    const secondHalfSegment = characterSequence.slice(divisionPoint);

    // Process the second half of the segment through a series of transformations:
    // 1. Create a shallow copy and reverse its order. This is done to avoid modifying
    //    the original 'secondHalfSegment' array in place, promoting immutability.
    const reversedSecondHalf = [...secondHalfSegment].reverse();

    // 2. Apply the 'obtainSymmetricCharacter' transformation to each character
    //    in the reversed second half. This generates an array of transformed characters.
    const transformedReversedChars = reversedSecondHalf.map(obtainSymmetricCharacter);

    // 3. Join the transformed characters back into a single string.
    //    Note: 'undefined' values (for non-mirrored characters) are converted to
    //    empty strings by 'Array.prototype.join()', preserving the original logic.
    const processedSecondHalfAsString = transformedReversedChars.join('');

    // Perform the final comparison between the first half and the processed second half.
    const isSymmetryConfirmed = (firstHalfAsString === processedSecondHalfAsString);

    // Output the result based on the comparison.
    if (isSymmetryConfirmed) {
        console.log(POSITIVE_OUTCOME_MESSAGE);
    } else {
        console.log(NEGATIVE_OUTCOME_MESSAGE);
    }
}

// This section handles the program's entry point, reading input from standard input.
// It includes basic error handling for robustness.
try {
    // Read the entire content of standard input as a UTF-8 string.
    const stdInputData = require("fs").readFileSync("/dev/stdin", "utf8");
    // Pass the cleaned input (trimmed of leading/trailing whitespace, like newlines)
    // to the main processing function.
    processInputString(stdInputData.trim());
} catch (ioError) {
    // If an error occurs during file reading or other I/O operations,
    // log the error and provide a fallback or error message to the user.
    console.error("Error encountered while reading input:", ioError.message);
    // Optionally, handle the error by processing an empty string or exiting.
    // For this clone, we'll process an empty string, which will result in "No".
    processInputString("");
}