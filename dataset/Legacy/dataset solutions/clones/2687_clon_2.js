"use strict";

// This function processes a given input string to calculate a specific distribution
// based on sequences of 'R' and 'L' characters.
const processInputData = (inputContent) => {
    // First, clean up the input: remove leading/trailing whitespace and split by newlines.
    // We assume the relevant character sequence is on the first line.
    inputContent = inputContent.trim().split("\n");
    const characterSequence = inputContent[0].split(""); // Convert the first line into an array of individual characters.

    // Initialize variables to accumulate counts of 'R' and 'L' characters within a segment.
    let rightCharAccumulator = 0;
    let leftCharAccumulator = 0;

    // `transitionBoundary` will store the index of the first character in an 'RL' or 'LR' transition.
    let transitionBoundary;
    // `boundaryTransitionCounter` tracks how many character type changes (R->L or L->R) have occurred
    // within the current processing window.
    let boundaryTransitionCounter = 0;

    // Create an array to hold the final calculated distribution, initialized with zeros.
    // Its length matches the input character sequence.
    let finalResultArray = [...Array(characterSequence.length)].fill(0);

    // Iterate through the character sequence. The loop goes up to `length - 2` because
    // we always look one character ahead (`currentIndex + 1`).
    for (let currentIndex = 0; currentIndex < characterSequence.length - 1; currentIndex++) {
        // Increment the appropriate accumulator based on the character at the current index.
        if (characterSequence[currentIndex] === "R") {
            rightCharAccumulator++;
        }
        if (characterSequence[currentIndex] === "L") {
            leftCharAccumulator++;
        }

        // Check if the current character is different from the next character.
        // This indicates a boundary where the character type changes (e.g., from 'R' to 'L').
        if (characterSequence[currentIndex] !== characterSequence[currentIndex + 1]) {
            boundaryTransitionCounter++; // Increment the counter for detected transitions.

            // If this is the first transition detected in the current segment,
            // record its index as the `transitionBoundary`.
            if (boundaryTransitionCounter === 1) {
                transitionBoundary = currentIndex;
            }
        }

        // If two transitions have been detected (e.g., R...R L...L R...R),
        // it means a complete segment (like R...RL...L) has been identified and processed.
        if (boundaryTransitionCounter === 2) {
            // Calculate the total number of characters in this completed segment.
            const totalSegmentChars = rightCharAccumulator + leftCharAccumulator;

            // Distribute the total characters to the two boundary points based on parity.
            if (totalSegmentChars % 2 === 0) {
                // If the total count is even, distribute equally to both sides of the 'RL' pair.
                finalResultArray[transitionBoundary] = totalSegmentChars / 2;
                finalResultArray[transitionBoundary + 1] = totalSegmentChars / 2;
            } else {
                // If the total count is odd, the distribution depends on which accumulator (R or L)
                // holds the larger count and its parity.
                // The condition `(Math.max(...) - 1) % 2 === 0` is true if the maximum count is odd.
                if ((Math.max(rightCharAccumulator, leftCharAccumulator) - 1) % 2 === 0) {
                    // If the larger count is odd, assign `rightCharAccumulator` to the left boundary
                    // and `leftCharAccumulator` to the right boundary.
                    finalResultArray[transitionBoundary] = rightCharAccumulator;
                    finalResultArray[transitionBoundary + 1] = leftCharAccumulator;
                } else {
                    // If the larger count is even, assign `leftCharAccumulator` to the left boundary
                    // and `rightCharAccumulator` to the right boundary.
                    finalResultArray[transitionBoundary] = leftCharAccumulator;
                    finalResultArray[transitionBoundary + 1] = rightCharAccumulator;
                }
            }

            // Reset the counters for the next segment.
            boundaryTransitionCounter = 0;
            rightCharAccumulator = 0;
            leftCharAccumulator = 0;
        }

        // Special handling for the very last character of the sequence.
        // The main loop processes up to `characterSequence.length - 2`.
        // This block ensures the final 'L' character that completes the last 'RL' pair is counted
        // and its distribution is calculated.
        if (currentIndex === characterSequence.length - 2) {
            leftCharAccumulator++; // The last character is assumed to be 'L' to complete the final 'RL' pair.

            const totalFinalSegmentChars = rightCharAccumulator + leftCharAccumulator;

            // Apply the same distribution logic as above for this final segment.
            if (totalFinalSegmentChars % 2 === 0) {
                finalResultArray[transitionBoundary] = totalFinalSegmentChars / 2;
                finalResultArray[transitionBoundary + 1] = totalFinalSegmentChars / 2;
            } else {
                if ((Math.max(rightCharAccumulator, leftCharAccumulator) - 1) % 2 === 0) {
                    finalResultArray[transitionBoundary] = rightCharAccumulator;
                    finalResultArray[transitionBoundary + 1] = leftCharAccumulator;
                } else {
                    finalResultArray[transitionBoundary] = leftCharAccumulator;
                    finalResultArray[transitionBoundary + 1] = rightCharAccumulator;
                }
            }
        }
    }

    // Output the final calculated distribution array as a space-separated string to the console.
    console.log(finalResultArray.join(" "));
};

// Read the entire content from standard input as a UTF-8 string and pass it to the processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
