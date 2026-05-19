'use strict'; // Enforce strict mode for cleaner code execution.

// This script computes the sum of all possible numerical expressions
// that can be formed by inserting plus signs into a given string of digits.
// Each position between digits can either have a plus sign or be concatenated.

const processInput = (rawData) => {
    // First, remove any leading or trailing whitespace from the input string.
    const trimmedData = rawData.trim();

    // Convert the cleaned input string into an array of individual digit characters.
    const digitChars = trimmedData.split("");

    // Calculate the maximum number of potential "plus" operators.
    // This is always one less than the total count of digits.
    const operatorCount = digitChars.length - 1;

    // Initialize a variable to store the cumulative sum of all evaluated expressions.
    let finalSum = 0;

    // Iterate through all possible binary combinations representing the placement of plus signs.
    // Each bit in 'combinationIndex' corresponds to a potential operator position.
    // A '1' bit signifies a plus sign, while a '0' bit means concatenation.
    for (let combinationIndex = 0; combinationIndex < (1 << operatorCount); combinationIndex++) {
        // For each combination, create an array to hold the current numeric segments.
        // The very first digit always forms the beginning of the initial segment.
        let currentSegments = [digitChars[0]];

        // Loop through the remaining digits to decide whether to append or start a new segment.
        for (let segmentIdx = 0; segmentIdx < operatorCount; segmentIdx++) {
            // Retrieve the next digit character from the input sequence.
            const currentDigit = digitChars[segmentIdx + 1];

            // Check if the bit corresponding to the current segment index is set in the combination.
            // If the bit is set, it implies a plus sign, so a new segment is started.
            if (combinationIndex & (1 << segmentIdx)) {
                currentSegments.push(currentDigit);
            } else {
                // If the bit is not set, concatenate the current digit to the last existing segment.
                currentSegments[currentSegments.length - 1] += currentDigit;
            }
        }

        // After forming all segments for the current combination, sum their integer values.
        // Add this sum to the overall final total.
        finalSum += currentSegments.reduce((accumulator, currentSegment) => accumulator + parseInt(currentSegment, 10), 0);
    }

    // Display the final computed sum to the standard output.
    console.log(finalSum);
};

// Read the input data from standard input (typically /dev/stdin in competitive programming environments)
// and then invoke the processing function with the obtained string.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
