(function (sourceText) {
    function* linePairProducer(fullInputContent) {
        const contentLines = fullInputContent.replace(/\r/g, '').split('\n');
        let currentLinePointer = 0;
        while (true) {
            const firstSegment = contentLines[currentLinePointer++];
            if (firstSegment === undefined || firstSegment === '') {
                break;
            }
            const secondSegment = contentLines[currentLinePointer++];
            yield [firstSegment, secondSegment];
        }
    }

    for (const [segmentOne, segmentTwo] of linePairProducer(sourceText)) {
        let shorterString, longerString;

        if (segmentOne.length < segmentTwo.length) {
            shorterString = segmentOne;
            longerString = segmentTwo;
        } else {
            shorterString = segmentTwo;
            longerString = segmentOne;
        }

        let longestMatchLength = 0;
        const shorterStringLength = shorterString.length;

        for (let currentSubLength = shorterStringLength; currentSubLength >= 1; currentSubLength--) {
            let foundLengthInThisIteration = false;
            for (let currentStartIndex = 0; currentStartIndex < shorterStringLength - currentSubLength; currentStartIndex++) {
                const candidateFragment = shorterString.substring(currentStartIndex, currentStartIndex + currentSubLength);

                if (longerString.indexOf(candidateFragment) > 0) {
                    longestMatchLength = currentSubLength;
                    foundLengthInThisIteration = true;
                    break;
                }
            }
            if (foundLengthInThisIteration) {
                break;
            }
        }
        console.log(longestMatchLength);
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));
