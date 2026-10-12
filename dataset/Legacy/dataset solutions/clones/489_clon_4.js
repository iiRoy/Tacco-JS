const fs = require('fs');
const rawInputContent = fs.readFileSync('/dev/stdin', 'utf8');
const allInputLines = rawInputContent.trim().split("\n");

const assessItemSet = (itemCollection) => {
    const anyItemOverweight = itemCollection.some((primaryElement, primaryIdx) => {
        const primaryWeightValue = primaryElement[0];
        const primaryIntervalStart = primaryElement[1];
        const primaryIntervalEnd = primaryElement[2];

        const accumulatedWeight = itemCollection.reduce((currentSum, secondaryElement, secondaryIdx) => {
            if (primaryIdx === secondaryIdx) {
                return currentSum;
            }

            const secondaryWeightValue = secondaryElement[0];
            const secondaryIntervalStart = secondaryElement[1];
            const secondaryIntervalEnd = secondaryElement[2];

            const hasOverlap = primaryIntervalStart <= secondaryIntervalEnd && primaryIntervalEnd >= secondaryIntervalStart;

            return hasOverlap ? currentSum + secondaryWeightValue : currentSum;
        }, primaryWeightValue);

        return accumulatedWeight > 150;
    });

    return anyItemOverweight ? "NG" : "OK";
};

const processInputSequentially = (remainingInputSegments) => {
    if (remainingInputSegments.length === 0) {
        return;
    }

    const currentSegmentSize = parseInt(remainingInputSegments[0], 10);

    if (currentSegmentSize === 0) {
        return;
    }

    const segmentDataLines = remainingInputSegments.slice(1, currentSegmentSize + 1);

    const parsedSegmentItems = segmentDataLines.map(lineContent =>
        lineContent.split(" ").map(Number)
    );

    console.log(assessItemSet(parsedSegmentItems));

    processInputSequentially(remainingInputSegments.slice(currentSegmentSize + 1));
};

processInputSequentially(allInputLines);
