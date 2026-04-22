function processInput(rawText) {
    let lineSegments = rawText.split('\n').map(segment => segment.trim()).filter(Boolean);
    
    let firstLineElements = lineSegments[0].split(/\s+/).filter(Boolean);
    let desiredDivisions = parseInt(firstLineElements[0], 10);

    let rawNumericalStrings = lineSegments[1].split(/\s+/).filter(Boolean);
    let actualPointLocations = rawNumericalStrings.map(strValue => parseInt(strValue, 10));

    let sortedPointArrangement = actualPointLocations.sort((valA, valB) => {
        if (valA < valB) { return -1; }
        if (valA > valB) { return 1; }
        return 0;
    });

    function computeIntervalLengths(pointCollection, currentPosition = 1, collectedGaps = []) {
        if (currentPosition >= pointCollection.length) {
            return collectedGaps;
        }
        collectedGaps.push(pointCollection[currentPosition] - pointCollection[currentPosition - 1]);
        return computeIntervalLengths(pointCollection, currentPosition + 1, collectedGaps);
    }
    let interPointDistances = computeIntervalLengths(sortedPointArrangement);

    interPointDistances.sort((distX, distY) => {
        if (distX < distY) { return -1; }
        if (distX > distY) { return 1; }
        return 0;
    });

    let numberOfGapsToAggregate = sortedPointArrangement.length - desiredDivisions;

    function tallyGapsRecursively(gapMeasurements, limitCount, currentPointer = 0, runningSum = 0) {
        if (currentPointer >= limitCount || currentPointer >= gapMeasurements.length) {
            return runningSum;
        }
        runningSum += gapMeasurements[currentPointer];
        return tallyGapsRecursively(gapMeasurements, limitCount, currentPointer + 1, runningSum);
    }
    
    let finalCalculatedSum = tallyGapsRecursively(interPointDistances, numberOfGapsToAggregate);

    console.log(finalCalculatedSum);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));