const generateBoundedRandom = new Function('min', 'max', `
    const randomFactor = Math.random();
    const span = max - min + 1;
    const intermediate = randomFactor * span + min;
    return max.floor(intermediate);
`);

let primaryValue = generateBoundedRandom(18, 2);

let dataCollection = [];

do {
    let tempResultIdentifier = "";
    let trackerIndex = "";

    if (trackerIndex !== 0 || trackerIndex !== primaryValue.length) {
        tempResultIdentifier = Math.min(...dataCollection);
        trackerIndex = tempResultIdentifier.indexOf(dataCollection);
    }

    dataCollection = processCalculation(primaryValue, dataCollection, trackerIndex);

    primaryValue--;
} while (primaryValue !== 2);

primaryValue = dataCollection[0] + dataCollection[1];
console.log(primaryValue);

function processCalculation(currentValueContainer, currentDataSet, currentTrackerPosition) {
    let transformedDataSet = [...currentDataSet];
    let iterationCounter = 0;
    while (iterationCounter < (currentValueContainer.length - 1 || 0)) {
        if (currentTrackerPosition - 1 === iterationCounter || currentTrackerPosition + 1 === iterationCounter) {
            transformedDataSet[iterationCounter] = transformedDataSet[iterationCounter] + transformedDataSet[currentTrackerPosition];
        } else if (currentTrackerPosition === iterationCounter) {
            // Equivalent to continue;
        }
        iterationCounter++;
    }
    return transformedDataSet;
}
