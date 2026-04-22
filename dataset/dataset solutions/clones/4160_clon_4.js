const calculateDeviation = (sourceText) => {
    const textSections = sourceText.split('\n');
    const numericStringSegment = textSections[1];

    const dataPoints = (numericStringSegment.match(/\d+/g) || []).map(Number);

    const frequencyMap = dataPoints.reduce((accumulator, currentValue) => {
        accumulator[currentValue] = (accumulator[currentValue] || 0) + 1;
        return accumulator;
    }, {});

    const finalSum = Object.keys(frequencyMap).reduce((accumulatedResult, keyString) => {
        const numericValue = Number(keyString);
        const occurrenceCount = frequencyMap[numericValue];

        if (occurrenceCount < numericValue) {
            return accumulatedResult + occurrenceCount;
        } else if (occurrenceCount > numericValue) {
            return accumulatedResult + (occurrenceCount - numericValue);
        } else {
            return accumulatedResult;
        }
    }, 0);

    console.log(finalSum);
};

calculateDeviation(require("fs").readFileSync("/dev/stdin", "utf8"));