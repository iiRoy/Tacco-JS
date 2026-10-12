var inputBuffer = [];
var ioInterface = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

ioInterface.on('line', function (inputLine) {
    inputBuffer.push(inputLine);
});

ioInterface.on('close', function () {
    const sourceChars = inputBuffer[0].split("");
    const targetChars = inputBuffer[1].split("");

    // Helper function to determine if a segment of the source string matches the target pattern
    // considering '?' as a wildcard.
    const evaluateSegmentMatch = (segment, pattern) => {
        // This check is mostly for robustness; segment length should match pattern length
        // due to how slices are generated.
        if (segment.length !== pattern.length) {
            return false;
        }
        // Use 'every' to check if all characters in the pattern match the segment
        // or if the segment character is a wildcard.
        return pattern.every((patternChar, charIndex) => {
            const segmentChar = segment[charIndex];
            return patternChar === segmentChar || segmentChar === '?';
        });
    };

    let finalMatchPosition = -1;

    // Generate an array of all possible starting indices for the target pattern within the source string.
    // The length of this array is `sourceChars.length - targetChars.length + 1`.
    // If targetChars is longer than sourceChars, this array will be empty.
    const possibleStartIndices = Array.from(
        { length: Math.max(0, sourceChars.length - targetChars.length + 1) },
        (_, index) => index
    );

    // Use Array.prototype.reduceRight to iterate through possible starting indices from right to left.
    // This ensures that the rightmost valid match is found first.
    finalMatchPosition = possibleStartIndices.reduceRight((currentBestIndex, candidateIndex) => {
        // If a rightmost match has already been identified, propagate it.
        if (currentBestIndex !== -1) {
            return currentBestIndex;
        }

        // Extract the segment from the source string for the current candidate index.
        const segmentToExamine = sourceChars.slice(candidateIndex, candidateIndex + targetChars.length);

        // Check if this segment matches the target pattern.
        if (evaluateSegmentMatch(segmentToExamine, targetChars)) {
            return candidateIndex; // This is the rightmost match found so far.
        }

        return -1; // No match at this position, continue searching.
    }, -1); // Initial value for currentBestIndex is -1 (no match found yet).


    if (finalMatchPosition === -1) {
        console.log("UNRESTORABLE");
    } else {
        // Construct the final string by combining three parts:
        // 1. The part of sourceChars before the match, with '?' replaced by 'a'.
        // 2. The targetChars pattern itself.
        // 3. The part of sourceChars after the match, with '?' replaced by 'a'.

        // Process the leading part of the source string.
        const leadingPart = sourceChars.slice(0, finalMatchPosition).map(char => char === '?' ? 'a' : char);

        // Process the trailing part of the source string.
        const trailingPart = sourceChars.slice(finalMatchPosition + targetChars.length).map(char => char === '?' ? 'a' : char);

        // Combine the three parts using spread syntax and then join them into a single string.
        const reconstructedString = [...leadingPart, ...targetChars, ...trailingPart].join("");
        console.log(reconstructedString);
    }
});
