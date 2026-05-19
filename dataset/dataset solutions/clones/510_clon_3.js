const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const trimmedContent = fileContent.trim();
let lineSegments = trimmedContent.split("\n");

// Helper function to determine if a given numeric sequence forms an arithmetic progression.
// It takes the sequence to check and the original 'elementCount' (n from input)
// to precisely replicate the loop bounds and NaN comparison behavior of the original code.
const checkArithmeticProgression = (sequenceToCheck, originalElementCount) => {
    // The initial difference calculation might involve undefined values if the sequence
    // has fewer than 2 elements, resulting in NaN. This is crucial for replicating
    // the original code's behavior for small input sizes (e.g., n=1, n=2).
    const initialDifference = sequenceToCheck[1] - sequenceToCheck[0];
    let isProgressionValid = true;

    // The loop condition `k < originalElementCount` is used to match the original code's
    // `j < n` loop. This means `k` iterates from 1 up to `originalElementCount - 1`.
    // If `sequenceToCheck.length` is less than `originalElementCount - 1`, this loop
    // will access `sequenceToCheck[k]` and `sequenceToCheck[k-1]` as `undefined`,
    // leading to `NaN` differences, which are then compared using `!==`.
    for (let k = 1; k < originalElementCount; k++) {
        const currentSegmentDifference = sequenceToCheck[k] - sequenceToCheck[k - 1];
        // Using `!==` correctly handles `NaN` comparisons, where `NaN !== NaN` is true,
        // replicating the `!=` behavior of the original code.
        if (initialDifference !== currentSegmentDifference) {
            isProgressionValid = false;
            break; // No need to check further if a difference mismatch is found
        }
    }
    return isProgressionValid;
};

while (true) {
    const currentLineForCount = lineSegments.shift();
    const elementCount = parseInt(currentLineForCount, 10);

    if (elementCount === 0) {
        break;
    }

    const sequenceDataLine = lineSegments.shift();
    const rawNumberStrings = sequenceDataLine.split(" ");
    const numericSequence = rawNumberStrings.map(valueString => Number(valueString));

    let foundRemovedValue = undefined; // Stores the value of the element that, when removed, forms an AP

    // Iterate through each possible index, including an index equal to elementCount
    // (which effectively means no element is removed, or an 'undefined' element is considered removed).
    for (let exclusionCandidateIndex = 0; exclusionCandidateIndex < elementCount + 1; exclusionCandidateIndex++) {
        // Create a new sequence by filtering out the element at the current exclusionCandidateIndex.
        const filteredSubsequence = numericSequence.filter((elementVal, originalPos) => exclusionCandidateIndex !== originalPos);

        // Check if the filtered subsequence forms an arithmetic progression using the helper function.
        // Pass `elementCount` to the helper to ensure the loop bounds match the original logic.
        if (checkArithmeticProgression(filteredSubsequence, elementCount)) {
            // If an AP is found, store the value of the element that was excluded.
            // If exclusionCandidateIndex is `elementCount`, `numericSequence[elementCount]` will be `undefined`,
            // replicating the original code's behavior of printing `undefined` in such cases.
            foundRemovedValue = numericSequence[exclusionCandidateIndex];
            break; // Found the required element, exit the loop for this test case
        }
    }
    console.log(foundRemovedValue);
}
