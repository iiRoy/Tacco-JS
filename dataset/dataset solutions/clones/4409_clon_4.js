const MODULUS_VALUE = 1000000007;

function determineArrangementChoices(inputDataString) {
    const parsedLines = inputDataString.trim().split("\n");
    const dimensionCount = parseInt(parsedLines[0]);
    const upperCharRow = parsedLines[1].split("");
    const lowerCharRow = parsedLines[2].split("");

    // dynamicProgrammingTable[position][orientationKey]
    // orientationKey: 0 for horizontal, 1 for vertical.
    // Initialized with null to signify uncomputed states.
    const dynamicProgrammingTable = Array.from(
        { length: dimensionCount + 2 },
        () => Array(2).fill(null)
    );

    // Recursive function to compute arrangement counts for subproblems.
    // currentPosition: The starting column index for the current block.
    // previousBlockOrientationVertical: True if the block immediately preceding currentPosition was vertical, false if horizontal.
    const computeSubproblemResults = (currentPosition, previousBlockOrientationVertical) => {
        // Base cases for recursion:
        // If currentPosition equals dimensionCount, it means all columns up to N-1 have been successfully covered.
        // If currentPosition equals dimensionCount + 1, it means the last block was horizontal and ended exactly at column N.
        // Both are valid completions, representing 1 way to complete the tiling from this point.
        if (currentPosition === dimensionCount || currentPosition === dimensionCount + 1) {
            return 1;
        }
        // If currentPosition exceeds dimensionCount + 1, it means a horizontal block extended too far, an invalid path.
        if (currentPosition > dimensionCount + 1) {
            return 0;
        }

        const orientationKey = previousBlockOrientationVertical ? 1 : 0;
        if (dynamicProgrammingTable[currentPosition][orientationKey] !== null) {
            return dynamicProgrammingTable[currentPosition][orientationKey];
        }

        let accumulatedChoices = 0;
        // Check if characters at the current position match (implies a vertical block is possible here).
        const currentCharsAreIdentical = upperCharRow[currentPosition] === lowerCharRow[currentPosition];

        if (currentPosition === 0) { // Special handling for the very first block
            if (currentCharsAreIdentical) { // First block is vertical (e.g., 'A' over 'A')
                accumulatedChoices = (3 * computeSubproblemResults(currentPosition + 1, true)) % MODULUS_VALUE;
            } else { // First block is horizontal (e.g., 'A' over 'B')
                accumulatedChoices = (6 * computeSubproblemResults(currentPosition + 2, false)) % MODULUS_VALUE;
            }
        } else { // Logic for subsequent blocks, dependent on the previous block's orientation
            if (previousBlockOrientationVertical) { // If the previous block was vertical
                if (currentCharsAreIdentical) { // Current block is vertical (e.g., 'A' over 'A')
                    accumulatedChoices = (2 * computeSubproblemResults(currentPosition + 1, true)) % MODULUS_VALUE;
                } else { // Current block is horizontal (e.g., 'A' over 'B')
                    accumulatedChoices = (2 * computeSubproblemResults(currentPosition + 2, false)) % MODULUS_VALUE;
                }
            } else { // If the previous block was horizontal
                if (currentCharsAreIdentical) { // Current block is vertical (e.g., 'A' over 'A')
                    accumulatedChoices = (1 * computeSubproblemResults(currentPosition + 1, true)) % MODULUS_VALUE;
                } else { // Current block is horizontal (e.g., 'A' over 'B')
                    accumulatedChoices = (3 * computeSubproblemResults(currentPosition + 2, false)) % MODULUS_VALUE;
                }
            }
        }

        dynamicProgrammingTable[currentPosition][orientationKey] = accumulatedChoices;
        return accumulatedChoices;
    };

    // Initial call to the recursive solver.
    // The `previousBlockOrientationVertical` parameter for currentPosition 0 is effectively ignored
    // by the `currentPosition === 0` branch, as it only dictates the state for subsequent calls.
    return computeSubproblemResults(0, true);
}

console.log(determineArrangementChoices(require("fs").readFileSync("/dev/stdin", "utf8").trim()));