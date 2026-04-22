(function(sourceData){
    let firstSeparatorPosition = -1;
    let secondSeparatorPosition = -1;
    let scanPointer = 0;

    while (scanPointer < sourceData.length) {
        if (sourceData[scanPointer] === '\n') {
            if (firstSeparatorPosition === -1) {
                firstSeparatorPosition = scanPointer;
            } else {
                secondSeparatorPosition = scanPointer;
                break;
            }
        }
        scanPointer++;
    }

    let segmentContent;
    // Replicate the original's `input.split("\n")[1]` behavior for undefined
    if (firstSeparatorPosition === -1) {
        // No newline found, so `input.split("\n")` would yield `["entire_string"]` or `[""]`.
        // `[1]` would then be `undefined`.
        segmentContent = undefined;
    } else {
        // At least one newline found.
        // The target segment begins after the first newline.
        let startOfSegment = firstSeparatorPosition + 1;
        // The target segment ends at the second newline, or at the end of the string if no second newline.
        let endOfSegment = (secondSeparatorPosition !== -1) ? secondSeparatorPosition : sourceData.length;
        segmentContent = sourceData.substring(startOfSegment, endOfSegment);
    }

    // If segmentContent is undefined, accessing a method on it will cause a TypeError,
    // mimicking the original's `undefined.split(" ")`.
    if (segmentContent === undefined) {
        segmentContent.charAt(0); // This line will throw TypeError
    }

    let resultPieces = [];
    let currentFragment = [];

    // Iterate backwards through the segment to collect words in reverse order
    for (let currentPos = segmentContent.length - 1; currentPos >= 0; currentPos--) {
        let charElement = segmentContent[currentPos];
        if (charElement === ' ') {
            if (currentFragment.length > 0) {
                // A word has been built (in reverse order), reverse it back and add to results
                resultPieces.push(currentFragment.reverse().join(''));
                currentFragment = []; // Reset for the next word
            }
        } else {
            currentFragment.push(charElement); // Build word characters in reverse
        }
    }
    // Add the very first word (which is the last one encountered in backward iteration)
    if (currentFragment.length > 0) {
        resultPieces.push(currentFragment.reverse().join(''));
    }

    // Join the reversed words with spaces and output, adding a newline at the end
    process.stdout.write(resultPieces.join(' ') + '\n');
})(require("node:fs").readFileSync("/dev/stdin", "utf8"));