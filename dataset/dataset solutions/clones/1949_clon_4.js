const sourceText = require('fs').readFileSync('/dev/stdin', 'utf8');
const textLength = sourceText.length;

const totalDivisible = Array.from({ length: textLength }, (_, startPosition) => startPosition)
    .reduce((accumulatorForCount, currentStartPosition) => {
        const minimumEndPosition = currentStartPosition + 4;
        const maximumEndPosition = textLength - 1;

        if (minimumEndPosition > maximumEndPosition) {
            return accumulatorForCount;
        }

        const segmentCounts = Array.from({ length: maximumEndPosition - minimumEndPosition + 1 }, (_, offset) => {
            const actualEndPosition = minimumEndPosition + offset;
            const currentSegment = sourceText.substring(currentStartPosition, actualEndPosition);
            const numericalRepresentation = parseInt(currentSegment, 10);
            return numericalRepresentation % 2019 === 0 ? 1 : 0;
        });

        return accumulatorForCount + segmentCounts.reduce((sumOfSegments, isDivisible) => sumOfSegments + isDivisible, 0);
    }, 0);

console.log(totalDivisible);
