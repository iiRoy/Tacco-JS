const source = require("fs");

source.readFileSync("/dev/stdin", 'utf8')
  .trim()
  .split(/\s/)
  .forEach(dataSegment => {
    const parsedValues = dataSegment.split(',').map(Number);

    const segmentSums = parsedValues.slice(0, 11).reduceRight((accumulator, currentElement) => {
        const previousAccumulation = accumulator.length > 0 ? accumulator[0] : 0;
        const newAccumulatedSum = previousAccumulation - currentElement;
        accumulator.unshift(newAccumulatedSum);
        return accumulator;
    }, []);

    const overallNegativeSum = segmentSums[0];

    const itemAtTenthPosition = parsedValues[10];
    const itemAtEleventhPosition = parsedValues[11];

    const divisorTerm = itemAtTenthPosition - itemAtEleventhPosition;
    const multiplicationFactor = itemAtEleventhPosition / divisorTerm;
    const finalThreshold = overallNegativeSum * multiplicationFactor;

    function findHighestMatchingIndex(sequenceOfValues, targetThreshold, currentPoint) {
        if (currentPoint < 0) {
            return 0;
        }

        if (sequenceOfValues[currentPoint] >= targetThreshold) {
            return currentPoint;
        }

        return findHighestMatchingIndex(sequenceOfValues, targetThreshold, currentPoint - 1);
    }

    const computedPosition = findHighestMatchingIndex(segmentSums, finalThreshold, 10);
    console.log(computedPosition);
  });