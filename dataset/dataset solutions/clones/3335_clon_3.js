(function processGameScores(rawDataString) {
    // This function calculates the maximum score difference achievable in a game
    // where players take turns picking numbers from either end of a sequence.

    // --- Input Processing and Initial Validation ---
    // Ensure the raw input is a non-empty string.
    if (typeof rawDataString !== 'string' || rawDataString.trim().length === 0) {
        console.error("Input Error: Provided data is empty or not a valid string.");
        return;
    }

    // Parse the input string into an array of numbers.
    // Trim whitespace, split by any sequence of whitespace characters,
    // then convert each resulting string segment into a number.
    const numericValues = rawDataString
        .trim()
        .split(/\s+/)
        .map(segment => {
            const parsedNumber = Number(segment);
            // Validate that each segment successfully converts to a number.
            if (isNaN(parsedNumber)) {
                throw new Error(`Input Parsing Error: Found non-numeric value '${segment}' in the sequence.`);
            }
            return parsedNumber;
        });

    // Check if any numbers were successfully parsed.
    if (numericValues.length === 0) {
        console.error("Input Error: No valid numeric data found after parsing.");
        return;
    }

    // The first number in the input indicates the total count of items in the game sequence.
    const totalSequenceLength = numericValues.shift();

    // Handle the edge case where the sequence length is explicitly zero.
    if (totalSequenceLength === 0) {
        console.log("Maximum achievable score difference: 0");
        return;
    }

    // Further validation for the total sequence length.
    if (totalSequenceLength < 0 || totalSequenceLength !== numericValues.length) {
        console.error(
            `Input Error: Declared sequence length (${totalSequenceLength}) does not match ` +
            `the actual number of elements provided (${numericValues.length}). ` +
            `Ensure the declared length is positive and correct.`
        );
        return;
    }

    // The remaining numbers form the actual sequence for the game.
    const gameNumberSequence = numericValues;

    // --- Dynamic Programming Table Initialization ---
    // Create a 2D array (DP table) to store the maximum score differences.
    // `scoreDifferences[length][startIndex]` will hold the optimal score difference
    // for a sub-sequence of `length` items, starting at `startIndex`.
    // The table is initialized with zeros.
    // `length` ranges from 0 to `totalSequenceLength`.
    // `startIndex` ranges from 0 to `totalSequenceLength - length`.
    const scoreDifferencesTable = Array.from({ length: totalSequenceLength + 1 }, (_, currentLen) =>
        Array.from({ length: totalSequenceLength - currentLen + 1 }, () => 0)
    );

    // --- DP Calculation: Filling the Table ---
    // The DP table is filled iteratively, starting with smaller sub-sequences.
    // `currentLen` represents the length of the sub-sequence being considered.
    for (let currentLen = 1; currentLen <= totalSequenceLength; ++currentLen) {
        // `startPos` represents the starting index of the sub-sequence.
        // For a given `currentLen`, `startPos` can range from 0 up to
        // `totalSequenceLength - currentLen` (inclusive).
        for (let startPos = 0; startPos <= totalSequenceLength - currentLen; ++startPos) {

            // Calculate the index of the last element in the current sub-sequence.
            const endPos = startPos + currentLen - 1;

            // Option A: Current player picks the element from the beginning of the sub-sequence.
            // The value picked is `gameNumberSequence[startPos]`.
            // The remaining game is played on a sub-sequence of length `currentLen - 1`,
            // starting at `startPos + 1`. The opponent will play optimally on this remaining part.
            const pickedValueFromFront = gameNumberSequence[startPos];
            const opponentOptimalDiffIfFrontPicked = scoreDifferencesTable[currentLen - 1][startPos + 1];
            const scoreIfFrontOptionChosen = pickedValueFromFront - opponentOptimalDiffIfFrontPicked;

            // Option B: Current player picks the element from the end of the sub-sequence.
            // The value picked is `gameNumberSequence[endPos]`.
            // The remaining game is played on a sub-sequence of length `currentLen - 1`,
            // starting at `startPos`. The opponent will play optimally on this remaining part.
            const pickedValueFromBack = gameNumberSequence[endPos];
            const opponentOptimalDiffIfBackPicked = scoreDifferencesTable[currentLen - 1][startPos];
            const scoreIfBackOptionChosen = pickedValueFromBack - opponentOptimalDiffIfBackPicked;

            // The current player chooses the option that yields the maximum score difference.
            scoreDifferencesTable[currentLen][startPos] = Math.max(scoreIfFrontOptionChosen, scoreIfBackOptionChosen);
        }
    }

    // --- Final Result Extraction and Output ---
    // The maximum score difference for the entire original sequence
    // is stored at `scoreDifferencesTable[totalSequenceLength][0]`.
    const finalOptimalScoreDifference = scoreDifferencesTable[totalSequenceLength][0];

    console.log(`Maximum achievable score difference: ${finalOptimalScoreDifference}`);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));