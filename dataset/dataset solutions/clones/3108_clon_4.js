const solve = (inputData) => {
    const sequenceLengthTarget = Number(inputData);
    const moduloConstant = 1000000007;

    const characterToIndexMap = { 'A': 0, 'C': 1, 'G': 2, 'T': 3 };
    const indexToCharacterMap = ['A', 'C', 'G', 'T'];
    const placeholderIndex = 4; // Represents a character that doesn't exist yet (for sequences shorter than 3 characters)

    // dpTable[currentLength][lastCharIdx][secondLastCharIdx][thirdLastCharIdx]
    // Indices 0-3 for A, C, G, T. Index 4 for placeholderIndex.
    const dpTable = Array(sequenceLengthTarget + 1).fill(0).map(() =>
        Array(5).fill(0).map(() =>
            Array(5).fill(0).map(() =>
                Array(5).fill(0)
            )
        )
    );

    // Base case: An empty string (length 0) is one valid sequence.
    // Represented by all placeholderIndex for the last three characters.
    dpTable[0][placeholderIndex][placeholderIndex][placeholderIndex] = 1;

    for (let currentLen = 0; currentLen < sequenceLengthTarget; currentLen++) { // Iterate for sequence length currentLen
        for (let thirdLast = 0; thirdLast <= placeholderIndex; thirdLast++) { // third_last_char_idx
            for (let secondLast = 0; secondLast <= placeholderIndex; secondLast++) { // second_last_char_idx
                for (let last = 0; last <= placeholderIndex; last++) { // last_char_idx
                    if (dpTable[currentLen][last][secondLast][thirdLast] === 0) {
                        continue; // No sequences of length currentLen end in this state
                    }

                    for (let nextCharIdx = 0; nextCharIdx < 4; nextCharIdx++) { // Try appending each character
                        let isTransitionPermitted = true;

                        // The new sequence ends with (thirdLast, secondLast, last, nextCharIdx)
                        // The last 3 chars are (secondLast, last, nextCharIdx)
                        // The last 4 chars are (thirdLast, secondLast, last, nextCharIdx)

                        // Check for 'AGC' permutations in the last 3 characters (secondLast, last, nextCharIdx)
                        // This corresponds to original `next3` checks
                        if (secondLast !== placeholderIndex && last !== placeholderIndex) {
                            if ((secondLast === characterToIndexMap['A'] && last === characterToIndexMap['G'] && nextCharIdx === characterToIndexMap['C']) || // AGC
                                (secondLast === characterToIndexMap['A'] && last === characterToIndexMap['C'] && nextCharIdx === characterToIndexMap['G']) || // ACG
                                (secondLast === characterToIndexMap['G'] && last === characterToIndexMap['A'] && nextCharIdx === characterToIndexMap['C'])) { // GAC
                                isTransitionPermitted = false;
                            }
                        }

                        // Check for 'AGC' patterns involving the 4th character (thirdLast, secondLast, last, nextCharIdx)
                        // This corresponds to original `next4` checks
                        if (thirdLast !== placeholderIndex && secondLast !== placeholderIndex && last !== placeholderIndex) {
                            if ((thirdLast === characterToIndexMap['A'] && last === characterToIndexMap['G'] && nextCharIdx === characterToIndexMap['C']) || // A_GC (thirdLast, last, nextCharIdx)
                                (thirdLast === characterToIndexMap['A'] && secondLast === characterToIndexMap['G'] && nextCharIdx === characterToIndexMap['C'])) { // AG_C (thirdLast, secondLast, nextCharIdx)
                                isTransitionPermitted = false;
                            }
                        }

                        if (isTransitionPermitted) {
                            // Update the DP table for length currentLen+1
                            // The new state's last three characters are (nextCharIdx, last, secondLast)
                            // (new_last, new_second_last, new_third_last)
                            const newLastCharIdx = nextCharIdx;
                            const newSecondLastCharIdx = last;
                            const newThirdLastCharIdx = secondLast;

                            dpTable[currentLen + 1][newLastCharIdx][newSecondLastCharIdx][newThirdLastCharIdx] =
                                (dpTable[currentLen + 1][newLastCharIdx][newSecondLastCharIdx][newThirdLastCharIdx] + dpTable[currentLen][last][secondLast][thirdLast]) % moduloConstant;
                        }
                    }
                }
            }
        }
    }

    let totalValidSequences = 0;
    for (let thirdLast = 0; thirdLast <= placeholderIndex; thirdLast++) {
        for (let secondLast = 0; secondLast <= placeholderIndex; secondLast++) {
            for (let last = 0; last <= placeholderIndex; last++) {
                totalValidSequences = (totalValidSequences + dpTable[sequenceLengthTarget][last][secondLast][thirdLast]) % moduloConstant;
            }
        }
    }

    return totalValidSequences;
};

const processInputAndOutput = (inputContent) => {
    console.log(solve(inputContent));
};

processInputAndOutput(require('fs').readFileSync('/dev/stdin', 'UTF-8'));
