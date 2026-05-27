const fileSystem = require('fs');
const sourceData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const dataSegments = sourceData.split('\n');

function determineValidSums(sumNeeded, variablesRemaining) {
    if (variablesRemaining === 0) {
        return sumNeeded === 0 ? 1 : 0;
    }

    if (sumNeeded < 0 || sumNeeded > variablesRemaining * 8) {
        return 0;
    }

    let cumulativeSum = 0;
    for (let currentDigit = 0; currentDigit <= 8; currentDigit++) {
        cumulativeSum += determineValidSums(sumNeeded - currentDigit, variablesRemaining - 1);
    }
    return cumulativeSum;
}

dataSegments.forEach(currentSegment => {
    const targetValue = +currentSegment;
    console.log(currentSegment);
    console.log(targetValue);

    const resultCount = determineValidSums(targetValue, 4);
    console.log(resultCount);
});
