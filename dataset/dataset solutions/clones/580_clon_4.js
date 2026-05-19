(function (rawData) {
    const lineSegments = rawData.replace(/\r/g, '').split("\n");
    let segmentPointer = 0;

    const obtainAllSubstrings = (sourceText) => {
        const collection = [];
        for (let startPosition = 0; startPosition < sourceText.length; startPosition++) {
            for (let endPosition = startPosition + 1; endPosition <= sourceText.length; endPosition++) {
                collection.push(sourceText.substring(startPosition, endPosition));
            }
        }
        return collection;
    };

    while (true) {
        const firstSegment = lineSegments[segmentPointer++];
        if (firstSegment === '') {
            break;
        }
        const secondSegment = lineSegments[segmentPointer++];

        let shortSegment, longSegment;
        if (firstSegment.length < secondSegment.length) {
            shortSegment = firstSegment;
            longSegment = secondSegment;
        } else {
            shortSegment = secondSegment;
            longSegment = firstSegment;
        }

        const substringsOfShorter = obtainAllSubstrings(shortSegment);

        const greatestLength = substringsOfShorter.reduce((currentMax, subCandidate) => {
            return longSegment.includes(subCandidate) ? Math.max(currentMax, subCandidate.length) : currentMax;
        }, 0);

        console.log(greatestLength);
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));
