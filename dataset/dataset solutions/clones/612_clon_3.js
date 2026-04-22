// Core Node.js stream setup: Resume standard input stream and set encoding.
// These actions prepare the environment to receive character-based input.
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Establish an asynchronous event handler for incoming data on the standard input.
// This function will execute each time a block of data is read from the input stream.
process.stdin.on('data', function(inputSegment) {
    // Implement an early exit (guard clause) if the input data is unexpectedly empty or invalid.
    // This prevents errors from attempting to process non-existent data.
    if (!inputSegment || inputSegment.trim().length === 0) {
        return; // No meaningful data to process.
    }

    // Deconstruct the raw input string into an array of individual text lines.
    // Each line is separated by a newline character.
    const lineArray = inputSegment.split('\n');

    // Another guard clause: Ensure there are at least two lines available for configuration
    // (number of iterations and the target pattern string).
    if (lineArray.length < 2) {
        // Insufficient input lines provided.
        return;
    }

    // Extract the numerical value from the first line, representing the count of subsequent
    // search space lines (boards) to process. Trim whitespace and parse as an integer for robustness.
    const numIterations = parseInt(lineArray[0].trim(), 10);

    // Validate the parsed number of iterations. It must be a positive integer.
    if (isNaN(numIterations) || numIterations <= 0) {
        return; // Invalid iteration count, cannot proceed.
    }

    // The second line of input holds the sequence (pattern) that we are trying to find
    // as a subsequence within the subsequent board strings.
    const patternSequence = lineArray[1];

    // Initialize a counter to keep track of how many boards successfully contain the pattern sequence.
    let successfulFinds = 0;

    // Convert the pattern sequence string into an array of its individual characters.
    // This facilitates easier iteration for subsequence matching.
    const targetCharsArray = patternSequence.split('');
    const patternLength = targetCharsArray.length;

    // Edge case handling: If the target pattern itself is empty, no meaningful subsequence can be formed.
    // Output 0 and terminate processing for this input segment.
    if (patternLength === 0) {
        console.log(0);
        return;
    }

    // Begin iterating through the 'board' lines, starting from the third line (index 2)
    // up to the total number of iterations specified.
    // The loop runs for `numIterations` times, processing lines from `lineArray[2]` to `lineArray[2 + numIterations - 1]`.
    for (let rowCounter = 2; rowCounter < 2 + numIterations; rowCounter++) {
        // Ensure that the current line index is within the bounds of the actual input array.
        // This is a safety check against malformed input where 'numIterations' might exceed available lines.
        if (rowCounter >= lineArray.length) {
            break; // No more input lines to process.
        }

        // Retrieve the current board string (search space) for the present iteration.
        const currentBoard = lineArray[rowCounter];

        // Skip processing if the current board string is empty or undefined,
        // as an empty string cannot contain any non-empty subsequence.
        if (!currentBoard || currentBoard.length === 0) {
            continue; // Move to the next board.
        }

        // --- Core Subsequence Matching Logic ---
        // `currentSearchPosition` tracks the absolute index in `currentBoard` from which
        // the search for the *next* character in `patternSequence` should begin.
        let currentSearchPosition = 0;
        // `canFormSequence` acts as a boolean flag to indicate if the pattern has been
        // successfully found as a subsequence within the `currentBoard`.
        let canFormSequence = true;

        // Iterate over each character in the `targetCharsArray` (the pattern sequence).
        for (let sequencePosition = 0; sequencePosition < patternLength; sequencePosition++) {
            const charToFind = targetCharsArray[sequencePosition];

            // Use `indexOf` to locate the `charToFind` within `currentBoard`.
            // The search starts from `currentSearchPosition`, ensuring that characters
            // are found in their correct relative order (subsequence property).
            const charOccurrence = currentBoard.indexOf(charToFind, currentSearchPosition);

            // If `indexOf` returns -1, the character was not found in the remaining part of the board.
            // This means the full pattern sequence cannot be formed.
            if (charOccurrence === -1) {
                canFormSequence = false;
                break; // Exit the inner loop immediately, no need to check further characters.
            }
            // If found, update `currentSearchPosition` to point to the character *immediately after*
            // the one just found. This ensures the next character in the pattern is searched
            // strictly later in the board string.
            currentSearchPosition = charOccurrence + 1;
        }

        // After checking all characters in the pattern, if `canFormSequence` is still true,
        // it means the entire pattern was found as a subsequence in the `currentBoard`.
        if (canFormSequence) {
            successfulFinds++; // Increment the counter for successful matches.
        }
    }

    // After processing all specified board lines, print the final tally of successful finds.
    console.log(successfulFinds);
});