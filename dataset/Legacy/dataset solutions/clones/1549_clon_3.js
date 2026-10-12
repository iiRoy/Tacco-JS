const determineMismatchesInSegment = (sourceArray, startIndex, targetArray, targetLen) => {
    let segmentMismatchCount = 0;
    for (let offset = 0; offset < targetLen; offset++) {
        if (targetArray[offset] !== sourceArray[startIndex + offset]) {
            segmentMismatchCount++;
        }
    }
    return segmentMismatchCount;
};

function processInput(rawData) {
    const inputLines = rawData.split("\n");
    const sourceChars = inputLines[0].split("");
    const targetChars = inputLines[1].split("");

    const targetLength = targetChars.length;
    const maxPossibleSourceIndex = sourceChars.length - targetLength;

    let finalMismatchResult; // This variable will hold the mismatch count from the last iteration, or remain undefined if the loop doesn't run.

    for (let sourceIndex = 0; sourceIndex <= maxPossibleSourceIndex; sourceIndex++) {
        finalMismatchResult = determineMismatchesInSegment(sourceChars, sourceIndex, targetChars, targetLength);
    }

    // The original code's 'if (num > t.length)' condition is effectively 'if (false)'
    // when t.length > 0, as num (mismatch count) cannot exceed t.length.
    // If t.length is 0, num is 0, so '0 > 0' is also false.
    // If the loop didn't run, finalMismatchResult is undefined, and 'undefined > targetLength' is false.
    // Thus, it will always execute the else branch, printing finalMismatchResult.
    if (finalMismatchResult > targetLength) {
        console.log(targetLength);
    } else {
        console.log(finalMismatchResult);
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
