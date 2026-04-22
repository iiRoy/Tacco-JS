// Core application state variables, initialized for clarity.
let inputStringData = ''; // Holds the raw input line read from stdin.
let finalAccumulator = 0; // Accumulates the total count of valid subsequences across all permutations.
let sequenceChars = []; // The input string transformed into an array of individual characters.
const targetPatternElements = ['A', 'B', 'C']; // The specific character sequence (e.g., "ABC") we aim to find as a subsequence.
const MODULO_NUMERIC_CONSTANT = 1_000_000_007; // A large prime constant used for modulo arithmetic to prevent integer overflow.

// Initialize the readline interface for standard input/output operations.
const streamProcessorModule = require('readline');
const ioInterfaceHandler = streamProcessorModule.createInterface({
    input: global.process.stdin, // Explicitly referencing stdin from the global process object.
    output: global.process.stdout, // Explicitly referencing stdout from the global process object.
});

// Event listener for each line of input received.
ioInterfaceHandler.on('line', (incomingLineSegment) => {
    // Basic validation: ensure the input is a non-empty string after trimming whitespace.
    if (typeof incomingLineSegment === 'string' && incomingLineSegment.trim().length > 0) {
        inputStringData = incomingLineSegment.trim(); // Store the trimmed input.
    } else {
        // Log a warning if an invalid or empty line is encountered, but don't halt execution.
        console.warn("Input Processing Warning: Received an empty or non-string input segment. This line will be disregarded.");
    }
});

// Event listener triggered when the input stream closes (e.g., after EOF or manual close).
ioInterfaceHandler.on('close', () => {
    // Primary execution flow starts here after all input has been gathered.

    // Guard clause: If no valid input string was ever captured.
    if (!inputStringData) {
        displayFinalResult(0); // Output zero as there's nothing to process.
        return;
    }

    // Convert the validated input string into a character array for easier manipulation.
    sequenceChars = inputStringData.split('');

    // Pre-check: If the input sequence is shorter than the target pattern, no subsequences can be formed.
    if (sequenceChars.length < targetPatternElements.length) {
        displayFinalResult(0); // Output zero and exit early.
        return;
    }

    // Initiate the recursive process to generate and evaluate all possible character permutations.
    // An array is created to hold the current permutation, initialized with undefined slots.
    const initialPermutationArray = new Array(sequenceChars.length);
    recursivelyDiscoverPermutations(0, initialPermutationArray);

    // After all permutations have been processed, display the final accumulated total.
    displayFinalResult(finalAccumulator);
});

/**
 * Utility function responsible for displaying the final computed result to the console.
 * @param {number} valueToDisplay - The numeric result that needs to be outputted.
 */
const displayFinalResult = (valueToDisplay) => {
    console.log(valueToDisplay);
};

/**
 * Recursively explores all potential character combinations by systematically replacing '?' wildcards.
 * This function builds up permutations one character at a time.
 * @param {number} processingIndex - The current index within the `sequenceChars` array being processed.
 * @param {Array<string>} currentWorkingPermutation - The character array representing the permutation currently under construction.
 */
function recursivelyDiscoverPermutations(processingIndex, currentWorkingPermutation) {
    // Base case for the recursion: If all character positions have been filled.
    if (processingIndex === sequenceChars.length) {
        // A complete permutation has been formed; now, evaluate it for subsequences.
        processPermutationForSubsequences(currentWorkingPermutation);
        return; // Terminate this specific recursive branch.
    }

    // Check if the character at the current index is a wildcard ('?').
    if (sequenceChars[processingIndex] === '?') {
        // If it's a wildcard, try substituting each character from our `targetPatternElements` ('A', 'B', 'C').
        for (const potentialChar of targetPatternElements) {
            currentWorkingPermutation[processingIndex] = potentialChar; // Assign the potential character.
            // Recursively call for the next index to continue building the permutation.
            recursivelyDiscoverPermutations(processingIndex + 1, currentWorkingPermutation);
        }
    } else {
        // If it's a fixed character (not '?'), simply assign it to the current permutation.
        currentWorkingPermutation[processingIndex] = sequenceChars[processingIndex];
        // Recursively call for the next index.
        recursivelyDiscoverPermutations(processingIndex + 1, currentWorkingPermutation);
    }
}

/**
 * Implements a dynamic programming approach to count specific subsequences (e.g., "ABC")
 * within a given character permutation. This function precisely replicates the unique DP
 * counting logic found in the original code.
 * @param {Array<string>} activePermutation - The complete character permutation to be analyzed.
 * @returns {void} This function updates the global `finalAccumulator` variable.
 */
