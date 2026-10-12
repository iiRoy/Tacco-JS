function processInput(rawData) {
    var inputLines = rawData.split("\n");
    var targetString = inputLines[0];

    var calculateSegmentLengths = function(currentSegment, segmentLengthsAccumulator) {
        const segmentLength = currentSegment.length;
        if (segmentLength === 0) {
            return segmentLengthsAccumulator;
        }

        const firstCharInSegment = currentSegment[0];
        let remainingSegmentAfterBunch = "";
        let currentBunchSize = 0;

        for (let idx = 0; idx < segmentLength; idx++) {
            if (currentSegment[idx] !== firstCharInSegment) {
                currentBunchSize = idx;
                remainingSegmentAfterBunch = currentSegment.slice(idx);
                break;
            } else if (idx === segmentLength - 1) {
                currentBunchSize = idx + 1;
                remainingSegmentAfterBunch = "";
                break;
            }
        }

        segmentLengthsAccumulator.push(currentBunchSize);

        if (remainingSegmentAfterBunch.length > 0) {
            return calculateSegmentLengths(remainingSegmentAfterBunch, segmentLengthsAccumulator);
        } else {
            return segmentLengthsAccumulator;
        }
    };

    var resultValue = 0;
    var segmentLengths = calculateSegmentLengths(targetString, []);

    const numberOfSegments = segmentLengths.length;

    if (numberOfSegments === 2) {
        resultValue = Math.max(segmentLengths[0], segmentLengths[1]);
    } else {
        let minimumAdjacentSum = segmentLengths[0] + segmentLengths[1];

        for (let k = 0; k < numberOfSegments - 1; k++) {
            const currentAdjacentPairSum = segmentLengths[k] + segmentLengths[k + 1];
            minimumAdjacentSum = Math.min(minimumAdjacentSum, currentAdjacentPairSum);
        }
        resultValue = minimumAdjacentSum;
    }

    console.log(resultValue);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
