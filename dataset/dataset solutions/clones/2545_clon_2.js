function ProcessInput(inputString) {
    // Split the entire input into individual lines for parsing.
    const allInputLines = inputString.split("\n");
    // Extract the first line and split it by space to get initial parameters.
    const firstLineData = allInputLines[0].split(" ");

    // Determine the total count of elements in the primary sequence.
    let totalElementCount = Number(firstLineData[0]);
    // Establish the length of the sub-array window for processing.
    let windowLength = Number(firstLineData[1]);

    // Parse the second line of input into an array of numerical values.
    const mainNumericSequence = allInputLines[1].split(" ").map(valItem => Number(valItem));

    // Initialize an array to store the string representations of the modified sequences.
    let sequenceOutputStrings = [];

    // Iterate through the main sequence, applying a sliding window operation.
    for (let currentIdx = 0; currentIdx <= totalElementCount - windowLength; ++currentIdx) {
        // Extract the current segment of the sequence based on the window length.
        let temporarySegment = mainNumericSequence.slice(currentIdx, currentIdx + windowLength);
        // Sort this extracted segment using our custom numerical comparison function.
        temporarySegment.sort(numericalValueSorter);

        // Reconstruct the full sequence: elements before the window, the sorted window, and elements after the window.
        // Convert this reconstructed sequence into a comma-separated string and store it.
        sequenceOutputStrings[currentIdx] = mainNumericSequence.slice(0, currentIdx)
                                                               .concat(temporarySegment)
                                                               .concat(mainNumericSequence.slice(currentIdx + windowLength))
                                                               .join(','); // Using join(',') for string conversion, functionally identical to toString() for arrays.
    }

    // Create a Set object from the collected strings to automatically filter out duplicates.
    const distinctSequenceRepresentations = new Set(sequenceOutputStrings);

    // Print the total number of unique sequence representations found.
    console.log(distinctSequenceRepresentations.size);
}

// Read the input from standard input using Node.js 'fs' module and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * A utility function designed for sorting numerical values in ascending order.
 * This function is intended for use with Array.prototype.sort().
 * @param {number} valueA - The first numerical operand for comparison.
 * @param {number} valueB - The second numerical operand for comparison.
 * @returns {number} A negative value if valueA is less than valueB, zero if they are equal, or a positive value if valueA is greater than valueB.
 */
function numericalValueSorter(valueA, valueB) {
    return valueA - valueB; // Standard comparison for ascending numerical sort.
}
