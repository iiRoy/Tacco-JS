function ProcessInputData(rawTextLines) {
    // Split the incoming raw text into individual lines based on newline characters.
    rawTextLines = rawTextLines.split("\n");

    // Extract the first line, convert it to a string, and then to lowercase.
    var targetString = rawTextLines[0].toString().toLowerCase();

    // Parse the second line as an integer to get the desired rank.
    var rankValue = parseInt(rawTextLines[1]);

    // Determine the total number of characters in the target string.
    var charCount = targetString.length;

    // Validate the length of the target string.
    // If it's outside the acceptable range [1, 5000], terminate execution.
    if (charCount < 1 || 5000 < charCount) {
        return;
    }

    // Validate the rank value.
    // If it's outside the acceptable range [1, 5], terminate execution.
    if (rankValue < 1 || 5 < rankValue) {
        return;
    }

    // Initialize an array to potentially store unique substrings.
    var collectedSubstrings = [];

    // Initialize a temporary variable to hold each generated substring.
    var currentSlice = '';

    // Outer loop iterates from the beginning of the string to its end.
    for (var outerLoopIdx = 0; outerLoopIdx <= charCount; outerLoopIdx++) {
        // Inner loop iterates from the current outer loop index to the end of the string.
        for (var innerLoopIdx = outerLoopIdx; innerLoopIdx <= charCount; innerLoopIdx++) {
            // Extract a substring using the current loop indices.
            currentSlice = targetString.substring(outerLoopIdx, innerLoopIdx);
            // The following commented-out block was intended to populate the array,
            // but it is currently inactive, meaning 'collectedSubstrings' remains empty.
            // if (!collectedSubstrings.includes(currentSlice) && currentSlice !== '')
            //     collectedSubstrings.push(targetString.substring(outerLoopIdx, innerLoopIdx));
        }
    }

    // Sort the (currently empty) array of collected substrings.
    collectedSubstrings.sort();

    // Output the element at the (rankValue - 1) index.
    // Since 'collectedSubstrings' is empty, this will print 'undefined'.
    console.log("%s", collectedSubstrings[rankValue - 1]);
}

// Invoke the main processing function with data read from standard input.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
