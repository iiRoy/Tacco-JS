function SolverModule(rawInputData) {
    // Extensive comments for clarity and Type II changes
    // This function processes the raw input to count specific character triplet combinations.

    // 1. Input Parsing and Initial Validation (Type III addition)
    // Trim whitespace and split the input into individual lines.
    const inputLines = rawInputData.trim().split('\n');

    // Ensure there are at least two lines: one for N and one for the character sequence.
    if (inputLines.length < 2) {
        console.error("Error: Insufficient input provided. Expected at least two lines.");
        return; // Exit if input is malformed
    }

    // Parse the maximum index value (N) from the first line.
    // Use `parseInt` with radix 10 for safety.
    const maxSequenceIndex = parseInt(inputLines[0], 10);

    // Extract the target character sequence from the second line.
    const targetStringSeq = inputLines[1];

    // Additional validation for N and the sequence length (Type III addition)
    if (isNaN(maxSequenceIndex) || maxSequenceIndex < 1) {
        console.error("Error: Invalid or non-positive maximum sequence index (N).");
        return;
    }
    if (targetStringSeq.length !== maxSequenceIndex) {
        // The problem implies the string length matches N.
        // This is a robust check in case of malformed input.
        console.warn("Warning: Target sequence length does not match specified N. Proceeding with min(N, length).");
        // For robustness, adjust N if the string is shorter, or use the string's length.
        // Let's stick to the original problem's interpretation where N defines the upper bound for indices
        // and assume the string is at least N characters long, or its actual length is the effective N.
        // We'll use the string's length as the effective upper bound for 0-indexed positions.
    }

    const effectiveMaxIndex = Math.min(maxSequenceIndex, targetStringSeq.length);

    // 2. Helper Functions (Type III additions/updates)

    // Function to determine if three given characters are all distinct from each other.
    // Renamed from 'check' to 'areAllUnique' and parameters renamed.
    const areAllUnique = (charX, charY, charZ) => {
        return charX !== charY && charY !== charZ && charX !== charZ;
    };

    // Function to check if three indices do NOT form an arithmetic progression.
    // This extracts the logic `(second - first !== third - second)` into a dedicated helper.
    const isNotArithmeticProgression = (idxA, idxB, idxC) => {
        // The difference between the first two indices must not equal the difference between the last two.
        return (idxB - idxA) !== (idxC - idxB);
    };

    // 3. Main Logic: Iterate and Count Valid Triplets (Type II & III changes)

    // Initialize a counter for the valid combinations found.
    let validTriplesCount = 0;

    // Use nested `for` loops instead of `forEach` for more explicit control over indices.
    // The original problem used 1-based indices (first, second, third).
    // Here, we use 0-based indices (posA, posB, posC) directly for string access,
    // which is functionally equivalent for difference calculations and comparison `posA < posB < posC`.
    for (let posA = 0; posA < effectiveMaxIndex; posA++) {
        for (let posB = posA + 1; posB < effectiveMaxIndex; posB++) {
            for (let posC = posB + 1; posC < effectiveMaxIndex; posC++) {

                // Retrieve the characters at the current 0-based positions.
                const charAtPosA = targetStringSeq[posA];
                const charAtPosB = targetStringSeq[posB];
                const charAtPosC = targetStringSeq[posC];

                // Apply the two conditions for a valid triplet.
                // Condition 1: All three characters must be distinct.
                const charactersAreDistinct = areAllUnique(charAtPosA, charAtPosB, charAtPosC);

                // Condition 2: The indices must not form an arithmetic progression.
                const indicesAreNotAP = isNotArithmeticProgression(posA, posB, posC);

                // If both conditions are met, increment the counter.
                if (charactersAreDistinct && indicesAreNotAP) {
                    validTriplesCount++;
                    // The original `console.log(first, second, third)` debugging output is removed (Type III deletion).
                }
            }
        }
    }

    // 4. Output the Result
    // Display the final count of valid triplets to the console.
    console.log(validTriplesCount);
}

// Standard boilerplate for reading input from stdin in competitive programming environments.
// This part remains largely unchanged as it's an external dependency.
SolverModule(require("fs").readFileSync("/dev/stdin", "utf8"));