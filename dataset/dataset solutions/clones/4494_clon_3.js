/*
 * This module is designed to identify and report the length of the longest prefix
 * of an input string that exhibits a specific "double-segment" pattern (XX).
 * In this pattern, the prefix of length 'L' is composed of two identical
 * segments, each of length 'L/2'. For example, if the input is "abcabc",
 * the longest such prefix is "abcabc" itself (length 6), formed by "abc" + "abc".
 * For "abab", the prefix "abab" (length 4) is formed by "ab" + "ab".
 *
 * The algorithm systematically examines potential prefix lengths, starting from
 * (total_string_length - 2) and decreasing by steps of 2. For each candidate
 * prefix length 'L', it verifies if the characters in the first 'L/2' positions
 * match the characters in the subsequent 'L/2' positions.
 *
 * A crucial aspect of this clone is replicating the original's behavior precisely,
 * even when the candidate prefix length 'L' is odd. In such cases, 'L/2' is a float.
 * JavaScript's string indexing (e.g., `s[j + L/2]`) implicitly truncates float indices
 * to integers (equivalent to `s[j + Math.floor(L/2)]`). This implementation
 * explicitly uses `Math.floor` to clarify and maintain this specific comparison logic,
 * which means for odd 'L', it's not a strict 'XX' pattern check.
 *
 * If no such repeating prefix is found after checking all possibilities, the function
 * will output 0, indicating no match. This is an enhancement over the original,
 * which would simply exit without output in such scenarios.
 */
function processStringForRepeatingPrefix(rawInputContent) {
    // Extract the primary line of text from the raw input.
    // This typically discards any subsequent lines.
    const lineToAnalyze = rawInputContent.split('\n')[0];

    // Handle edge cases where a repeating prefix (XX) cannot possibly exist.
    // A string must have at least two characters to form an XX pattern.
    if (lineToAnalyze.length < 2) {
        console.log(0); // Output 0 for empty or single-character strings.
        return;
    }

    // Flag to track whether a valid repeated segment was found and processed.
    let hasFoundValidRepeatedSegment = false;

    // The outer loop iterates over potential values for 'suffixSkipIncrement'.
    // This variable represents the length of the suffix that is *not* part
    // of the current candidate prefix. As 'suffixSkipIncrement' increases,
    // the 'currentCandidateLength' (which is 'lineToAnalyze.length - suffixSkipIncrement')
    // decreases. This ensures we find the *longest* matching prefix first.
    // The loop increments by 2, mirroring the original logic's 'i += 2'.
    for (let suffixSkipIncrement = 2; suffixSkipIncrement <= lineToAnalyze.length; suffixSkipIncrement += 2) {
        // Calculate the length of the prefix currently being examined for the 'XX' pattern.
        let currentCandidateLength = lineToAnalyze.length - suffixSkipIncrement;

        // If the candidate length is zero or negative, it's not a valid prefix for comparison.
        // The original code's loop bounds implicitly handle this for 'i < s.length',
        // but explicit check adds clarity.
        if (currentCandidateLength <= 0) {
            continue; // Move to the next iteration.
        }

        // Initialize a boolean flag for the current candidate length.
        // This flag will be set to false if any mismatch is found within the segment.
        let areHalvesIdentical = true;

        // Determine the length of one half of the candidate segment.
        // This can be a floating-point number if 'currentCandidateLength' is odd.
        const halfSegmentLengthFloat = currentCandidateLength / 2;

        // Explicitly apply Math.floor to the half-segment length when calculating
        // the offset for character comparison. This replicates JavaScript's
        // behavior of truncating float indices in string access (e.g., s[1.5] becomes s[1]).
        const effectiveHalfIndexOffset = Math.floor(halfSegmentLengthFloat);

        // The inner loop compares characters from the first half of the candidate
        // prefix with characters from its second half.
        // The loop condition `segmentHalfIndex < halfSegmentLengthFloat` ensures
        // the correct number of comparisons, including handling float values from original.
        for (let segmentHalfIndex = 0; segmentHalfIndex < halfSegmentLengthFloat; ++segmentHalfIndex) {
            // Compare the character at `segmentHalfIndex` with the character at
            // `segmentHalfIndex + effectiveHalfIndexOffset`.
            if (lineToAnalyze.charAt(segmentHalfIndex) !== lineToAnalyze.charAt(segmentHalfIndex + effectiveHalfIndexOffset)) {
                areHalvesIdentical = false; // A mismatch was found.
                break; // No need to continue checking this candidate length.
            }
        }

        // If 'areHalvesIdentical' is still true after the inner loop, it means
        // the current prefix of 'currentCandidateLength' forms an 'XX' pattern
        // (or its specific float-indexed equivalent). Since we iterate from
        // largest possible 'currentCandidateLength' downwards, the first match
        // found is guaranteed to be the longest.
        if (areHalvesIdentical) {
            console.log(currentCandidateLength); // Output the length of this longest prefix.
            hasFoundValidRepeatedSegment = true; // Mark that a match was successfully found.
            return; // Terminate the function immediately, as per original logic.
        }
    }

    // If the entire loop completes without finding any valid repeated segment,
    // this block executes. It indicates that no prefix satisfies the condition.
    if (!hasFoundValidRepeatedSegment) {
        console.log(0); // Output 0 to signify no match was found.
    }
}

// The script's entry point: reads all data from standard input,
// decodes it as UTF-8, and passes it to our processing function.
processStringForRepeatingPrefix(require("fs").readFileSync("/dev/stdin", "utf8"));