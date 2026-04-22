// This module processes input data to identify specific numeric subsequences.
// The core functionality involves searching for the digits of numbers from 0 to 999
// as a subsequence within a given sequence of digits.
function processInputData(rawData) {
    // Split the incoming raw data string into an array of lines.
    // The first line typically contains metadata, the second contains the sequence.
    const inputLines = rawData.split('\n');

    // --- Input Validation and Pre-processing ---

    // Ensure there are enough lines in the input to proceed.
    if (inputLines.length < 2) {
        console.error("Data processing halted: Insufficient input lines detected. Expected at least 2 lines.");
        return;
    }

    // Extract the length of the target sequence from the first line.
    // 'targetSequenceLength' corresponds to the original 'n'.
    const targetSequenceLength = Number(inputLines[0]);

    // Validate the parsed length. It must be a non-negative number.
    if (isNaN(targetSequenceLength) || targetSequenceLength < 0) {
        console.error(`Data processing halted: Invalid sequence length '${inputLines[0]}' provided.`);
        return;
    }

    // If the target sequence has no elements, no subsequences can be found.
    if (targetSequenceLength === 0) {
        console.log(0); // Output 0 matches.
        return;
    }

    // Extract the raw string of digits from the second input line.
    const rawDigitString = inputLines[1];

    // Initialize an array to store the numerical digits of the search sequence.
    // 'sourceDigitsArray' corresponds to the original 'retu'.
    const sourceDigitsArray = new Array(targetSequenceLength);

    // Populate the 'sourceDigitsArray' by converting each character of the raw string to a number.
    for (let digitPosition = 0; digitPosition < targetSequenceLength; digitPosition++) {
        sourceDigitsArray[digitPosition] = Number(rawDigitString.charAt(digitPosition));
    }

    // --- Main Subsequence Search Logic ---

    // This counter will store the total number of times a candidate number's digits
    // are found as a subsequence in 'sourceDigitsArray'.
    // 'subsequenceMatchCounter' corresponds to the original 'count'.
    let subsequenceMatchCounter = 0;

    // Define the upper limit for candidate numbers (0 to 999, inclusive).
    const MAX_CANDIDATE_VALUE = 999;

    // Iterate through each candidate number from 0 up to MAX_CANDIDATE_VALUE.
    // 'currentCandidateNumber' corresponds to the original 'i'.
    for (let currentCandidateNumber = 0; currentCandidateNumber <= MAX_CANDIDATE_VALUE; currentCandidateNumber++) {
        // Convert the current candidate number into its string representation.
        // 'candidateNumberAsString' corresponds to the original 'str'.
        const candidateNumberAsString = String(currentCandidateNumber);

        // Create an array containing the first three characters of the candidate number string.
        // This accurately replicates the original 'charAt' behavior where out-of-bounds
        // access returns an empty string (''), which is crucial for numbers < 100.
        // 'patternCharacters' corresponds to the original 'stri'.
        const patternCharacters = [
            candidateNumberAsString.charAt(0), // First digit/char
            candidateNumberAsString.charAt(1), // Second digit/char (or '')
            candidateNumberAsString.charAt(2)  // Third digit/char (or '')
        ];

        // This index tracks the current character we are trying to match from 'patternCharacters'.
        // '0' means we're looking for patternCharacters[0], '1' for patternCharacters[1], etc.
        // If it reaches '3', it means all three pattern characters have been found.
        // 'currentPatternMatchIndex' corresponds to the original 'frg'.
        let currentPatternMatchIndex = 0;

        // Iterate through the 'sourceDigitsArray' to find the subsequence.
        // 'sequenceTraversalIndex' corresponds to the original 'j'.
        for (let sequenceTraversalIndex = 0; sequenceTraversalIndex < targetSequenceLength; sequenceTraversalIndex++) {
            // Check if we still need to find more characters for our three-digit pattern.
            // This is functionally equivalent to the original 'frg != 3'.
            if (currentPatternMatchIndex < 3) {
                // Fetch the current digit from the source sequence.
                const currentSourceDigit = sourceDigitsArray[sequenceTraversalIndex];

                // Fetch the character we are currently attempting to match from our pattern.
                const requiredPatternChar = patternCharacters[currentPatternMatchIndex];

                // Perform a loose equality comparison. JavaScript's '==' operator will
                // convert the number (currentSourceDigit) to a string for comparison
                // with 'requiredPatternChar', replicating the original behavior.
                if (requiredPatternChar == currentSourceDigit) {
                    currentPatternMatchIndex++; // Move to the next character in the pattern.
                }
            } else {
                // Optimization: If all three pattern characters have already been found,
                // there's no need to continue traversing the rest of the source sequence
                // for this specific candidate number.
                break;
            }
        }

        // If 'currentPatternMatchIndex' reached 3, it means all three characters
        // of the candidate number's string representation were found as a subsequence.
        if (currentPatternMatchIndex === 3) {
            subsequenceMatchCounter++; // Increment the total match count.
            // Optional: console.log(`Debug: Found subsequence for candidate: ${candidateNumberAsString}`);
        }
    }

    // Output the final tally of numbers whose digits form a subsequence.
    console.log(subsequenceMatchCounter);
}

// --- Standard Input Handling ---
// This section reads input from the standard input stream, typically used in
// competitive programming environments.

const fileSystemModule = require("fs"); // Import the Node.js file system module.
const standardInputPath = "/dev/stdin"; // Define the path for standard input.

// Read the entire content of the standard input file synchronously.
// The content is expected to be UTF-8 encoded.
const rawInputContent = fileSystemModule.readFileSync(standardInputPath, "utf8");

// Call the main processing function with the raw input content.
processInputData(rawInputContent);