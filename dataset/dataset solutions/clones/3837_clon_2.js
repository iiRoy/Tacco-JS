// This function is responsible for processing a given set of input data.
function ProcessInputData(incomingText) {
    // The initial data is split into an array of lines based on newline characters.
    incomingText = incomingText.split("\n");
    
    // The first line is converted to a string and then to lowercase for uniform handling.
    const processedString = incomingText[0].toString().toLowerCase();
    
    // The second line is parsed as an integer, representing a specific rank or index.
    const targetRank = Number.parseInt(incomingText[1], 10);
    
    // Determine the total character count of the processed string.
    const stringCharacterCount = processedString.length;

    // A guard clause to exit early if the string length is outside acceptable boundaries.
    if (stringCharacterCount < 1 || stringCharacterCount > 5000) {
        return;
    }

    // Another guard clause for the target rank, ensuring it's within its valid range.
    if (targetRank < 1 || targetRank > 5) {
        return;
    }

    // An array to store distinct textual segments found within the string.
    let uniqueTextSegments = [];
    // A temporary variable to hold the current segment being evaluated in the loops.
    let currentTextSegment = '';
    
    // Outer loop iterates through all possible starting positions for a segment.
    for (let startPosition = 0; startPosition <= stringCharacterCount; startPosition++) {
        // Inner loop iterates through all possible ending positions for a segment, relative to the start.
        for (let endPosition = startPosition; endPosition <= stringCharacterCount; endPosition++) {
            // Extract the substring based on the current start and end indices.
            currentTextSegment = processedString.substring(startPosition, endPosition);
            /* The following commented-out block illustrates a potential filtering mechanism. */
            /* If activated, it would add only unique and non-empty segments to the collection. */
            // if (!uniqueTextSegments.includes(currentTextSegment) && currentTextSegment.length > 0)
            //     uniqueTextSegments.push(processedString.substring(startPosition, endPosition));
        }
    }
    
    // The collected unique segments are then sorted alphabetically.
    uniqueTextSegments.sort();
    
    // The segment at the calculated rank (adjusted for zero-based indexing) is printed to the console.
    console.log("%s", uniqueTextSegments[targetRank - 1]);
}

// Execute the main processing function with data read from standard input.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));