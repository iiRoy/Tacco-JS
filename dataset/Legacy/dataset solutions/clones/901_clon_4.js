const fileSystem = require('fs');
const rawContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

const lineSegments = rawContent.trim().split('\n');

lineSegments.shift();

const initialValues = lineSegments.shift().split(' ').map(Number);
initialValues.sort((x, y) => x - y);

lineSegments.shift();

const queryValues = lineSegments.shift().split(' ').map(Number);
const thresholds = lineSegments.shift().split(' ').map(Number);

function findFloorIndex(sortedCollection, targetElement) {
    let lowerBound = 0;
    let upperBound = sortedCollection.length - 1;
    let resultPosition = -1;

    while (lowerBound <= upperBound) {
        const midPoint = Math.floor((lowerBound + upperBound) / 2);
        if (sortedCollection[midPoint] <= targetElement) {
            resultPosition = midPoint;
            lowerBound = midPoint + 1;
        } else {
            upperBound = midPoint - 1;
        }
    }
    return resultPosition;
}

const cumulativeSums = [];
let runningTotal = 0;

for (let idx = 0; idx < initialValues.length; idx++) {
    runningTotal += initialValues[idx];
    cumulativeSums.push(runningTotal);
}

for (let k = 0; k < queryValues.length; k++) {
    const currentQueryValue = queryValues[k];
    let effectiveSumForQuery = 0;

    const floorPosition = findFloorIndex(initialValues, currentQueryValue);

    if (floorPosition !== -1) {
        effectiveSumForQuery = cumulativeSums[floorPosition];
    }

    console.log((thresholds[k] <= effectiveSumForQuery) ? "Yes" : "No");
}
