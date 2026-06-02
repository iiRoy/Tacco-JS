const fileSystem = require("fs");
const fullContent = fileSystem.readFileSync("/dev/stdin", "utf8");

let firstNewlinePosition = fullContent.indexOf('\n');
let targetLineSegment = "";

// Extract the second line from the input content.
// This replaces the `split("\n")[1]` part of the original.
// It uses `indexOf` to find newline characters and `substring` to extract the relevant portion,
// avoiding the creation of a full array of all lines.
if (firstNewlinePosition !== -1) {
    let secondNewlinePosition = fullContent.indexOf('\n', firstNewlinePosition + 1);
    if (secondNewlinePosition !== -1) {
        // If a second newline is found, extract the segment between the first and second newlines.
        targetLineSegment = fullContent.substring(firstNewlinePosition + 1, secondNewlinePosition);
    } else {
        // If only one newline is found, the second line extends to the end of the content.
        targetLineSegment = fullContent.substring(firstNewlinePosition + 1);
    }
}
// If `firstNewlinePosition` is -1 (no newlines), or if there's no content after the first newline
// (e.g., "line1\n"), `targetLineSegment` correctly remains an empty string,
// matching the behavior of `split("\n")[1]` for these edge cases.

let manualTokens = [];
let lastDelimiterBoundary = -1; // Represents the index *before* the first character or after the last space.

// Manually split the `targetLineSegment` by space, replicating the exact behavior of `String.prototype.split(' ')`.
// This replaces the `split(" ")` part of the original.
// It correctly handles leading/trailing spaces, multiple consecutive spaces, and empty strings.
for (let i = 0; i < targetLineSegment.length; i++) {
    if (targetLineSegment[i] === ' ') {
        manualTokens.push(targetLineSegment.substring(lastDelimiterBoundary + 1, i));
        lastDelimiterBoundary = i;
    }
}
// After the loop, add the last segment (which could be an empty string if the line ends with a space,
// or the last word if the line does not end with a space).
manualTokens.push(targetLineSegment.substring(lastDelimiterBoundary + 1));

// If the `targetLineSegment` was initially empty, `manualTokens` will correctly be `[""]`,
// matching `"".split(" ")`.

// Reverse the order of tokens and join them with spaces using `reduceRight`.
// This replaces the `.reverse().join(' ')` part of the original,
// using a different functional approach to achieve the same result.
const finalOutput = manualTokens.reduceRight((accumulator, currentSegment) => {
    // If the accumulator is not empty, it means we've already processed at least one segment
    // from the right, so we prepend a space before adding the current segment.
    // Otherwise, it's the first segment being processed, so no leading space is needed.
    return accumulator.length > 0 ? accumulator + ' ' + currentSegment : currentSegment;
}, "");

console.log(finalOutput);
