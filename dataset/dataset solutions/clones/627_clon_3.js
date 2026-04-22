const fileSystem = require('fs');

const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8').trim();

const inputLinesArray = rawInputData.split('\n');

const numberOfOriginalElements = parseInt(inputLinesArray[0].trim(), 10);

if (isNaN(numberOfOriginalElements) || numberOfOriginalElements < 3) {
    console.log(0);
    return;
}

let circularDataSet = [];

for (let i = 0; i < numberOfOriginalElements; i++) {
    const currentValue = parseInt(inputLinesArray[i + 1].trim(), 10);

    circularDataSet[i] = currentValue;
    circularDataSet[i + numberOfOriginalElements] = currentValue;
    circularDataSet[i + (2 * numberOfOriginalElements)] = currentValue;
}

const numericAccumulator = (currentAccumulatedValue, nextValueToAdd) => currentAccumulatedValue + nextValueToAdd;

function computeSegmentSum(sourceArray, segmentStartIdx, segmentEndIdx) {
    let segmentTotal = 0;
    for (let currentIdx = segmentStartIdx; currentIdx < segmentEndIdx; currentIdx++) {
        segmentTotal += sourceArray[currentIdx];
    }
    return segmentTotal;
}

let overallMaxResult = 0;
let minimumOfOtherSegments = 0;
let currentPrimarySegmentSum = 0;

const minLengthForSegmentA = 1;
const maxLengthForSegmentA = numberOfOriginalElements - 2;

for (let segmentLengthA = minLengthForSegmentA; segmentLengthA <= maxLengthForSegmentA; segmentLengthA++) {

    for (let windowStartOffset = 0; windowStartOffset < numberOfOriginalElements; windowStartOffset++) {

        currentPrimarySegmentSum = computeSegmentSum(circularDataSet, windowStartOffset, windowStartOffset + segmentLengthA);

        const minLengthForSegmentB = 1;
        const maxLengthForSegmentB = numberOfOriginalElements - segmentLengthA - 1;

        for (let segmentLengthB = minLengthForSegmentB; segmentLengthB <= maxLengthForSegmentB; segmentLengthB++) {

            const segmentB_StartIdx = windowStartOffset + segmentLengthA;
            const segmentB_EndIdx = segmentB_StartIdx + segmentLengthB;

            const segmentC_StartIdx = segmentB_EndIdx;
            const segmentC_EndIdx = windowStartOffset + numberOfOriginalElements;

            const sumOfSegmentB = computeSegmentSum(circularDataSet, segmentB_StartIdx, segmentB_EndIdx);
            const sumOfSegmentC = computeSegmentSum(circularDataSet, segmentC_StartIdx, segmentC_EndIdx);

            minimumOfOtherSegments = Math.min(sumOfSegmentB, sumOfSegmentC);

            if (currentPrimarySegmentSum <= minimumOfOtherSegments) {
                overallMaxResult = Math.max(overallMaxResult, currentPrimarySegmentSum);
            }
        }
    }
}

console.log(overallMaxResult);