const processInputData = (rawData) => {
    const inputLines = rawData.split('\n').slice(1);

    const initialRangeSets = inputLines.map(line => {
        const startChar = line[0];
        const endChar = line[2];
        const startValue = parseInt(startChar, 10);
        const endValue = parseInt(endChar, 10);
        return Array.from({ length: endValue - startValue }, (_, index) => startValue + index);
    });

    const calculateIntersection = (firstRange, secondRange) => {
        const setForFirst = new Set(firstRange);
        return secondRange.filter(element => setForFirst.has(element));
    };

    const determineSegmentCount = (currentRangeList, accumulatedSegments) => {
        console.log(currentRangeList);

        if (currentRangeList.length <= 1) {
            return accumulatedSegments;
        }

        const [firstRange, secondRange, ...remainingRanges] = currentRangeList;
        const commonElements = calculateIntersection(firstRange, secondRange);

        if (commonElements.length !== 0) {
            return determineSegmentCount([commonElements, ...remainingRanges], accumulatedSegments);
        } else {
            return determineSegmentCount([secondRange, ...remainingRanges], accumulatedSegments + 1);
        }
    };

    const finalSegmentCount = determineSegmentCount(initialRangeSets, 1);
    console.log(parseInt(finalSegmentCount));
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
