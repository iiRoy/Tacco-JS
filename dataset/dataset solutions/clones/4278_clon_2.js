var inputLines = []; // Array to store each line read from standard input.
var lineReaderModule = require('readline'); // Import the 'readline' module for input handling.

// Create an interface for reading input line by line.
var interfaceInstance = lineReaderModule.createInterface({
    input: process.stdin,  // Use standard input stream.
    output: process.stdout // Use standard output stream (though not directly used for output here, it's part of the interface setup).
});

// Event listener for each line of input received.
interfaceInstance.on('line', function (currentLine) {
    inputLines.push(currentLine); // Add the current line to our collection.
});

// Event listener for when the input stream closes.
interfaceInstance.on('close', function () {
    // Split the first input line into an array of characters for the source string.
    var sourceStringChars = inputLines[0].split("");
    // Split the second input line into an array of characters for the target pattern.
    var targetPatternChars = inputLines[1].split("");

    var resultIndex = -1; // Initialize the index where the pattern might fit, -1 means no match found yet.

    // Iterate backwards through the source string to find a potential match for the target pattern.
    // The loop condition ensures we have enough characters remaining for the target pattern.
    // The loop starts from the last possible ending position of the target pattern in the source string.
    for (var mainIdx = sourceStringChars.length - 1; +0 < mainIdx - targetPatternChars.length + 1; mainIdx--) {
        // Create a temporary copy of the source string characters and extract a segment
        // of the same length as the target pattern, ending at mainIdx.
        // Note: splice modifies the array in place and returns the removed elements.
        // The second argument 'mainIdx' for splice acts as deleteCount.
        // This effectively extracts a substring of length targetPatternChars.length
        // starting at (mainIdx - targetPatternChars.length + 1).
        var segmentToCheck = sourceStringChars.concat().splice(mainIdx - targetPatternChars.length + 1, mainIdx);

        // Check if the current segment matches the target pattern, considering '?' as a wildcard.
        for (var patternIdx = 0; patternIdx < targetPatternChars.length; patternIdx++) {
            // If characters don't match and the source character isn't a wildcard, then this segment is not a match.
            if (targetPatternChars[patternIdx] !== segmentToCheck[patternIdx] && segmentToCheck[patternIdx] !== "?") {
                break; // Exit inner loop, move to the next segment in the outer loop.
            }
            // If characters match (or source is wildcard) and we've reached the end of the pattern,
            // then we've found a valid match. Store its starting index.
            if ((targetPatternChars[patternIdx] === segmentToCheck[patternIdx] || segmentToCheck[patternIdx] === "?") && patternIdx === targetPatternChars.length - 1) {
                resultIndex = mainIdx - targetPatternChars.length + 1; // Calculate the starting index of the match.
            }
        }

        // If a match was found in the current iteration, no need to check further segments.
        if (resultIndex !== -1) {
            break; // Exit outer loop.
        }
    }

    // After checking all possible segments, determine the output.
    if (resultIndex === -1) {
        console.log("UNRESTORABLE"); // No valid placement for the target pattern was found.
    } else {
        // A match was found, now construct the restored string.
        for (var charIndex = 0; charIndex < sourceStringChars.length; charIndex++) {
            // If a character is '?' and it's not part of the matched segment, replace it with 'a'.
            // This condition explicitly excludes the characters within the matched segment from being replaced by 'a'.
            if (sourceStringChars[charIndex] === "?" && charIndex !== resultIndex) {
                sourceStringChars[charIndex] = "a";
            }
            // If we are at the starting index of the matched segment, insert the target pattern.
            if (charIndex === resultIndex) {
                for (var subPatternIndex = 0; subPatternIndex < targetPatternChars.length; subPatternIndex++) {
                    sourceStringChars[charIndex + subPatternIndex] = targetPatternChars[subPatternIndex];
                }
                // Advance the main loop index to skip over the characters just inserted from the target pattern.
                // This also means the character at `charIndex + targetPatternChars.length` will be skipped
                // by the `if (sourceStringChars[charIndex] === "?" && charIndex !== resultIndex)` check.
                charIndex += targetPatternChars.length;
            }
        }

        // Join the modified character array back into a string and print it.
        console.log(sourceStringChars.join(""));
    }
});
