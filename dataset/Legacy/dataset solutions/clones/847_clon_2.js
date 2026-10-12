let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// First, the input string is trimmed of leading/trailing whitespace.
// Then, any occurrences of "gg" or "hicken" are removed from the string.
let processedText = (rawData.trim()).replace(/gg|hicken/g, "");

// This loop iteratively replaces all instances of "ee" with "eAe"
// until no more "ee" sequences are found in the string.
while (/ee/.test(processedText)) {
    processedText = processedText.replace(/ee/g, "eAe");
}

// Similarly, this loop replaces all instances of "cc" with "cAc"
// until no more "cc" sequences are present in the string.
while (/cc/.test(processedText)) {
    processedText = processedText.replace(/cc/g, "cAc");
}

// The modified string is then split into an array of substrings,
// using the character "A" as the delimiter.
let segmentList = processedText.split("A");

// A variable is initialized to hold the longest string segment found.
let longestSegment = "";

// The code iterates through each segment in the created array.
segmentList.forEach(function(currentSegment) {
    // If the current segment's length is greater than the length of the
    // currently stored longest segment, it becomes the new longest segment.
    if (longestSegment.length < currentSegment.length) {
        longestSegment = currentSegment;
    }
});

// Finally, the program checks the last character of the longest segment.
// If the last character is "e", it prints "egg"; otherwise, it prints "chicken".
console.log((longestSegment.slice(-1) === "e") ? "egg" : "chicken");
