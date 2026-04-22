function determineCost(rawData) {
    const processedInput = rawData.trim().split('\n');

    // The first line (length indicator) is not directly used for loop bounds in the original,
    // so we extract the three sequences directly.
    const firstSequence = processedInput[1];
    const secondSequence = processedInput[2];
    const thirdSequence = processedInput[3];

    // If all sequences are already identical, no transformations are needed.
    if (firstSequence === secondSequence && secondSequence === thirdSequence) {
        console.log(0);
        return;
    }

    // Generate an array of indices to facilitate a functional reduction across positions.
    const sequenceLength = firstSequence.length;
    const positionIndices = Array.from({ length: sequenceLength }, (_, idx) => idx);

    // Calculate the total adjustments by iterating through each character position.
    const totalAdjustments = positionIndices.reduce((currentSum, currentPosition) => {
        const charA = firstSequence[currentPosition];
        const charB = secondSequence[currentPosition];
        const charC = thirdSequence[currentPosition];

        // Determine the number of unique characters at the current position using a Set.
        const uniqueCharactersAtPosition = new Set([charA, charB, charC]);
        const numberOfDistinctChars = uniqueCharactersAtPosition.size;

        let adjustmentsForThisPosition = 0;
        if (numberOfDistinctChars === 2) {
            // If two characters are identical and one is different (e.g., 'A', 'A', 'B'),
            // one adjustment is needed to make them all the same.
            adjustmentsForThisPosition = 1;
        } else if (numberOfDistinctChars === 3) {
            // If all three characters are different (e.g., 'A', 'B', 'C'),
            // two adjustments are needed to make them all the same.
            adjustmentsForThisPosition = 2;
        }
        // If numberOfDistinctChars is 1, all characters are already identical, so 0 adjustments.

        return currentSum + adjustmentsForThisPosition;
    }, 0); // Start the sum from zero.

    console.log(totalAdjustments);
}

determineCost(require("fs").readFileSync("/dev/stdin", "utf8"));