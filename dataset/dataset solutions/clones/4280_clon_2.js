let inputBuffer = []; // Array to store all lines read from standard input.
const readline = require('readline'); // Import the 'readline' module for input handling.

// Create an interface for reading input line by line.
let inputHandler = readline.createInterface({
    input: process.stdin, // Use standard input stream.
    output: process.stdout, // Use standard output stream (though not directly used for output here).
});

// Event listener for each line of input received.
inputHandler.on('line', function (currentLine) {
    inputBuffer.push(currentLine); // Add the current line to our buffer.
});

// Event listener for when the input stream is closed.
inputHandler.on('close', function () {
    // Parse the input data.
    let sourceChars = inputBuffer[0].split(""); // The first line is the source string, split into characters.
    let targetChars = inputBuffer[1].split(""); // The second line is the target string, split into characters.

    let matchStartIndex = -1; // This variable will store the starting index of the rightmost valid match, or -1 if none found.

    // Iterate backwards through the source character array to find the rightmost possible match.
    // The loop condition ensures there's enough space for the target string.
    for (let outerIdx = sourceChars.length - 1; outerIdx >= targetChars.length - 1; outerIdx--) {
        // Extract a segment from the source string that has the same length as the target string.
        // We use concat() to create a shallow copy before slicing to avoid modifying the original array.
        let segmentToCheck = sourceChars.concat().slice(outerIdx - targetChars.length + 1, outerIdx + 1);

        let currentSegmentMatches = true; // Assume the current segment is a match until proven otherwise.

        // Compare the extracted segment with the target string character by character.
        for (let innerIdx = 0; innerIdx < targetChars.length; innerIdx++) {
            // If characters don't match AND the source character is not a wildcard '?', then it's not a valid match.
            if (targetChars[innerIdx] !== segmentToCheck[innerIdx] && segmentToCheck[innerIdx] !== "?") {
                currentSegmentMatches = false; // Mark as no match.
                break; // No need to check further characters in this segment.
            }
        }

        // If the current segment was a match, record its starting index and exit the outer loop.
        // Since we are iterating backwards, the first match found will be the rightmost one.
        if (currentSegmentMatches) {
            matchStartIndex = outerIdx - targetChars.length + 1; // Calculate the actual starting position.
            break; // Stop searching as the rightmost match is found.
        }
    }

    // Determine the final output based on whether a match was found.
    if (matchStartIndex === -1) {
        console.log("UNRESTORABLE"); // If no match was found, print "UNRESTORABLE".
    } else {
        // If a match was found, reconstruct the source string.
        for (let outerIdx = 0; outerIdx < sourceChars.length; outerIdx++) {
            // If the current character is a '?' and it's not part of the matched segment, replace it with 'a'.
            // The condition `outerIdx !== matchStartIndex` is sufficient because the `if (outerIdx === matchStartIndex)` block
            // will handle the replacement for the matched segment.
            if (sourceChars[outerIdx] === "?" && outerIdx !== matchStartIndex) {
                sourceChars[outerIdx] = "a"; // Default replacement for '?' outside the target.
            }

            // If the current index is the beginning of the matched target string.
            if (outerIdx === matchStartIndex) {
                // Copy the target string characters into the source string.
                for (let innerIdx = 0; innerIdx < targetChars.length; innerIdx++) {
                    sourceChars[outerIdx + innerIdx] = targetChars[innerIdx]; // Place the target character.
                }
                // Adjust the outer loop index to skip over the characters that were just inserted.
                // The loop's own increment will then move to the character immediately after the inserted target string.
                outerIdx += targetChars.length - 1;
            }
        }
        console.log(sourceChars.join("")); // Print the final, restored string.
    }
});
