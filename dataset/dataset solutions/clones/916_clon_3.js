// A Type III clone of a JavaScript program designed to process textual data in batches.
// This version showcases significant structural and syntactic transformations,
// including comprehensive identifier renaming, enhanced input validation,
// alternative algorithmic implementations for string processing, and
// explicit state management, all while maintaining the original problem's core functionality.

// --- Core Data Acquisition Service ---
// This function simulates the acquisition of raw input data from a system source,
// typically standard input in a competitive programming context.
// It abstracts the file system interaction for clarity and potential reusability.
const fetchDataStreamContent = () => {
    // In a live execution environment, this line would read from `/dev/stdin`.
    // For local testing or different setups, this might be replaced by a mock
    // or a different file path.
    return require("fs").readFileSync("/dev/stdin", "utf8");
};

// --- Global Input Management ---
// Reads all available input data as a single string.
let completeRawInput = fetchDataStreamContent();
// Splits the raw input string into an array of individual lines,
// which will be processed sequentially.
let inputLineBuffer = completeRawInput.split("\n");

// A mutable pointer to track the current position within the `inputLineBuffer`,
// ensuring sequential access to input lines.
let bufferReadPosition = 0;

// --- Main Processing Cycle ---
// This indefinite loop processes batches of data until a specific termination
// signal (a batch count of zero) is encountered.
for (;;) {
    // Retrieve the current line from the buffer and advance the read pointer.
    const currentBatchSizeSpecifier = inputLineBuffer[bufferReadPosition++];

    // Attempt to parse the line as an integer to determine the number of items
    // in the upcoming batch. The unary plus operator (`+`) performs type coercion.
    let currentBatchItemCount = +currentBatchSizeSpecifier;

    // --- Loop Termination Condition ---
    // If the parsed batch count is zero, it signals the end of input,
    // and the program should terminate its processing cycle.
    if (currentBatchItemCount === 0) {
        break; // Exit the main processing loop.
    }

    // --- Enhanced Input Robustness (Type III Addition) ---
    // Validate the parsed batch count to ensure it's a non-negative integer.
    // If invalid (e.g., NaN or negative), log an error and skip to the next input block,
    // or handle as a fatal error depending on problem requirements.
    if (Number.isNaN(currentBatchItemCount) || currentBatchItemCount < 0) {
        console.error(`Warning: Invalid batch item count detected: '${currentBatchSizeSpecifier}'. Skipping this block.`);
        // Continue to the next iteration of the loop to try and read a valid batch size.
        continue;
    }

    // --- Batch Data Collection ---
    // An array to store the string entries for the current batch, as they appear in input.
    let rawStringEntriesForBatch = [];
    // Populate the array by reading `currentBatchItemCount` lines from the input buffer.
    for (let entryIndex = 0; entryIndex < currentBatchItemCount; entryIndex++) {
        rawStringEntriesForBatch.push(inputLineBuffer[bufferReadPosition++]);
    }

    // --- Custom String Transformation Logic ---
    // This phase applies a unique transformation rule to each string in the batch.
    // The rule extracts the first character of the string, and then any character
    // that immediately follows a vowel.
    let transformedStringRepresentations = rawStringEntriesForBatch.map((originalStringSegment) => {
        let constructedResult = ""; // Accumulator for the transformed segment.
        let triggerNextCharCapture = true; // Flag to control character capturing.
        // Initially true to ensure the very first character is always captured.

        // A highly optimized set for quick vowel lookup.
        const VOWEL_SET = new Set(['a', 'e', 'i', 'o', 'u']);

        // Iterate through each character of the original string.
        for (const characterUnit of originalStringSegment) {
            // If the capture flag is active, append the current character.
            if (triggerNextCharCapture) {
                constructedResult += characterUnit;
                // Deactivate the flag immediately after capture, it will only be
                // reactivated if a vowel is encountered.
                triggerNextCharCapture = false;
            }

            // Check if the current character is a vowel (case-insensitive).
            const isCurrentCharVowel = VOWEL_SET.has(characterUnit.toLowerCase());
            if (isCurrentCharVowel) {
                // If a vowel is found, prepare to capture the *next* character.
                triggerNextCharCapture = true;
            }
        }
        return constructedResult; // Return the final transformed segment.
    });

    // --- Lexicographical Ordering ---
    // Sort the transformed string representations alphabetically. This is a critical
    // step for the subsequent common prefix calculation between adjacent elements.
    transformedStringRepresentations.sort();

    // --- Utility: Common Prefix Length Calculator ---
    // This helper function determines the length of the longest common prefix
    // between two given strings. It includes a special return value for identical strings.
    const computeSharedPrefixLength = (firstString, secondString) => {
        // Find the length of the shorter string to avoid out-of-bounds access.
        const minComparisonLength = Math.min(firstString.length, secondString.length);

        // Iterate character by character up to the minimum length.
        // NOTE: The original code had a bug here, using `n` (itemBatchCount) instead of `l` (minLength).
        // This Type III clone corrects that to `minComparisonLength` for accurate prefix calculation.
        for (let charCompareIdx = 0; charCompareIdx < minComparisonLength; charCompareIdx++) {
            // If a character mismatch is found, the common prefix ends here.
            // Return the index, which represents the length of the common prefix.
            if (firstString[charCompareIdx] !== secondString[charCompareIdx]) {
                return charCompareIdx;
            }
        }

        // If the loop completes, it means one string is a prefix of the other, or they are identical.
        // The original problem defined specific return values for these cases:
        // -1 for identical strings, and `minComparisonLength` if one is a prefix of the other.
        if (firstString.length === secondString.length) {
            return -1; // Special indicator for perfectly identical strings.
        } else {
            return minComparisonLength; // The common prefix length is the length of the shorter string.
        }
    };

    // --- Maximum Prefix Identification ---
    // Variable to track the longest common prefix length found among all adjacent pairs.
    // Initialized to 0, as any valid prefix length will be non-negative.
    let maximumAdjacentSharedLength = 0;
    // A boolean flag to signal if an exact duplicate string was encountered,
    // which triggers a specific final output.
    let exactStringDuplicateFound = false;

    // Iterate through the sorted array, comparing each element with its immediate predecessor.
    // The loop starts from the second element (`pairIdx = 1`) to ensure a previous element exists.
    for (let pairIdx = 1; pairIdx < currentBatchItemCount; pairIdx++) {
        const precedingString = transformedStringRepresentations[pairIdx - 1];
        const currentString = transformedStringRepresentations[pairIdx];

        // Compute the common prefix length for the current adjacent pair.
        let currentPairPrefixLength = computeSharedPrefixLength(precedingString, currentString);

        // --- Special Handling for Exact Duplicates ---
        if (currentPairPrefixLength === -1) {
            // If the utility function returns -1, it means the two strings are identical.
            // Set `maximumAdjacentSharedLength` to a special value (-2) as per original logic,
            // and activate the flag for clearer intent. Then, terminate this calculation loop.
            maximumAdjacentSharedLength = -2;
            exactStringDuplicateFound = true;
            break;
        }

        // --- Update Maximum Length ---
        // If the current pair's common prefix is longer than any found so far, update the maximum.
        if (currentPairPrefixLength > maximumAdjacentSharedLength) {
            maximumAdjacentSharedLength = currentPairPrefixLength;
        }
    }

    // --- Final Output Generation ---
    // The problem specifies that the final output should be `(result_value + 1)`.
    // This applies to both the maximum prefix length and the special duplicate case.
    const finalReportedValue = maximumAdjacentSharedLength + 1;
    console.log(finalReportedValue);
}

// Program execution concludes after all batches have been processed.