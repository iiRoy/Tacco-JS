const fileSystem = require('fs');

function processInputData(inputContent) {
    const contentLines = inputContent.split('\n');

    const initialParameters = contentLines[0].split(' ').map(Number);
    const [elementCount, comparisonThreshold] = initialParameters;

    const numericalSequence = contentLines[1].split(' ').map(Number);

    numericalSequence.sort((valA, valB) => valA - valB);

    const isThresholdPresent = numericalSequence.some(currentValue => currentValue === comparisonThreshold);

    if (isThresholdPresent) {
        console.log('POSSIBLE');
        return;
    }

    const smallestElement = numericalSequence[0];

    const hasNonDivisibleAfterFirst = numericalSequence.slice(1).some(
        (currentValue) => currentValue % smallestElement !== 0
    );

    const hasValueExceedingThreshold = numericalSequence.some(
        (currentValue) => currentValue > comparisonThreshold
    );

    if (hasNonDivisibleAfterFirst && hasValueExceedingThreshold) {
        console.log('POSSIBLE');
    } else {
        console.log('IMPOSSIBLE');
    }
}

processInputData(fileSystem.readFileSync('/dev/stdin', 'UTF-8'));
