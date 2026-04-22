let inputAccumulatedString = '';

process.stdin.on('data', (inputChunk) => {
    inputAccumulatedString += inputChunk.toString();
});

process.stdin.on('end', () => {
    const finalOutcome = calculateOptimalSplit(inputAccumulatedString.trim());
    console.log(finalOutcome);
});

const calculateOptimalSplit = (inputLineData) => {
    const [dimensionA, dimensionB] = inputLineData.split(' ').map(Number);

    const generateNumericSequence = (beginValue, endValue) =>
        Array.from({ length: endValue - beginValue + 1 }, (_, index) => beginValue + index);

    const determineValueSpread = (valueCollection) => {
        if (!valueCollection || valueCollection.length === 0) return Number.MAX_SAFE_INTEGER;
        const sortedSet = [...valueCollection].sort((val1, val2) => val1 - val2);
        return sortedSet[sortedSet.length - 1] - sortedSet[0];
    };

    const evaluateSplitConfiguration = (lengthDimension, widthDimension) => {
        if (lengthDimension < 3) {
            return Number.MAX_SAFE_INTEGER;
        }

        let bestObservedSpread = Number.MAX_SAFE_INTEGER;

        generateNumericSequence(1, lengthDimension - 2).forEach(firstCutPoint => {
            const remainingLength = lengthDimension - firstCutPoint;
            const segmentTwoLength = Math.floor(remainingLength / 2);
            const segmentThreeLength = Math.ceil(remainingLength / 2);

            const areasScenarioOne = [
                firstCutPoint * widthDimension,
                segmentTwoLength * widthDimension,
                segmentThreeLength * widthDimension
            ];
            bestObservedSpread = Math.min(bestObservedSpread, determineValueSpread(areasScenarioOne));

            const subPieceWidthOne = Math.floor(widthDimension / 2);
            const subPieceWidthTwo = Math.ceil(widthDimension / 2);

            const areasScenarioTwo = [
                firstCutPoint * widthDimension,
                (lengthDimension - firstCutPoint) * subPieceWidthOne,
                (lengthDimension - firstCutPoint) * subPieceWidthTwo
            ];
            bestObservedSpread = Math.min(bestObservedSpread, determineValueSpread(areasScenarioTwo));
        });

        return bestObservedSpread;
    };

    let overallLowestDifference = Number.MAX_SAFE_INTEGER;

    overallLowestDifference = Math.min(overallLowestDifference, evaluateSplitConfiguration(dimensionA, dimensionB));
    overallLowestDifference = Math.min(overallLowestDifference, evaluateSplitConfiguration(dimensionB, dimensionA));

    return overallLowestDifference;
};