/*
 * This module processes textual input to find a specific substring.
 * It reads data from standard input, performs string manipulations,
 * and then outputs a particular substring based on its sorted order.
 */
function ProcessInput(incomingData) {
    // Split the raw input into individual lines for further processing.
    incomingData = incomingData.split("\n");

    // Extract the primary string, convert it to lowercase for case-insensitive operations.
    let processedText = incomingData[0].toString().toLowerCase();

    // Parse the integer value for the desired rank (K) from the second line of input.
    let desiredRank = parseInt(incomingData[1]);

    // Determine the total character count of the processed string.
    let textLength = processedText.length;

    /*
     * Potential validation logic for input constraints could be placed here.
     * For instance, checking if 'textLength' is within an acceptable range
     * or if 'desiredRank' falls within expected bounds.
     *
     * // if (textLength < 1 || 5000 < textLength) { /* handle error * / }
     * // if (desiredRank < 1 || 5 < desiredRank) { /* handle error * / }
     */

    // Initialize an array to store all unique substrings found.
    const uniqueSubstrings = [];

    // Declare a temporary variable to hold the current substring being examined.
    let currentSegment = '';

    // Outer loop iterates through all possible starting positions for substrings.
    for (let startPos = 0; startPos <= textLength; startPos++) {
        // Inner loop iterates through all possible ending positions for substrings,
        // starting from the current 'startPos'.
        for (let endPos = startPos; endPos <= textLength; endPos++) {
            // Extract the substring from the 'processedText' using the current start and end positions.
            currentSegment = processedText.substring(startPos, endPos);

            // Check if the current segment is unique, does not contain a newline character,
            // and is not an empty string.
            if (!uniqueSubstrings.includes(currentSegment) && !currentSegment.includes('\n') && currentSegment !== '') {
                // If all conditions are met, add the substring to our collection.
                uniqueSubstrings.push(processedText.substring(startPos, endPos));
            }
        }
    }

    // Sort the collected unique substrings alphabetically.
    uniqueSubstrings.sort();

    // Output the substring at the (desiredRank - 1) index (because arrays are zero-indexed).
    console.log(uniqueSubstrings[desiredRank - 1]);
}

// Read the entire content from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
