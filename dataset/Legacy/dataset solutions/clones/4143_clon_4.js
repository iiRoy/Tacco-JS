function processInputString(inputData) {
    const firstLine = inputData.split("\n")[0];

    const segmentLengths = (function(sourceString) {
        const lengthsContainer = [];
        if (sourceString.length === 0) {
            return lengthsContainer;
        }

        let currentSegmentChar = sourceString[0];
        let currentSegmentLength = 0;

        for (let charIndex = 0; charIndex < sourceString.length; charIndex++) {
            if (sourceString[charIndex] === currentSegmentChar) {
                currentSegmentLength++;
            } else {
                lengthsContainer.push(currentSegmentLength);
                currentSegmentChar = sourceString[charIndex];
                currentSegmentLength = 1;
            }
        }
        lengthsContainer.push(currentSegmentLength);
        return lengthsContainer;
    })(firstLine);

    const finalResultValue = (function(lengthsCollection) {
        const collectionSize = lengthsCollection.length;

        if (collectionSize === 0) {
            return NaN;
        } else if (collectionSize === 1) {
            return lengthsCollection[0] + lengthsCollection[1];
        } else if (collectionSize === 2) {
            return Math.max(lengthsCollection[0], lengthsCollection[1]);
        } else {
            return lengthsCollection.slice(0, -1).reduce((minimumSum, currentSegment, currentIndex) => {
                const nextSegment = lengthsCollection[currentIndex + 1];
                return Math.min(minimumSum, currentSegment + nextSegment);
            }, lengthsCollection[0] + lengthsCollection[1]);
        }
    })(segmentLengths);

    console.log(finalResultValue);
}

processInputString(require("fs").readFileSync("/dev/stdin", "utf8"));
