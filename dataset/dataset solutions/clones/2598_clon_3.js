// This module provides a core function to analyze patterns within numerical input sequences.
// Specifically, it identifies the longest run of consecutive elements that are non-increasing
// when traversed from right to left.
function ProcessInputSequence(rawInputTextData) {

    // --- Data Integrity Checks and Initial Processing ---
    // Ensure the provided input is a string and not empty or just whitespace.
    if (typeof rawInputTextData !== 'string' || rawInputTextData.trim().length === 0) {
        // In case of invalid input, a run of 0 is the logical result as no sequence exists.
        return 0;
    }

    // Split the entire input block into distinct lines.
    const textLines = rawInputTextData.split('\n');

    // A minimum of two lines is expected: one for count (though we'll calculate it) and one for numbers.
    if (textLines.length < 2) {
        return 0; // Insufficient data to form a sequence.
    }

    // The first line often contains a declared count of elements.
    // We parse it, but primarily rely on the actual array length for robustness.
    const initialElementCount = parseInt(textLines[0], 10);
    // It's good practice to validate this, but for this problem, we'll proceed
    // with actual parsed data length even if this count is off.
    if (isNaN(initialElementCount) || initialElementCount < 0) {
        // Optionally log a warning or adjust behavior, but we'll continue.
    }

    // Extract the second line, which holds the space-separated numerical values.
    const numericStrings = textLines[1].split(' ');

    // Convert string representations to actual numbers.
    // The filter step ensures that only valid numbers are processed, discarding empty strings or non-numeric tokens.
    const numericalArray = numericStrings
        .map(str => Number(str.trim())) // Convert each string part to a number.
        .filter(num => !isNaN(num));    // Remove any results that are Not-a-Number.

    const currentSequenceSize = numericalArray.length;

    // If the sequence has fewer than two elements, no adjacent comparison is possible.
    // Therefore, no non-increasing run can be detected.
    if (currentSequenceSize < 2) {
        return 0;
    }

    // --- Core Logic: Identify the Longest Non-Increasing Subsequence ---

    // This variable will store the maximum length of a non-increasing run found so far.
    let maximumDecreasingRun = 0;
    // This variable tracks the length of the *current* non-increasing run.
    let temporaryRunCounter = 0;

    // Iterate through the numerical array from the second-to-last element down to the first.
    // This structure allows comparing an element at index 'j' with its preceding element 'j-1'.
    // The loop condition 'j > 0' ensures that 'j-1' is always a valid, non-negative index.
    for (let j = currentSequenceSize - 1; j > 0; j--) {
        const itemAtCurrentIndex = numericalArray[j];
        const itemAtPreviousIndex = numericalArray[j - 1];

        // If the current element is less than or equal to the previous element,
        // it signifies a continuation (or start) of a non-increasing sequence.
        if (itemAtCurrentIndex <= itemAtPreviousIndex) {
            temporaryRunCounter++; // Increment the length of the current run.
            // If the current run is longer than any previously recorded maximum, update the maximum.
            if (temporaryRunCounter > maximumDecreasingRun) {
                maximumDecreasingRun = temporaryRunCounter;
            }
        } else {
            // If the current element is strictly greater than the previous one,
            // the non-increasing sequence is broken, so reset the counter.
            temporaryRunCounter = 0;
        }
    }

    // Return the final maximum length of consecutive non-increasing elements.
    return maximumDecreasingRun;
}

// DO NOT ALTER THE FOLLOWING LINES! They are part of the execution environment.
const standardInputPayload = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(ProcessInputSequence(standardInputPayload));