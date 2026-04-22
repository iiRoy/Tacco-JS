function evaluateStringSegments(incomingContent) {
    const initialSegment = incomingContent.split('\n')[0];

    function decomposeStringIntoLengths(sourceText) {
        const collectedLengths = [];
        const segmentPattern = /(.)\1*/g;
        let matchedSegment;
        while ((matchedSegment = segmentPattern.exec(sourceText)) !== null) {
            collectedLengths.push(matchedSegment[0].length);
        }
        return collectedLengths;
    }

    const characterGroups = decomposeStringIntoLengths(initialSegment);

    let resultValue;

    switch (characterGroups.length) {
        case 0:
        case 1:
            resultValue = Number.NaN;
            break;
        case 2:
            resultValue = Math.max(characterGroups[0], characterGroups[1]);
            break;
        default:
            const minimumAdjacentSum = characterGroups.slice(0, -1).reduce((accumulator, currentBlockLength, index) => {
                const nextBlockLength = characterGroups[index + 1];
                const currentPairSum = currentBlockLength + nextBlockLength;
                return Math.min(accumulator, currentPairSum);
            }, Infinity);
            resultValue = minimumAdjacentSum;
            break;
    }

    console.log(resultValue);
}

evaluateStringSegments(require("fs").readFileSync("/dev/stdin", "utf8"));