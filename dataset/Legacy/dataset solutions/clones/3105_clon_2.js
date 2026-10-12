function ProcessInput(rawData) {
    'use strict'; // Enforce strict parsing and error handling.

    // Parse the input to get the desired sequence length.
    const sequenceLength = parseInt(rawData.split("\n").shift());

    // Define the set of valid DNA nucleotides.
    const nucleotideSet = ["A", "T", "G", "C"];

    // Define a large prime number for modulo operations to prevent overflow.
    const moduloConstant = 1000000007;

    // This object will store counts of valid 3-character patterns.
    // It's initialized as an array but used as a hash map (object).
    let currentValidPatterns = [];

    // A temporary object to hold zero counts for all valid 3-character patterns.
    const basePatternMap = [];

    /**
     * Recursively generates all 3-character patterns that do not contain
     * "ACG", "AGC", or "GAC" as substrings.
     * These initial patterns are stored in `currentValidPatterns` and `basePatternMap`.
     * @param {string} startingString - The string to build upon.
     */
    (function generateInitialPatterns(startingString){
        // Use a queue for breadth-first generation of patterns.
        const patternQueue = [startingString];

        // Process patterns until the queue is empty.
        while(patternQueue.length !== 0){
            const currentPattern = patternQueue.shift(); // Get the next pattern from the queue.

            // If the pattern is not yet 3 characters long, extend it.
            if(currentPattern.length !== 3){
                nucleotideSet.forEach(nextChar => {
                    patternQueue.push(currentPattern + nextChar); // Add new extended patterns to the queue.
                });
            } else {
                // If the pattern is 3 characters long, check its validity.
                // It must not contain "ACG", "AGC", or "GAC".
                if(!currentPattern.match(/ACG|AGC|GAC/)){
                    currentValidPatterns[currentPattern] = 1; // Mark as valid with an initial count of 1.
                    basePatternMap[currentPattern] = 0;       // Initialize its count to 0 in the base map.
                }
            }
        }
    })(""); // Start the generation with an empty string.

    // Special case: if the sequence length is 3, the answer is simply the number of valid 3-char patterns.
    if(sequenceLength === 3) {
        console.log(Object.keys(currentValidPatterns).length);
    } else {
        // For sequence lengths greater than 3, iterate to build up longer sequences.
        // The loop runs for (n - 3) iterations, as we start with 3-char patterns.
        for(let iterationIndex = 0; iterationIndex < sequenceLength - 3; iterationIndex++){
            // Create a new map for the next iteration's valid patterns, initialized with zeros.
            const updatedPatternCounts = Object.assign([], basePatternMap);

            // Iterate over the currently valid 3-character patterns.
            Object.keys(currentValidPatterns).forEach(patternKey => {
                const patternValue = currentValidPatterns[patternKey]; // Get the count for the current pattern.

                // Try appending each nucleotide to the current pattern.
                nucleotideSet.forEach(nextChar => {
                    const extendedPattern = patternKey + nextChar; // Form a 4-character extended pattern.

                    // Check if the extended pattern (specifically its last 4 chars)
                    // contains any forbidden substrings: "ACG", "AGC", "GAC", "AG.C", "A.GC".
                    // The regex `AG.C` covers "AGAC", "AGTC", "AGGC", "AGCC".
                    // The regex `A.GC` covers "AAGC", "ATGC", "ACGC", "AGGC".
                    // Note: The original code uses `newStr.match` on a 4-char string,
                    // which implicitly checks the last 4 characters if the pattern is 4 chars.
                    // The `slice(-3)` ensures we are always dealing with the last 3 characters for the key.
                    if(!extendedPattern.match(/ACG|AGC|GAC|AG.C|A.GC/)) {
                        // If valid, add the current pattern's count to the new pattern's count.
                        // We only care about the last 3 characters for the key in our map.
                        updatedPatternCounts[extendedPattern.slice(-3)] = (updatedPatternCounts[extendedPattern.slice(-3)] + patternValue) % moduloConstant;
                    }
                });
            });
            // Update the current valid patterns for the next iteration.
            currentValidPatterns = updatedPatternCounts;
        }

        // After all iterations, sum up the counts of all valid 3-character patterns
        // and apply the modulo constant.
        console.log(Object.keys(currentValidPatterns).reduce((accumulator, currentKey) => accumulator + currentValidPatterns[currentKey], 0) % moduloConstant);
    }
}

// This line should not be modified (reads input from stdin and calls the main function).
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
