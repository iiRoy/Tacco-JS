let acquiredData = '';

process.stdin.on('data', function (segment) {
    acquiredData += segment.toString();
});

process.stdin.on('end', function () {
    let lineSegments = [];
    let currentSegmentBuffer = '';
    let cursorPosition = 0;
    const totalDataLength = acquiredData.length;

    // Custom line segmentation (mimics .split('\n'))
    while (cursorPosition < totalDataLength) {
        let symbol = acquiredData[cursorPosition];
        if (symbol === '\n') {
            lineSegments.push(currentSegmentBuffer);
            currentSegmentBuffer = '';
        } else {
            currentSegmentBuffer += symbol;
        }
        cursorPosition++;
    }
    // Add the final segment. This handles cases where input doesn't end with a newline,
    // or ends with multiple newlines (like `split('\n')` behavior).
    lineSegments.push(currentSegmentBuffer);

    let requiredSentence;
    if (lineSegments.length > 1) {
        requiredSentence = lineSegments[1];
    } else {
        // This will cause a TypeError when `requiredSentence.length` is accessed,
        // mimicking the original code's error if `[1]` is undefined.
        requiredSentence = undefined;
    }

    let wordUnits = [];
    let currentWordBuffer = '';

    // Custom word segmentation (mimics .split(' '))
    // This loop will throw if requiredSentence is undefined, matching the original's error behavior.
    for (let charPointer = 0; charPointer < requiredSentence.length; charPointer++) {
        let currentSymbol = requiredSentence[charPointer];
        if (currentSymbol === ' ') {
            wordUnits.push(currentWordBuffer);
            currentWordBuffer = '';
        } else {
            currentWordBuffer += currentSymbol;
        }
    }
    // Add the final word unit
    wordUnits.push(currentWordBuffer);

    let finalOutputString = '';
    // Custom reversal and joining (mimics .reverse().join(' '))
    for (let index = wordUnits.length - 1; index >= 0; index--) {
        finalOutputString += wordUnits[index];
        if (index > 0) {
            finalOutputString += ' ';
        }
    }

    process.stdout.write(finalOutputString + '\n');
});