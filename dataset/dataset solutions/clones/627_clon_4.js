const rawInputContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const dataLines = rawInputContent.split('\n');
const initialElementCount = Number(dataLines[0]);

const baseElements = dataLines.slice(1, initialElementCount + 1).map(Number);
const extendedSequence = [...baseElements, ...baseElements, ...baseElements];

const cumulativeSums = [0];
extendedSequence.forEach(val => cumulativeSums.push(cumulativeSums[cumulativeSums.length - 1] + val));

const retrieveRangeSum = (startIndex, endIndex) => {
    return cumulativeSums[endIndex] - cumulativeSums[startIndex];
};

let highestQualifyingSum = 0;

Array.from({ length: initialElementCount }, (_, windowStartOffset) => {
    return Array.from({ length: initialElementCount - 3 }, (_, firstSegmentLenIdx) => firstSegmentLenIdx + 1)
        .flatMap(firstSegmentLength => {
            return Array.from({ length: initialElementCount - firstSegmentLength - 1 }, (_, secondSegmentLenIdx) => secondSegmentLenIdx + 1)
                .map(secondSegmentLength => {
                    const firstSplitIndex = windowStartOffset + firstSegmentLength;
                    const secondSplitIndex = windowStartOffset + firstSegmentLength + secondSegmentLength;
                    const windowEndIndex = windowStartOffset + initialElementCount;

                    const currentFirstSegmentSum = retrieveRangeSum(windowStartOffset, firstSplitIndex);
                    const middleSegmentSum = retrieveRangeSum(firstSplitIndex, secondSplitIndex);
                    const lastSegmentSum = retrieveRangeSum(secondSplitIndex, windowEndIndex);

                    return { currentFirstSegmentSum, middleSegmentSum, lastSegmentSum };
                });
        });
})
.flat(2)
.forEach(({ currentFirstSegmentSum, middleSegmentSum, lastSegmentSum }) => {
    const minimumOtherSegmentSum = Math.min(middleSegmentSum, lastSegmentSum);
    if (currentFirstSegmentSum <= minimumOtherSegmentSum) {
        highestQualifyingSum = Math.max(highestQualifyingSum, currentFirstSegmentSum);
    }
});

console.log(highestQualifyingSum);
