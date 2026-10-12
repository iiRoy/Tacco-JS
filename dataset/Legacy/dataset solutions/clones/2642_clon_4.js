console.log((inputData => {
    const [sourceSequence, targetSequence] = inputData.trim().split('\n');
    const sourceLength = sourceSequence.length;
    const targetLength = targetSequence.length;

    // Build a map of characters to their sorted indices in the source sequence.
    // This allows for efficient lookup of character positions.
    const characterPositionsMap = {};
    for (let currentIdx = 0; currentIdx < sourceLength; currentIdx++) {
        const char = sourceSequence[currentIdx];
        if (!characterPositionsMap[char]) {
            characterPositionsMap[char] = [];
        }
        characterPositionsMap[char].push(currentIdx);
    }

    let lastMatchedPosition = -1; // Tracks the last index matched in the source sequence, -1 implies before the start.
    let fullSequenceRotations = 0; // Counts how many times we've "wrapped around" the source sequence.

    // Utility function to find the smallest index in a sorted array that is greater than a given reference index.
    // This uses a binary search approach.
    const findNextAvailableIndex = (sortedIndices, referencePoint) => {
        let lowerBound = 0;
        let upperBound = sortedIndices.length - 1;
        let bestFoundIndex = -1; // Stores the smallest index found that is greater than referencePoint

        while (lowerBound <= upperBound) {
            const midPoint = Math.floor((lowerBound + upperBound) / 2);
            if (sortedIndices[midPoint] > referencePoint) {
                bestFoundIndex = sortedIndices[midPoint];
                upperBound = midPoint - 1; // Try to find an even smaller index in the left half
            } else {
                lowerBound = midPoint + 1; // Look in the right half
            }
        }
        return bestFoundIndex;
    };

    // Iterate through each character of the target sequence.
    for (let targetIdx = 0; targetIdx < targetLength; targetIdx++) {
        const requiredChar = targetSequence[targetIdx];
        const possibleIndices = characterPositionsMap[requiredChar];

        // If the required character is not present in the source sequence at all, it's impossible.
        if (!possibleIndices) {
            return '-1';
        }

        // Attempt to find the next occurrence of requiredChar after the lastMatchedPosition
        let nextMatchCandidate = findNextAvailableIndex(possibleIndices, lastMatchedPosition);

        if (nextMatchCandidate !== -1) {
            // A match was found within the current "rotation" of the source sequence.
            lastMatchedPosition = nextMatchCandidate;
        } else {
            // No match found after lastMatchedPosition in the current "rotation".
            // This means we need to complete a full rotation of the source sequence.
            fullSequenceRotations++;
            // The next match will be the first occurrence of requiredChar in the source sequence.
            lastMatchedPosition = possibleIndices[0];
        }
    }

    // Calculate the final effective 1-based position in the infinitely repeating source sequence.
    return `${fullSequenceRotations * sourceLength + lastMatchedPosition + 1}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