function processPermutationForSubsequences(activePermutation) {
    // Robust input validation for the permutation array.
    if (!Array.isArray(activePermutation) || activePermutation.length === 0) {
        console.error("DP Calculation Error: An invalid or empty permutation array was provided for processing.");
        return;
    }

    const currentPermutationLength = activePermutation.length;
    const targetSeqLength = targetPatternElements.length;

    // Guard clause: The permutation must be at least as long as the target sequence to form it.
    if (currentPermutationLength < targetSeqLength) {
        return; // No subsequences possible, so return early.
    }

    // Initialize a 2D dynamic programming table.
    // `dpTable[i][j]` will store counts related to `targetPatternElements[0...j]`
    // using characters from `activePermutation[0...i]`. All cells start at zero.
    let dpTable = Array.from({ length: currentPermutationLength }, () => Array(targetSeqLength).fill(0));

    // Phase 1: Populate the first column of the DP table (corresponding to `targetPatternElements[0]`, typically 'A').
    // This loop counts the occurrences of the first target character up to each index in the permutation.
    const firstTargetChar = targetPatternElements[0];
    if (activePermutation[0] === firstTargetChar) {
        dpTable[0][0] = 1; // If the very first character matches, initialize its count to 1.
    }
    for (let charPosition = 1; charPosition < currentPermutationLength; charPosition++) {
        dpTable[charPosition][0] = dpTable[charPosition - 1][0]; // Carry forward the count from the previous position.
        if (activePermutation[charPosition] === firstTargetChar) {
            dpTable[charPosition][0] = (dpTable[charPosition][0] + 1); // Increment if the current character also matches.
        }
    }

    // Phase 2: Populate subsequent columns for the remaining target pattern elements (e.g., 'B', then 'C').
    // Iterate through each segment of the target pattern, starting from the second element.
    for (let patternSegmentIdx = 1; patternSegmentIdx < targetSeqLength; patternSegmentIdx++) {
        // A temporary map is used to track the number of times the *current* target pattern character
        // (e.g., 'B' when `patternSegmentIdx` is 1) has been encountered *before* the current `permCharIdx`
        // within this specific pattern segment loop. This is a critical component of the original DP formula.
        let localCharacterCounts = new Map(); // Using a Map for a structural variation from the original's plain object.

        const currentTargetCharForSegment = targetPatternElements[patternSegmentIdx];

        // Iterate through the permutation characters, starting from the second character (index 1).
        for (let permCharIdx = 1; permCharIdx < currentPermutationLength; permCharIdx++) {
            const charFromPermutation = activePermutation[permCharIdx];
            const prevSegmentCount = dpTable[permCharIdx - 1][patternSegmentIdx - 1];

            // This conditional block precisely replicates the original code's specific DP transition logic.
            // The value of `dpTable[permCharIdx][patternSegmentIdx]` is determined by one of two distinct paths.
            if (charFromPermutation === currentTargetCharForSegment && prevSegmentCount !== 0) {
                // Path A: If the current character from the permutation matches the target character for this segment,
                // AND there was a non-zero count for the *immediately preceding* pattern segment (e.g., 'A's for 'B')
                // ending at the previous `permCharIdx`.
                // In this scenario, `dpTable[permCharIdx][patternSegmentIdx]` is calculated using a specific sum.
                const previousOccurrencesOfCurrentTarget = localCharacterCounts.get(charFromPermutation) || 0;
                dpTable[permCharIdx][patternSegmentIdx] =
                    (prevSegmentCount + previousOccurrencesOfCurrentTarget) % MODULO_NUMERIC_CONSTANT;

                // Crucially, the `localCharacterCounts` for this specific target character is incremented
                // ONLY when this Path A condition is met.
                localCharacterCounts.set(charFromPermutation, previousOccurrencesOfCurrentTarget + 1);
            } else {
                // Path B: If the condition for Path A is NOT met (either `charFromPermutation` doesn't match
                // `currentTargetCharForSegment`, or `prevSegmentCount` is zero).
                // In this case, `dpTable[permCharIdx][patternSegmentIdx]` simply inherits its value
                // from the identical position at the previous character index (`permCharIdx - 1`).
                dpTable[permCharIdx][patternSegmentIdx] = dpTable[permCharIdx - 1][patternSegmentIdx];
                // The `localCharacterCounts` remains unchanged in this path.
            }
        }
    }

    // After completing all DP calculations, the final count for the entire target pattern
    // (e.g., "ABC") is located in the last cell of the DP table.
    // Add this count to the global accumulator, ensuring the modulo operation is applied.
    finalAccumulator = (finalAccumulator + dpTable[currentPermutationLength - 1][targetSeqLength - 1]) % MODULO_NUMERIC_CONSTANT;
}