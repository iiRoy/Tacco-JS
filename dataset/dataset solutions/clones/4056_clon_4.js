const parseInputData = (sourceMaterial) => {
    const contentLines = sourceMaterial.trim().split('\n');
    const totalElements = parseInt(contentLines[0], 10);
    const primarySequence = contentLines[1].split(' ').map(Number);
    const secondarySequence = contentLines[2].split(' ').map(Number);
    return { totalElements, primarySequence, secondarySequence };
};

const calculateCumulativeSums = (dataCollection) => {
    const runningTotals = [];
    let currentTotal = 0;
    for (let index = 0; index < dataCollection.length; index++) {
        currentTotal += dataCollection[index];
        runningTotals.push(currentTotal);
    }
    return runningTotals;
};

const calculateReverseCumulativeSums = (dataCollection) => {
    const runningTotals = new Array(dataCollection.length);
    let currentTotal = 0;
    for (let index = dataCollection.length - 1; index >= 0; index--) {
        currentTotal += dataCollection[index];
        runningTotals[index] = currentTotal;
    }
    return runningTotals;
};

const determineOverallBestScore = (numItems, cumulativePrimary, cumulativeSecondaryReverse) => {
    let maximumAchieved = 0;
    for (let currentPivot = 0; currentPivot < numItems; currentPivot++) {
        const combinedScore = cumulativePrimary[currentPivot] + cumulativeSecondaryReverse[currentPivot];
        if (combinedScore > maximumAchieved) {
            maximumAchieved = combinedScore;
        }
    }
    return maximumAchieved;
};

const processSequenceAggregation = (sourceMaterial) => {
    const { totalElements, primarySequence, secondarySequence } = parseInputData(sourceMaterial);
    const cumulativePrimary = calculateCumulativeSums(primarySequence);
    const cumulativeSecondaryReverse = calculateReverseCumulativeSums(secondarySequence);
    const finalResult = determineOverallBestScore(totalElements, cumulativePrimary, cumulativeSecondaryReverse);
    console.log(finalResult);
};

processSequenceAggregation(require("fs").readFileSync("/dev/stdin", "utf8"));