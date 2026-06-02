var inputLines = [];
var ioHandler = require('readline');

var lineReader = ioHandler.createInterface({
    input: process.stdin,
    output: process.stdout,
});

lineReader.on('line', function (currentLine) {
    inputLines.push(currentLine);
});

lineReader.on('close', function () {
    var sourceChars = inputLines[0].split("");
    var targetChars = inputLines[1].split("");

    var matchStartIndex = -1;

    const sourceLength = sourceChars.length;
    const targetLength = targetChars.length;

    // Iterate backwards through the source string to find the rightmost possible match.
    // The loop condition 'outerIdx >= targetLength - 1' ensures that there's enough
    // remaining length in sourceChars to accommodate targetChars.
    for (var outerIdx = sourceLength - 1; outerIdx >= targetLength - 1; outerIdx--) {
        // Calculate the potential starting position for the current segment in sourceChars.
        const currentSegmentStart = outerIdx - targetLength + 1;
        let isCurrentSegmentMatch = true;

        // Compare the segment of sourceChars (starting at currentSegmentStart)
        // with the targetChars pattern.
        for (var patternIdx = 0; patternIdx < targetLength; patternIdx++) {
            const targetChar = targetChars[patternIdx];
            const segmentChar = sourceChars[currentSegmentStart + patternIdx];

            // If characters don't match and the segment character is not a wildcard '?',
            // then this segment is not a match.
            if (targetChar !== segmentChar && segmentChar !== "?") {
                isCurrentSegmentMatch = false;
                break;
            }
        }

        // If the inner loop completed without finding a mismatch, a full match was found.
        if (isCurrentSegmentMatch) {
            matchStartIndex = currentSegmentStart;
            break; // Found the rightmost match, no need to check further.
        }
    }

    // Based on whether a match was found, construct and print the final string.
    if (matchStartIndex === -1) {
        console.log("UNRESTORABLE");
    } else {
        // Create a new array to store the characters of the final output string.
        let finalOutputChars = new Array(sourceLength);

        for (var charIndex = 0; charIndex < sourceLength; charIndex++) {
            // Determine if the current character index falls within the range of the matched segment.
            const isWithinMatchedRange = charIndex >= matchStartIndex && charIndex < matchStartIndex + targetLength;

            if (isWithinMatchedRange) {
                // If inside the matched segment, use the corresponding character from targetChars.
                finalOutputChars[charIndex] = targetChars[charIndex - matchStartIndex];
            } else if (sourceChars[charIndex] === "?") {
                // If '?' outside the matched segment, replace it with 'a'.
                finalOutputChars[charIndex] = "a";
            } else {
                // Otherwise, keep the original character from sourceChars.
                finalOutputChars[charIndex] = sourceChars[charIndex];
            }
        }
        console.log(finalOutputChars.join(""));
    }
});
