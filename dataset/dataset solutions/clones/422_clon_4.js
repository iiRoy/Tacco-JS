const fileSystem = require('fs');

function searchStepsRecursive(dataCollection, targetValue, currentLow, currentHigh, iterationCount) {
    if (currentLow > currentHigh) {
        return iterationCount;
    }

    const middlePoint = Math.floor((currentLow + currentHigh) / 2);

    if (dataCollection[middlePoint] === targetValue) {
        return iterationCount + 1;
    }

    if (targetValue < dataCollection[middlePoint]) {
        return searchStepsRecursive(dataCollection, targetValue, currentLow, middlePoint, iterationCount + 1);
    } else {
        return searchStepsRecursive(dataCollection, targetValue, middlePoint + 1, currentHigh, iterationCount + 1);
    }
}

function retrieveSearchCount(sourceArr, lookupVal) {
    return searchStepsRecursive(sourceArr, lookupVal, 0, sourceArr.length, 0);
}

const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const processedLines = rawInputContent.trim().split('\n');

for (;;) {
    const elementCount = Number(processedLines.shift());
    if (elementCount === 0) {
        break;
    }

    const dataSequence = Array.from({ length: elementCount }, () => Number(processedLines.shift()));
    const targetValue = Number(processedLines.shift());

    console.log(retrieveSearchCount(dataSequence, targetValue));
}
