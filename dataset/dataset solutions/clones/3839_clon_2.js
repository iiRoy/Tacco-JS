function ProcessInputData(receivedContent) {
    // Divide the incoming data string into an array of lines using the newline character as a delimiter.
    receivedContent = receivedContent.split('\n');

    /*
     * Obtain the primary textual sequence from the first line of the divided input.
     * Ensure it's treated as a string and converted to its lowercase representation.
     */
    let processedText = receivedContent[0].toString().toLowerCase();

    // Parse the integer value from the second line of the input array, which represents the desired position.
    let lookupPos = parseInt(receivedContent[1]);

    // Calculate the overall character length of the prepared text sequence.
    let totalLength = processedText.length;

    // // The subsequent section of code was originally commented out in the source.
    // // It contained preliminary checks for the length of the text and the position value.
    // // if (totalLength < 1 || 5000 < totalLength)
    // //     return;
    // //
    // // if (lookupPos < 1 || 5 < lookupPos)
    // //     return;

    // Initialize an empty array that will store all distinct text segments found.
    let uniqueSegments = [];
    // Declare a temporary variable to hold the current segment being examined during iterations.
    let currentSegment = '';

    // Begin an outer loop, iterating through all possible starting positions for segments within the text.
    for (let startPos = 0; startPos <= totalLength; startPos++) {
        // Nest an inner loop, iterating through all possible ending positions for segments, starting from the current startPos.
        for (let endPos = startPos; endPos <= totalLength; endPos++) {
            // Extract a portion of the processed text based on the current startPos and endPos.
            currentSegment = processedText.substring(startPos, endPos);

            // Verify if the extracted segment is not already in our collection, does not contain line breaks, and is not empty.
            if (!uniqueSegments.includes(currentSegment) && !currentSegment.includes('\n') && currentSegment !== '') {
                // If all conditions are satisfied, add this unique and valid segment to the collection.
                uniqueSegments.push(processedText.substring(startPos, endPos));
            }
        }
    }

    // Arrange the entire collection of unique segments in ascending alphabetical order.
    uniqueSegments.sort();

    // Display the specific segment located at the (lookupPos - 1) index of the sorted array to the console.
    console.log(uniqueSegments[lookupPos - 1]);
}

// Invoke the primary logic function, supplying it with data read from the standard input stream, decoded as UTF-8.
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));