// This module processes a multi-line string input to determine a minimal difference score
// between three character sequences based on pairwise mismatches.
function computeMinimumDifferences(rawInputString) {
    // Break down the raw input string into individual lines for parsing.
    const inputLines = rawInputString.split('\n');

    // Basic validation: ensure we have at least 4 lines (N, S1, S2, S3)
    if (inputLines.length < 4) {
        // Log an error or handle invalid input gracefully. For this problem,
        // we'll assume valid input structure but a real-world scenario might throw.
        console.error("Insufficient input lines provided. Expected at least 4.");
        return; // Or throw an error to halt execution
    }

    // Parse the length of the sequences from the first line.
    const sequenceLength = Number.parseInt(inputLines[0].trim(), 10);

    // Validate the parsed sequence length. It must be a positive integer.
    if (isNaN(sequenceLength) || sequenceLength <= 0) {
        console.error("Invalid or non-positive sequence length detected.");
        return;
    }

    // Extract and split the three character sequences into arrays.
    const primarySequenceChars = inputLines[1].split('');
    const secondarySequenceChars = inputLines[2].split('');
    const tertiarySequenceChars = inputLines[3].split('');

    // Pre-check: Ensure all sequences have the expected length.
    // This is a robustness check; the problem statement usually implies consistency.
    if (primarySequenceChars.length !== sequenceLength ||
        secondarySequenceChars.length !== sequenceLength ||
        tertiarySequenceChars.length !== sequenceLength) {
        console.warn("One or more sequence lengths do not match the declared N. Proceeding with actual lengths, which might lead to unexpected behavior if not handled.");
        // For strict adherence, one might truncate or throw, but here we proceed.
    }

    // Initialize counters for pairwise character mismatches.
    let mismatchCount12 = 0; // Mismatches between primary and secondary sequences
    let mismatchCount13 = 0; // Mismatches between primary and tertiary sequences
    let mismatchCount23 = 0; // Mismatches between secondary and tertiary sequences

    // Iterate through each character position to tally the mismatches.
    // Using a modern for-loop with 'let' for the index and prefix increment.
    for (let currentPos = 0; currentPos < sequenceLength; ++currentPos) {
        // Retrieve characters at the current position for cleaner comparison.
        // This avoids repeated array lookups within the conditional statements.
        const charP = primarySequenceChars[currentPos];
        const charS = secondarySequenceChars[currentPos];
        const charT = tertiarySequenceChars[currentPos];

        // Check for differences between the first and second sequences.
        if (charP !== charS) {
            mismatchCount12++;
        }

        // Check for differences between the first and third sequences.
        if (charP !== charT) {
            mismatchCount13++;
        }

        // Check for differences between the second and third sequences.
        if (charS !== charT) {
            mismatchCount23++;
        }
    }

    // Calculate the total "cost" or "score" if each sequence were chosen as the reference point.
    // The score for a sequence is the sum of its mismatches with the other two sequences.
    const scoreIfPrimaryIsRef = mismatchCount12 + mismatchCount13;
    const scoreIfSecondaryIsRef = mismatchCount12 + mismatchCount23; // Mismatch (S1,S2) is symmetric to (S2,S1)
    const scoreIfTertiaryIsRef = mismatchCount13 + mismatchCount23;   // Mismatch (S1,S3) is symmetric to (S3,S1)

    // Store the calculated scores in an array for convenient minimum finding using spread syntax.
    const allCalculatedScores = [
        scoreIfPrimaryIsRef,
        scoreIfSecondaryIsRef,
        scoreIfTertiaryIsRef
    ];

    // Determine the smallest score among the three possibilities.
    const overallMinimumScore = Math.min(...allCalculatedScores);

    // Output the final result to the console.
    // Using a template literal for cleaner and more descriptive string formatting.
    console.log(`The minimal transformation score is: ${overallMinimumScore}`);
}

// This section handles standard input/output operations for execution environments like AtCoder.
// It reads all data from standard input and passes it to our main processing function.
// This part is typically environment-specific and should not be modified for the core logic of the problem.
computeMinimumDifferences(require("fs").readFileSync("/dev/stdin", "utf8"));