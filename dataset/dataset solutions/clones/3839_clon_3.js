// This module is designed to process a multi-line text input, extract a primary string and a numerical rank,
// then identify and output the K-th lexicographically smallest unique substring from the primary string.
// It incorporates robust input validation and utilizes efficient data structures for performance.
function processAndExtractKthSubstring(rawInputPayload) {

    // First, safely split the entire raw input payload into an array of individual lines.
    const inputLines = rawInputPayload.split('\n');

    // Extract the main text string from the very first line of the input.
    // It's trimmed to remove any leading/trailing whitespace and converted to lowercase
    // to ensure case-insensitive comparison for substring generation and sorting.
    let sourceText = inputLines[0] ? inputLines[0].trim().toLowerCase() : '';

    // Extract the desired rank (K) from the second line.
    // This value is also trimmed and parsed as an integer with radix 10 for reliability.
    const targetRank = parseInt(inputLines[1] ? inputLines[1].trim() : '0', 10);

    // --- Comprehensive Input Validation Section ---
    // Define the acceptable length boundaries for the source text.
    // These constraints are often specified in problem statements.
    const minimumSourceLength = 1;
    const maximumSourceLength = 5000;

    // Perform a check to ensure the source text's length falls within the expected range.
    if (sourceText.length < minimumSourceLength || sourceText.length > maximumSourceLength) {
        console.error("Input Error: The provided source text length (" + sourceText.length + ") is outside the acceptable range [" + minimumSourceLength + ", " + maximumSourceLength + "].");
        return; // Exit if the source text is invalid.
    }

    // Define the acceptable range for the target rank (K).
    // The original problem implies a very small range (1-5).
    const minimumTargetRank = 1;
    const maximumTargetRank = 5;

    // Validate the target rank (K) to confirm it's a valid number and within its specified bounds.
    if (isNaN(targetRank) || targetRank < minimumTargetRank || targetRank > maximumTargetRank) {
        console.error("Input Error: The target rank (K) value (" + targetRank + ") is invalid or falls outside the acceptable range [" + minimumTargetRank + ", " + maximumTargetRank + "].");
        return; // Exit if the target rank is invalid.
    }

    // Cache the total number of characters in the source text for efficient loop iteration.
    const textCharacterCount = sourceText.length;

    // Initialize a Set data structure. Sets are highly efficient for storing unique items,
    // as they automatically handle duplicate entries, ensuring that each substring is stored only once.
    const uniqueSubsequenceSet = new Set();

    // --- Substring Generation Logic ---
    // Outer loop: Iterates through each possible starting position for a substring.
    for (let currentStart = 0; currentStart < textCharacterCount; currentStart++) {
        // Inner loop: Iterates through each possible ending position for a substring,
        // starting from `currentStart + 1` to ensure that only non-empty substrings are generated.
        for (let currentEnd = currentStart + 1; currentEnd <= textCharacterCount; currentEnd++) {
            // Extract the segment of the string using the `slice` method.
            // `slice` is a common alternative to `substring` and behaves similarly in this context.
            const extractedSegment = sourceText.slice(currentStart, currentEnd);

            // Add the newly extracted segment to our Set. If it's already present,
            // the Set will simply ignore the addition, maintaining uniqueness.
            uniqueSubsequenceSet.add(extractedSegment);
        }
    }

    // Convert the Set of unique substrings into a standard Array.
    // This step is necessary because Sets do not maintain an ordered sequence by index
    // and cannot be directly sorted in the way an array can.
    const allUniqueSegmentsArray = Array.from(uniqueSubsequenceSet);

    // Sort the array of unique substrings lexicographically (alphabetically) in ascending order.
    // JavaScript's default sort method for strings provides this behavior.
    allUniqueSegmentsArray.sort();

    // --- Final Result Determination ---
    // Implement a crucial guard clause: Check if the requested `targetRank` (K)
    // is greater than the total number of unique substrings found.
    // If it is, then the K-th substring simply does not exist.
    if (targetRank > allUniqueSegmentsArray.length) {
        console.error("Result Error: The requested K-th substring (rank " + targetRank + ") cannot be found, as there are only " + allUniqueSegmentsArray.length + " unique substrings generated.");
        return; // Exit if the requested rank is out of bounds for the results.
    }

    // Retrieve the specific K-th substring from the sorted array.
    // Note that arrays are 0-indexed, so we subtract 1 from the `targetRank` to get the correct index.
    const finalResultSubsequence = allUniqueSegmentsArray[targetRank - 1];

    // Output the identified K-th unique substring to standard output.
    console.log(finalResultSubsequence);
}

// The entry point for execution: Read the entire content from standard input (e.g., from a file or pipe)
// using Node.js's `fs` module, assuming UTF-8 encoding, and then pass it to our main processing function.
processAndExtractKthSubstring(require("fs").readFileSync("/dev/stdin", "utf8"));