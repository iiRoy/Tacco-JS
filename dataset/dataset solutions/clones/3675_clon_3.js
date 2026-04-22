// This script processes two lines of input from standard input:
// The first line is expected to be a number (N) which defines a segment length or iteration depth.
// The second line is a string (S) from which characters are extracted to form new patterns.
// The program then performs a two-phase operation:
// Phase 1: It generates a set of unique string patterns based on N and a portion of S,
//          counting the occurrences of each generated pattern.
// Phase 2: It generates a second set of string patterns using N and a different portion of S,
//          and sums up the counts of these patterns as determined in Phase 1.
// Finally, the total accumulated sum is printed to the console.

// A utility function to safely read all input lines from stdin.
const retrieveStandardInputLines = () => {
    // Access standard input as a readable stream and read its entire content into a buffer.
    const rawDataBuffer = process.stdin.readFileSync(0);
    // Convert the buffer to a UTF-8 string and split it into an array of lines using the newline character.
    return rawDataBuffer.toString('utf8').split('\n');
};

// Main application logic encapsulated within an immediately invoked function expression (IIFE)
// to prevent global variable pollution and manage scope.
(function executePatternAnalysis() {
    // Fetch all lines provided via standard input.
    const allReceivedInput = retrieveStandardInputLines();

    // Implement a basic validation check for the number of input lines.
    // At least two lines are necessary for the program to function as intended.
    if (allReceivedInput.length < 2) {
        console.error("Input Error: Not enough lines provided. Expected at least two lines for processing.");
        process.exit(1); // Terminate the process with an error code.
    }

    // Parse the first line as an integer; this value (N) dictates loop bounds and string construction.
    // Use .trim() to remove any leading/trailing whitespace and parseInt with radix 10 for safety.
    const segmentSize = parseInt(allReceivedInput[0].trim(), 10);

    // Validate that the parsed segmentSize is a valid, non-negative number.
    if (isNaN(segmentSize) || segmentSize < 0) {
        console.error(`Input Error: The first line must be a non-negative integer. Received: "${allReceivedInput[0]}"`);
        process.exit(1);
    }

    // The second line is the primary source string (S) from which characters will be drawn.
    const characterSourceString = allReceivedInput[1];

    // Initialize a JavaScript Map object to store the frequency (counts) of generated patterns.
    // Using a Map is generally more performant for string keys than a plain object when keys are not fixed.
    const patternOccurrenceMap = new Map();

    // Calculate the total number of distinct bit combinations possible for 'segmentSize' bits.
    // This is equivalent to 2 raised to the power of 'segmentSize', determining the main loop iterations.
    const totalCombinations = 1 << segmentSize;

    // --- Phase 1: Pattern Generation and Frequency Counting ---
    // This loop iterates through every possible bitmask from (2^segmentSize - 1) down to 0.
    // Each bitmask guides the construction of a unique string pattern from 'characterSourceString'.
    for (let currentBitConfiguration = totalCombinations - 1; currentBitConfiguration >= 0; currentBitConfiguration--) {
        let constructedPattern = ''; // Initialize an empty string for the current pattern being built.

        // Inner loop: Iterates from 'segmentSize - 1' down to 0, processing each bit position.
        // This determines which character from 'characterSourceString' is used and its placement.
        for (let bitIndex = segmentSize - 1; bitIndex >= 0; bitIndex--) {
            // Check if the bit at 'bitIndex' is set (1) in the 'currentBitConfiguration'.
            // A bitwise AND operation with (1 shifted left by bitIndex) isolates the bit.
            const isBitActive = (currentBitConfiguration & (1 << bitIndex)) !== 0;

            // Retrieve the character from 'characterSourceString' at the current 'bitIndex'.
            // A small validation to ensure we don't go out of bounds, though it shouldn't
            // happen with typical inputs for this problem.
            if (bitIndex >= characterSourceString.length) {
                console.warn(`Warning: Character index ${bitIndex} is out of bounds for source string "${characterSourceString}". Skipping character.`);
                continue; // Move to the next bit if the index is invalid.
            }
            const charFromSource = characterSourceString[bitIndex];

            // Based on whether the bit is active, prepend or append the character to 'constructedPattern'.
            if (isBitActive) {
                constructedPattern = charFromSource + constructedPattern; // Prepend character.
            } else {
                constructedPattern = constructedPattern + charFromSource; // Append character.
            }
        }

        // After constructing the pattern, update its frequency in the map.
        // If the pattern is new, its count starts at 0 before being incremented.
        patternOccurrenceMap.set(constructedPattern, (patternOccurrenceMap.get(constructedPattern) || 0) + 1);
    }

    // Initialize a variable to accumulate the final result from Phase 2.
    let finalAccumulatedSum = 0;

    // --- Phase 2: Target Pattern Generation and Summation of Frequencies ---
    // This loop is structurally similar to Phase 1, iterating through all possible bit configurations.
    // However, it uses a different character indexing scheme and sums up existing pattern counts.
    for (let currentBitIteration = totalCombinations - 1; currentBitIteration >= 0; currentBitIteration--) {
        let generatedTargetPattern = ''; // Initialize an empty string for the target pattern.

        // Inner loop: Iterates from 'segmentSize - 1' down to 0.
        for (let positionIdentifier = segmentSize - 1; positionIdentifier >= 0; positionIdentifier--) {
            // Determine if the current bit is set in 'currentBitIteration'.
            const isCurrentBitSet = (currentBitIteration & (1 << positionIdentifier)) !== 0;

            // Calculate a different character index for extraction from 'characterSourceString'.
            // The original formula `2*n+~i` translates to `2*n - i - 1` in JavaScript.
            const sourceCharacterOffset = (2 * segmentSize) - positionIdentifier - 1;

            // Perform a robust check to ensure the calculated index is within the bounds
            // of the 'characterSourceString'. This prevents potential runtime errors.
            if (sourceCharacterOffset < 0 || sourceCharacterOffset >= characterSourceString.length) {
                console.warn(`Warning: Computed character offset ${sourceCharacterOffset} is out of bounds for source string "${characterSourceString}". Skipping character.`);
                continue;
            }

            const chosenCharacter = characterSourceString[sourceCharacterOffset];

            // Again, prepend or append the character based on the active bit.
            if (isCurrentBitSet) {
                generatedTargetPattern = chosenCharacter + generatedTargetPattern; // Prepend.
            } else {
                generatedTargetPattern = generatedTargetPattern + chosenCharacter; // Append.
            }
        }

        // Retrieve the count of the 'generatedTargetPattern' from the map populated in Phase 1.
        // If the pattern doesn't exist in the map (meaning its count is 0), default to 0.
        const patternCountFromMap = patternOccurrenceMap.get(generatedTargetPattern) || 0;

        // Add this count to the running total.
        finalAccumulatedSum += patternCountFromMap;
    }

    // Output the final computed sum to standard output.
    console.log(finalAccumulatedSum);
})();