process.stdin.on('data', (dataBuffer) => {
    const inputLine = dataBuffer.toString();
    const parsedSegments = [];
    let segmentStart = 0;

    // Imperative parsing to mimic String.prototype.split(' ') behavior
    for (let currentPos = 0; currentPos < inputLine.length; currentPos++) {
        const charValue = inputLine[currentPos];
        if (charValue === ' ') {
            parsedSegments.push(inputLine.substring(segmentStart, currentPos));
            segmentStart = currentPos + 1;
        }
    }
    // Add the last segment after the loop, or if no spaces were found
    parsedSegments.push(inputLine.substring(segmentStart));

    // Imperative sorting (Selection Sort) for strings, comparing numerically
    const segmentCount = parsedSegments.length;
    for (let currentPos = 0; currentPos < segmentCount - 1; currentPos++) {
        let smallestSegment = parsedSegments[currentPos];
        let smallestNumericValue = Number(smallestSegment);
        let smallestIndex = currentPos;

        for (let comparePos = currentPos + 1; comparePos < segmentCount; comparePos++) {
            const segmentToCompare = parsedSegments[comparePos];
            const numericValueToCompare = Number(segmentToCompare);

            if (numericValueToCompare < smallestNumericValue) {
                smallestNumericValue = numericValueToCompare;
                smallestSegment = segmentToCompare; // Keep the string representation
                smallestIndex = comparePos;
            }
        }
        // Swap elements if a smaller one was found
        if (smallestIndex !== currentPos) {
            const temporarySegment = parsedSegments[currentPos];
            parsedSegments[currentPos] = parsedSegments[smallestIndex];
            parsedSegments[smallestIndex] = temporarySegment;
        }
    }

    // Imperative joining of sorted segments
    let outputString = '';
    const finalSegmentCount = parsedSegments.length;
    if (finalSegmentCount > 0) {
        outputString += parsedSegments[0];
        for (let currentPos = 1; currentPos < finalSegmentCount; currentPos++) {
            outputString += ' ' + parsedSegments[currentPos];
        }
    }

    console.log(outputString);
});
