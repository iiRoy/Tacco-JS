function processInputData(rawInputString) {
    const parsedLines = rawInputString.split("\n");
    const initialElementCount = Number(parsedLines[0]); // N is read but not used in the core logic
    let currentNumberSequence = parsedLines[1].split(" ").map(numberString => Number(numberString));

    /**
     * Determines the index of the element to be merged in the current sequence.
     * This function encapsulates the complex logic for selecting the merge candidate.
     * @param {number[]} sequence The array of numbers for the current iteration.
     * @returns {number} The index of the element chosen for merging.
     */
    function determineMergeCandidateIndex(sequence) {
        let candidateMergeIndex = -1;

        // Find the initial minimum value and its index, with a specific tie-breaking rule.
        // The loop iterates from the second element to the second-to-last element.
        for (let loopIndex = 1; loopIndex < sequence.length - 1; loopIndex++) {
            // If candidateMergeIndex is not set, or current element is smaller than current minimum
            if (candidateMergeIndex === -1 || sequence[candidateMergeIndex] > sequence[loopIndex]) {
                candidateMergeIndex = loopIndex;
            }
            // Specific tie-breaking: if the index of the current minimum happens to equal the value
            // of the element being considered, and its neighbors sum to less, update the index.
            // This condition (candidateMergeIndex == sequence[loopIndex]) is unusual but preserved.
            if (candidateMergeIndex === sequence[loopIndex] &&
                sequence[loopIndex - 1] + sequence[loopIndex + 1] < sequence[candidateMergeIndex - 1] + sequence[candidateMergeIndex + 1]) {
                candidateMergeIndex = loopIndex;
            }
        }

        // Apply special adjustments to the candidateMergeIndex based on values at specific positions.
        const secondElementValue = sequence[1];
        const secondToLastElementValue = sequence[sequence.length - 2];
        const currentMinValue = sequence[candidateMergeIndex];

        if (currentMinValue * 2 > secondElementValue) {
            candidateMergeIndex = 1; // Prioritize the second element
            if (sequence[candidateMergeIndex] > secondToLastElementValue) {
                candidateMergeIndex = sequence.length - 2; // Further prioritize second-to-last if second is larger
            }
        } else if (currentMinValue * 2 > secondToLastElementValue) {
            candidateMergeIndex = sequence.length - 2; // Prioritize second-to-last
        }

        return candidateMergeIndex;
    }

    /**
     * Applies the merge operation to the sequence based on the given merge index.
     * The element at mergeIdx is added to its left and right neighbors, and then removed.
     * @param {number[]} sequence The original array of numbers.
     * @param {number} mergeIdx The index of the element to be merged.
     * @returns {number[]} The new array after the merge operation.
     */
    function applyMergeOperation(sequence, mergeIdx) {
        const nextSequence = [];
        const valueToMerge = sequence[mergeIdx];

        for (let loopIndex = 0; loopIndex < sequence.length; loopIndex++) {
            if (loopIndex === mergeIdx - 1) {
                // Merge with the left neighbor
                nextSequence.push(sequence[mergeIdx - 1] + valueToMerge);
            } else if (loopIndex === mergeIdx) {
                // Skip the element at mergeIdx as it's merged into its neighbors
                continue;
            } else if (loopIndex === mergeIdx + 1) {
                // Merge with the right neighbor
                nextSequence.push(sequence[mergeIdx + 1] + valueToMerge);
            } else {
                // Keep other elements as they are
                nextSequence.push(sequence[loopIndex]);
            }
        }
        return nextSequence;
    }

    // Main loop for the merging process
    while (currentNumberSequence.length > 2) {
        const mergeTargetIndex = determineMergeCandidateIndex(currentNumberSequence);
        currentNumberSequence = applyMergeOperation(currentNumberSequence, mergeTargetIndex);
    }

    // After the loop, only two elements remain. Print their sum.
    console.log(currentNumberSequence[0] + currentNumberSequence[1]);
}

// This line and below are for standard input/output handling and should not be modified.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
