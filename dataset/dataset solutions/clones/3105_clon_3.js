function ProcessSequenceData(sequenceDataString) {
    'use strict'; // Enforce strict mode for better code quality and fewer common pitfalls

    // Parse the target sequence length from the input string.
    // The first line of the input is expected to contain the integer length.
    const targetSequenceLengthRaw = sequenceDataString.split("\n")[0];
    const targetSequenceLength = parseInt(targetSequenceLengthRaw, 10); // Specify radix for safety

    // Define the set of allowed DNA nucleotides.
    // These characters are used to build and extend sequences.
    const validNucleotideChars = ["A", "T", "G", "C"];

    // Modulo constant to prevent integer overflow for large counts.
    // All calculations are performed modulo this prime number.
    const MODULO_CONSTANT = 1000000007;

    // A template object used to reset counts for each iteration.
    // It will store all valid 3-character suffixes with an initial value of zero.
    const suffixCountResetTemplate = {};

    /**
     * Helper function to check if a 4-character sequence contains any forbidden patterns.
     * The forbidden patterns are "AGC", "ACG", "GAC", and specific patterns like "AG.C" and "A.GC"
     * (where '.' is any character) when considering a 4-character string.
     *
     * @param {string} sequenceSegment A 4-character string to check for forbidden patterns.
     * @returns {boolean} True if the segment contains a forbidden pattern, false otherwise.
     */
    const containsForbiddenPattern = (sequenceSegment) => {
        // Check for standard 3-mer forbidden substrings anywhere in the 4-char segment.
        if (sequenceSegment.includes("AGC") || sequenceSegment.includes("ACG") || sequenceSegment.includes("GAC")) {
            return true;
        }

        // Check for 4-character forbidden patterns with a wildcard.
        // Pattern "AG.C": A at index 0, G at index 1, C at index 3.
        if (sequenceSegment[0] === 'A' && sequenceSegment[1] === 'G' && sequenceSegment[3] === 'C') {
            return true;
        }
        // Pattern "A.GC": A at index 0, G at index 2, C at index 3.
        if (sequenceSegment[0] === 'A' && sequenceSegment[2] === 'G' && sequenceSegment[3] === 'C') {
            return true;
        }

        return false; // No forbidden patterns found
    };

    /**
     * Initializes the set of valid 3-character suffixes and their initial counts.
     * This function uses a breadth-first search (BFS) approach to generate all 3-char sequences.
     *
     * @param {string[]} nucleotides An array of allowed nucleotide characters.
     * @param {number} maxLength The target length for the suffixes (e.g., 3 for 3-mers).
     * @param {string} startingPrefix The initial prefix to start building sequences from (usually an empty string).
     * @param {Object.<string, number>} validSuffixRegister An object to store valid suffixes with initial counts (e.g., 1).
     * @param {Object.<string, number>} zeroTemplateRef An object to store all valid suffixes with initial zero counts, for template use.
     */
    function buildInitialSuffixStates(nucleotides, maxLength, startingPrefix, validSuffixRegister, zeroTemplateRef) {
        const processingQueue = [startingPrefix]; // Queue for BFS
        while (processingQueue.length > 0) {
            const currentSuffixFragment = processingQueue.shift();
            const fragmentLength = currentSuffixFragment.length;

            if (fragmentLength < maxLength) {
                // If the fragment hasn't reached the maximum desired length, extend it.
                for (const nextNuc of nucleotides) {
                    processingQueue.push(currentSuffixFragment + nextNuc);
                }
            } else if (fragmentLength === maxLength) {
                // Once a fragment reaches the maximum length, check its validity.
                // For initial 3-char suffixes, the rule is simpler: no "ACG", "AGC", or "GAC".
                const hasDirectForbiddenSubstr = currentSuffixFragment.includes("ACG") ||
                                                 currentSuffixFragment.includes("AGC") ||
                                                 currentSuffixFragment.includes("GAC");

                if (!hasDirectForbiddenSubstr) {
                    // If the 3-char sequence is valid, register it.
                    validSuffixRegister[currentSuffixFragment] = 1; // Base count is 1
                    zeroTemplateRef[currentSuffixFragment] = 0;   // Add to the zero-template for later use
                }
            }
        }
    }

    // Data structure to store counts of valid 3-character suffixes for the current length.
    // Keys are 3-char strings, values are their accumulated counts.
    let validSuffixCounts = {};

    // Populate `validSuffixCounts` and `suffixCountResetTemplate` with initial 3-character valid sequences.
    buildInitialSuffixStates(validNucleotideChars, 3, "", validSuffixCounts, suffixCountResetTemplate);

    // --- Input Validation and Edge Case Handling ---
    if (isNaN(targetSequenceLength) || targetSequenceLength < 1) {
        // Provide an error message for invalid input length.
        console.error("Error: Provided sequence length is invalid. It must be a positive integer.");
        return; // Exit if input is invalid.
    }

    if (targetSequenceLength < 3) {
        // For lengths less than 3, the problem's DP approach based on 3-char suffixes
        // doesn't directly apply or produce meaningful results in this context.
        // As per typical competitive programming problem constraints, N >= 3 is often assumed.
        // We'll output 0 for such cases, as no 3-mer forbidden pattern can exist.
        console.log(0);
        return;
    }

    if (targetSequenceLength === 3) {
        // If the target length is exactly 3, the answer is simply the number of
        // distinct valid 3-character suffixes found during initialization.
        console.log(Object.keys(validSuffixCounts).length);
        return; // Exit after printing the base case result.
    }

    // --- Dynamic Programming Loop ---
    // This loop extends sequences from length 3 up to `targetSequenceLength`.
    // Each iteration adds one character to all existing valid sequences.
    // The loop runs for `targetSequenceLength - 3` iterations.
    for (let lengthIterationIndex = 0; lengthIterationIndex < targetSequenceLength - 3; lengthIterationIndex++) {
        // Create a new object for storing counts for the next length.
        // It's initialized with all known valid suffixes having a count of zero.
        const nextIterationCounts = Object.fromEntries(
            Object.keys(suffixCountResetTemplate).map(key => [key, 0])
        );

        // Iterate over each valid 3-character suffix from the previous length.
        // `suffixKey` is a 3-char string, `currentCount` is its frequency.
        for (const suffixKey in validSuffixCounts) {
            // Ensure we are only processing own properties, not inherited ones.
            if (!Object.prototype.hasOwnProperty.call(validSuffixCounts, suffixKey)) {
                continue;
            }

            const currentCount = validSuffixCounts[suffixKey];

            // Try appending each allowed nucleotide to the current suffix.
            for (const nextNucleotide of validNucleotideChars) {
                // Form a 4-character sequence by extending the 3-char suffix.
                const potentialSequenceExtension = suffixKey + nextNucleotide;

                // Check if this 4-character sequence contains any forbidden patterns.
                if (!containsForbiddenPattern(potentialSequenceExtension)) {
                    // If the extended sequence is valid, extract its last 3 characters
                    // to form the new suffix key for the next length.
                    const newSuffixKey = potentialSequenceExtension.slice(-3);
                    
                    // Add the `currentCount` to the `newSuffixKey`'s total,
                    // ensuring to apply the modulo constant at each addition to prevent overflow.
                    nextIterationCounts[newSuffixKey] = (nextIterationCounts[newSuffixKey] + currentCount) % MODULO_CONSTANT;
                }
            }
        }
        // Update `validSuffixCounts` with the newly calculated counts for the next length.
        validSuffixCounts = nextIterationCounts;
    }

    // --- Final Summation ---
    // After the loop completes, `validSuffixCounts` holds the counts of all
    // valid 3-character suffixes for sequences of `targetSequenceLength`.
    // Sum all these counts to get the total number of valid sequences.
    let totalValidSequences = 0;
    for (const count of Object.values(validSuffixCounts)) {
        totalValidSequences = (totalValidSequences + count) % MODULO_CONSTANT;
    }

    // Output the final result to the console.
    console.log(totalValidSequences);
}

// The following line is for standard input/output in competitive programming environments.
// It should not be modified.
ProcessSequenceData(require("fs").readFileSync("/dev/stdin", "utf8"));