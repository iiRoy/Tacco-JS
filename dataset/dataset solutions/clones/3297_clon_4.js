((systemModuleAccess) => {
    const inputReader = systemModuleAccess('node:fs');
    const standardInputContent = inputReader.readFileSync('/dev/stdin', 'utf8');

    const extractFixedSegments = (sourceSequence, countLimit) => {
        if (!Array.isArray(sourceSequence)) {
            throw new Error("Source must be an array for segment extraction.");
        }
        const collectedSegments = [];
        for (let segmentIndex = 0; segmentIndex < Math.min(sourceSequence.length, countLimit); segmentIndex++) {
            collectedSegments.push(sourceSequence[segmentIndex]);
        }
        return collectedSegments;
    };

    const inputLines = standardInputContent.split('\n');
    const countOfDataPoints = parseInt(inputLines[0], 10);
    const dataRecords = [];
    for (let currentDataPointIndex = 0; currentDataPointIndex < countOfDataPoints; currentDataPointIndex++) {
        const parsedNumbers = inputLines[currentDataPointIndex + 1]
                                .split(' ')
                                .map(val => parseInt(val, 10));
        const [valueA, valueB, valueC] = extractFixedSegments(parsedNumbers, 3);
        dataRecords.push([valueA, valueB, valueC]);
    }

    const memoizationStore = new Map();
    
    const determineMaximumPathValue = (currentLevel, chosenPathIndex) => {
        const storageKey = `${currentLevel}-${chosenPathIndex}`;
        if (memoizationStore.has(storageKey)) {
            return memoizationStore.get(storageKey);
        }

        if (currentLevel === 0) {
            const initialPathValue = dataRecords[0][chosenPathIndex];
            memoizationStore.set(storageKey, initialPathValue);
            return initialPathValue;
        }

        let highestPreviousLevelValue = -Infinity;
        for (let previousPathIndex = 0; previousPathIndex < 3; previousPathIndex++) {
            if (previousPathIndex !== chosenPathIndex) {
                const valueFromPriorLevel = determineMaximumPathValue(currentLevel - 1, previousPathIndex);
                if (valueFromPriorLevel > highestPreviousLevelValue) {
                    highestPreviousLevelValue = valueFromPriorLevel;
                }
            }
        }
        
        const currentValueAtLevel = dataRecords[currentLevel][chosenPathIndex];
        const combinedPathValue = currentValueAtLevel + highestPreviousLevelValue;
        
        memoizationStore.set(storageKey, combinedPathValue);
        return combinedPathValue;
    };

    let overallHighestResult = -Infinity;
    const finalLevelIndex = countOfDataPoints - 1;
    for (let finalPathOption = 0; finalPathOption < 3; finalPathOption++) {
        const outcomeAtEnd = determineMaximumPathValue(finalLevelIndex, finalPathOption);
        if (outcomeAtEnd > overallHighestResult) {
            overallHighestResult = outcomeAtEnd;
        }
    }

    console.log(overallHighestResult);
})(require);