const analyzeInputData = (inputSource) => {
    const contentLines = inputSource.trim().split(/\r?\n/);
    const elementCount = parseInt(contentLines[0], 10);
    const numericalValues = contentLines[1].split(/\s+/).map(Number);

    const accumulatorStart = {
        currentAggregate: 0,
        frequencyMap: new Map([[0, 1]])
    };

    const finalAggregation = numericalValues.reduce((tracker, valueItem) => {
        tracker.currentAggregate += valueItem;
        const currentOccurrences = tracker.frequencyMap.get(tracker.currentAggregate) || 0;
        tracker.frequencyMap.set(tracker.currentAggregate, currentOccurrences + 1);
        return tracker;
    }, accumulatorStart);

    const sumFrequencies = finalAggregation.frequencyMap;

    let totalPairs = 0;
    for (const appearanceCount of sumFrequencies.values()) {
        if (appearanceCount > 1) {
            totalPairs += (appearanceCount * (appearanceCount - 1)) / 2;
        }
    }

    return totalPairs;
};

const processExecution = (systemInput) => {
    const finalResultValue = analyzeInputData(systemInput);
    console.log(finalResultValue);
};

processExecution(require("fs").readFileSync("/dev/stdin", "utf8"));