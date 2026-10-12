// This function processes raw text input to count occurrences of a specific word.
function ProcessTextData(initialInput) {
    // Split the entire input string into an array of individual lines.
    let processedLines = initialInput.split('\n');

    // Extract the first line, which is the word we are looking for.
    let searchTarget = processedLines.shift();
    // Convert the target word to uppercase for case-insensitive matching.
    searchTarget = searchTarget.toUpperCase();

    // Extract the next line to start processing the text body.
    let currentTextSegment = processedLines.shift();
    // Convert this line to uppercase as well.
    currentTextSegment = currentTextSegment.toUpperCase();

    // Initialize a counter for the number of times the target word is found.
    let occurrenceCount = 0;

    // Loop through the text until the "END_OF_TEXT" marker is encountered.
    while (currentTextSegment !== "END_OF_TEXT") {
        // Split the current line into individual words/tokens using whitespace or newlines as delimiters.
        let tokensInLine = currentTextSegment.split(/\s|\n/);

        // Iterate over each token in the current line.
        tokensInLine.forEach(function(singleToken) {
            // If the current token matches our target word, increment the counter.
            if (singleToken === searchTarget) {
                occurrenceCount++;
                // The 'return' here exits the current iteration of the forEach callback,
                // not the outer while loop or the function itself.
                return;
            }
        });

        // Get the next line from the input array for the next iteration.
        currentTextSegment = processedLines.shift();
        // Convert the new line to uppercase.
        currentTextSegment = currentTextSegment.toUpperCase();
    }

    // Output the final count of the target word occurrences.
    console.log(occurrenceCount);
}

// Read the entire content from standard input and pass it to our processing function.
ProcessTextData(require('fs').readFileSync('/dev/stdin', 'utf8'));
