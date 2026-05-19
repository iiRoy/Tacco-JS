var lines = [];
var readline = require('readline');

var inputReader = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputReader.on('line', function (lineContent) {
    lines.push(lineContent);
});

// Helper function to determine if a given slice of the source string
// matches the pattern string, considering '?' as a wildcard.
function checkPotentialMatch(sourceSegment, patternChars) {
    const patternLength = patternChars.length;
    for (let charIdx = 0; charIdx < patternLength; charIdx++) {
        // If characters don't match and the source character isn't a wildcard, it's not a match.
        if (patternChars[charIdx] !== sourceSegment[charIdx] && sourceSegment[charIdx] !== "?") {
            return false;
        }
    }
    return true; // All characters matched or were wildcards
}

inputReader.on('close', function () {
    var sourceChars = lines[0].split("");
    var patternChars = lines[1].split("");

    const sourceLength = sourceChars.length;
    const patternLength = patternChars.length;

    var matchStartIndex = -1; // Stores the starting index of the rightmost successful match

    // Iterate from the rightmost possible end position of the pattern in the source string.
    // The loop condition `endIdx >= patternLength - 1` ensures that `currentMatchStart` is non-negative.
    // The original loop condition `0 < i - T.length + 1` implies `i - T.length + 1 >= 1`, so `i >= T.length`.
    // Thus, `endIdx` (which is `i`) must be at least `patternLength`.
    // So, `endIdx` goes from `sourceLength - 1` down to `patternLength - 1`.
    for (let endIdx = sourceLength - 1; endIdx >= patternLength - 1; endIdx--) {
        const currentMatchStart = endIdx - patternLength + 1;

        // Extract the segment of the source string to compare.
        // The original code's `splice(start, i)` effectively returned `source[start...i]`.
        // `slice(start, end + 1)` replicates this behavior.
        const currentSourceSegment = sourceChars.slice(currentMatchStart, endIdx + 1);

        if (checkPotentialMatch(currentSourceSegment, patternChars)) {
            matchStartIndex = currentMatchStart;
            break; // Found the rightmost match, so we can stop searching.
        }
    }

    if (matchStartIndex === -1) {
        console.log("UNRESTORABLE");
    } else {
        // Create a new array to build the restored string, avoiding complex in-place modifications.
        const restoredStringArray = Array(sourceLength);

        for (let k = 0; k < sourceLength; k++) {
            // Check if the current character position `k` falls within the matched pattern.
            if (k >= matchStartIndex && k < matchStartIndex + patternLength) {
                // If it's part of the matched pattern, use the character from the pattern.
                restoredStringArray[k] = patternChars[k - matchStartIndex];
            } else if (sourceChars[k] === "?") {
                // If it's a wildcard outside the matched pattern, replace it with 'a'.
                restoredStringArray[k] = "a";
            } else {
                // Otherwise, keep the original character from the source string.
                restoredStringArray[k] = sourceChars[k];
            }
        }
        console.log(restoredStringArray.join(""));
    }
});
