'use strict';
((dataSource) => {
    const rawNumbers = dataSource.trim().split(/\s+/).map(str => Number(str));

    const elementCount = rawNumbers[0];
    const numericalSequence = rawNumbers.slice(1);

    const outcomeRegistry = new Map();

    const calculateOptimalDifference = (startIndex, endIndex) => {
        if (startIndex > endIndex) {
            return 0;
        }

        const currentSegmentIdentifier = `${startIndex},${endIndex}`;

        if (outcomeRegistry.has(currentSegmentIdentifier)) {
            return outcomeRegistry.get(currentSegmentIdentifier);
        }

        const pickFirstElement = numericalSequence[startIndex] - calculateOptimalDifference(startIndex, endIndex - 1);
        const pickLastElement = numericalSequence[endIndex] - calculateOptimalDifference(startIndex, endIndex - 1);

        const bestCurrentChoice = Math.max(pickFirstElement, pickLastElement);

        outcomeRegistry.set(currentSegmentIdentifier, bestCurrentChoice);
        return bestCurrentChoice;
    };

    const finalResult = calculateOptimalDifference(0, elementCount - 1);

    console.log(finalResult);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));