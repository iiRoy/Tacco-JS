const fileSystem = require('fs');

const standardInputPath = '/dev/stdin';

// Encapsulate the primary logic within an Immediately Invoked Function Expression (IIFE)
// to manage scope and prevent global variable pollution.
(() => {
    let rawInputContent;
    try {
        // Attempt to read the entire content from the standard input path.
        // The 'utf8' encoding ensures proper character interpretation.
        rawInputContent = fileSystem.readFileSync(standardInputPath, 'utf8');
    } catch (readError) {
        // If an error occurs during file reading, log it and exit gracefully.
        console.error("Critical error encountered while accessing input stream:", readError.message);
        return; // Terminate execution if input cannot be obtained.
    }

    // Pre-process the raw input:
    // 1. Remove any leading or trailing whitespace from the entire content.
    // 2. Split the content into an array of individual lines.
    //    Using a regular expression `/\r?\n/` ensures compatibility with both
    //    Unix-style (`\n`) and Windows-style (`\r\n`) line endings.
    let processedInputLines = rawInputContent.trim().split(/\r?\n/);

    // Filter out any lines that might have become empty after trimming or splitting,
    // ensuring we only process meaningful data.
    processedInputLines = processedInputLines.filter(currentLine => currentLine.length > 0);

    // Begin processing input line pairs. The loop continues as long as there are
    // at least two lines available to form a complete comparison pair.
    while (processedInputLines.length >= 2) {
        // Extract the first string for the current comparison operation.
        const primaryStringData = processedInputLines.shift();
        // Extract the second string for the current comparison operation.
        const secondaryStringData = processedInputLines.shift();

        // Convert the extracted strings into arrays of characters.
        // This facilitates character-by-character access using numerical indices.
        const primarySequenceOfCharacters = primaryStringData.split('');
        const secondarySequenceOfCharacters = secondaryStringData.split('');

        // Initialize a variable to keep track of the maximum length of a common segment
        // found across all comparison iterations for the current pair of strings.
        let overallMaxCommonLength = 0;
        // This variable controls the "depth" or "window size" of the comparison
        // within the secondary string. It increments with each outer loop iteration.
        let iterationComparisonDepth = 0;

        // The outer loop iterates backward through the primary string.
        // 'mainStringStartingIndex' represents the potential starting point
        // of a common segment within the primary string.
        for (let mainStringStartingIndex = primarySequenceOfCharacters.length - 1;
             mainStringStartingIndex >= 0;
             mainStringStartingIndex = mainStringStartingIndex - 1) {

            // Increment the comparison depth for the secondary string.
            // This effectively expands the window of characters considered from the secondary string's beginning.
            iterationComparisonDepth = iterationComparisonDepth + 1;

            // Initialize a temporary variable to count the length of the current
            // contiguous match sequence within the inner comparison window.
            let currentContiguousMatchCount = 0;
            // Initialize a pointer for the primary string, starting at the current
            // 'mainStringStartingIndex' and moving forward with the inner loop.
            let dynamicPrimaryStringPointer = mainStringStartingIndex;

            // The inner loop iterates forward through the secondary string,
            // up to the current 'iterationComparisonDepth'.
            // 'secondaryStringWindowIndex' represents the index within the secondary string's window.
            for (let secondaryStringWindowIndex = 0;
                 secondaryStringWindowIndex < iterationComparisonDepth;
                 secondaryStringWindowIndex += 1) {

                // Retrieve characters from both sequences at their respective current positions.
                // Explicitly checking for undefined ensures robustness against out-of-bounds access,
                // although the loop conditions generally prevent this for valid inputs.
                const characterFromPrimary = primarySequenceOfCharacters[dynamicPrimaryStringPointer];
                const characterFromSecondary = secondarySequenceOfCharacters[secondaryStringWindowIndex];

                // Perform a character-by-character comparison.
                if (characterFromPrimary !== undefined &&
                    characterFromSecondary !== undefined &&
                    characterFromPrimary === characterFromSecondary) {
                    // If characters match, extend the length of the current contiguous match.
                    currentContiguousMatchCount++;
                } else {
                    // If a mismatch occurs (or a character is undefined),
                    // update the global maximum common length if the current sequence was longer.
                    overallMaxCommonLength = Math.max(overallMaxCommonLength, currentContiguousMatchCount);
                    // Reset the current match count because the contiguous sequence has been broken.
                    currentContiguousMatchCount = 0;
                }
                // Advance the primary string pointer to compare the next character in the sequence.
                dynamicPrimaryStringPointer = dynamicPrimaryStringPointer + 1;
            }
            // NOTE: The original code's logic implies that if a match sequence extends
            // to the very end of the inner loop without a subsequent mismatch,
            // its length is NOT captured into 'overallMaxCommonLength'.
            // This specific behavior (a potential "quirk" or "bug" depending on interpretation)
            // is intentionally preserved here to maintain functional similarity.
        }
        // After processing all comparison windows for the current pair of strings,
        // output the final calculated longest common segment length.
        console.log(overallMaxCommonLength);
    }
})();