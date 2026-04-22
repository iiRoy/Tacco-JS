function parseAndGroupedNumericalData(sourceContent) {
    let numericalValues = sourceContent.trim().split(/\s|\n/).map(Number);
    let collectionOfSets = [];
    let currentCursorPosition = 0;

    while (currentCursorPosition < numericalValues.length) {
        let setElementCount = numericalValues[currentCursorPosition];
        currentCursorPosition++;

        if (setElementCount === 0) {
            break;
        }

        if (currentCursorPosition + setElementCount > numericalValues.length) {
            break; // Malformed input: not enough numbers for the declared count
        }

        let currentNumericalSet = numericalValues.slice(currentCursorPosition, currentCursorPosition + setElementCount);
        collectionOfSets.push(currentNumericalSet);
        currentCursorPosition += setElementCount;
    }
    return collectionOfSets;
}

function calculateDispersionMetric(inputDataPoints) {
    if (inputDataPoints.length === 0) {
        return NaN;
    }

    const totalElements = inputDataPoints.length;

    const sumOfElements = inputDataPoints.reduce((accumulator, currentVal) => accumulator + currentVal, 0);
    const meanValue = sumOfElements / totalElements;

    const sumOfSquaredDeviations = inputDataPoints.reduce((accumulator, currentVal) => {
        const differenceFromMean = currentVal - meanValue;
        return accumulator + (differenceFromMean * differenceFromMean);
    }, 0);

    const variance = sumOfSquaredDeviations / totalElements;
    return Math.sqrt(variance);
}

function processAndReport(externalSource) {
    const structuredCollections = parseAndGroupedNumericalData(externalSource);

    structuredCollections.forEach(itemCollection => {
        const finalMetric = calculateDispersionMetric(itemCollection);
        console.log(finalMetric);
    });
}

processAndReport(require("fs").readFileSync("/dev/stdin", "utf8"));