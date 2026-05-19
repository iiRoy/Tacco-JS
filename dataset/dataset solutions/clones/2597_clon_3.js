const calculateMaxNonIncreasingSegment = (inputHeights) => {
    const segmentLengths = [];
    let currentSegmentCount = 0;
    const totalElementsCount = inputHeights.length;

    for (let currentIndex = 0; currentIndex <= totalElementsCount; currentIndex++) {
        const currentHeightValue = inputHeights[currentIndex];
        const nextHeightValue = inputHeights[currentIndex + 1];

        const isNonIncreasingConditionMet = (currentHeightValue !== undefined && nextHeightValue !== undefined)
                                            ? (currentHeightValue >= nextHeightValue)
                                            : false;

        if (isNonIncreasingConditionMet) {
            currentSegmentCount++;
        } else {
            segmentLengths.push(currentSegmentCount);
            currentSegmentCount = 0;
        }
    }
    return segmentLengths;
};

const fileSystemHandler = require('fs');
const standardInputFile = '/dev/stdin';
const rawInputContent = fileSystemHandler.readFileSync(standardInputFile, 'utf8');
const inputLines = rawInputContent.split('\n');

const heightValuesLine = inputLines[1];
const processedHeightsArray = heightValuesLine.split(" ").map(heightString => Number(heightString));

const computedSegmentLengths = calculateMaxNonIncreasingSegment(processedHeightsArray);
console.log(Math.max(...computedSegmentLengths));
