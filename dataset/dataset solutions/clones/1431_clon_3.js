function analyzeTextOccurrences(fullTextData) {
    // This function is designed to count the total occurrences of a specific
    // target word within a given multi-line text input.
    // It processes lines sequentially until an "END_OF_TEXT" marker is found.

    // Validate initial input data.
    if (!fullTextData || typeof fullTextData !== 'string' || fullTextData.trim().length === 0) {
        // If the input is empty or not a string, log an error and terminate.
        console.error("Error: Provided text data is empty, null, or not a string.");
        return;
    }

    // Split the entire input string into an array of individual lines.
    // Using a constant for the line collection as it won't be reassigned.
    const sourceLines = fullTextData.split("\n");

    // Initialize a pointer to keep track of the current line being processed.
    // This replaces the destructive 'shift()' operation from the original.
    let currentLineIndex = 0;

    // The first line is expected to contain the target word.
    // Extract it, clean it up, and convert to uppercase for case-insensitive matching.
    let initialTargetLine = sourceLines[currentLineIndex++];
    if (initialTargetLine === undefined) {
        // Handle cases where the input might be too short or malformed.
        console.error("Error: Input does not contain a target word on the first line.");
        return;
    }
    const searchCriterion = initialTargetLine.trim().toUpperCase();

    // Initialize the counter for the matched occurrences.
    let totalMatchCount = 0;

    // Begin processing the text lines. This loop continues indefinitely
    // until an explicit break condition is met (the "END_OF_TEXT" marker).
    while (true) {
        // Retrieve the next line from the source collection.
        // The line index is incremented after retrieval.
        let rawLineSegment = sourceLines[currentLineIndex++];

        // Check if we've unexpectedly run out of lines before finding the end marker.
        if (rawLineSegment === undefined) {
            console.warn("Warning: End of input reached without 'END_OF_TEXT' marker.");
            break; // Exit the loop if no more lines are available.
        }

        // Clean and normalize the current line segment.
        // This includes trimming whitespace and converting to uppercase.
        let normalizedLineContent = rawLineSegment.trim().toUpperCase();

        // Check for the termination signal.
        if (normalizedLineContent === "END_OF_TEXT") {
            break; // Terminate processing upon encountering the designated marker.
        }

        // Split the normalized line content into individual words.
        // Using a regular expression to split by one or more whitespace characters.
        // The filter(Boolean) step removes any empty strings that might result from
        // multiple consecutive spaces or leading/trailing spaces after trim().
        const extractedWords = normalizedLineContent
                                .split(/\s+/)
                                .filter(Boolean); // Ensures only non-empty strings are kept.

        // Iterate through each word extracted from the current line.
        // Using a 'for...of' loop for modern and clear iteration.
        for (const wordCandidate of extractedWords) {
            // Perform a strict comparison (value and type) with the search criterion.
            if (wordCandidate === searchCriterion) {
                totalMatchCount++; // Increment the counter if a match is found.
                // No explicit 'return' statement here, as all words in the line should be checked.
            }
        }
    }

    // Output the final accumulated count of the target word.
    console.log(totalMatchCount);
}

// The execution context remains similar, reading from standard input.
analyzeTextOccurrences(require("fs").readFileSync("/dev/stdin", "utf8"));