function countMismatches(segmentString, patternString) {
    let mismatchCounter = 0;
    const patternLength = patternString.length;
    for (let charIndex = 0; charIndex < patternLength; charIndex++) {
        if (segmentString[charIndex] !== patternString[charIndex]) {
            mismatchCounter++;
        }
    }
    return mismatchCounter;
}

function processInputData(rawData) {
    const linesOfText = rawData.split("\n");

    const sourceString = linesOfText[0];
    const targetString = linesOfText[1];

    const sourceLength = sourceString.length;
    const targetLength = targetString.length;

    if (targetLength === 0) {
        console.log(0);
        return;
    }

    let minDifferenceCount = targetLength;

    for (let sourceIndex = 0; sourceIndex < sourceLength - targetLength; sourceIndex++) {
        const currentSegment = sourceString.substring(sourceIndex, sourceIndex + targetLength);

        const currentDifferences = countMismatches(currentSegment, targetString);

        if (currentDifferences < minDifferenceCount) {
            minDifferenceCount = currentDifferences;
        }
    }

    console.log(minDifferenceCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
