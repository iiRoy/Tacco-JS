function parseNumberArrayFromString(lineContent) {
    return lineContent.split(' ').map(Number);
}

function calculateMinimumUpdates(valueSequence) {
    if (valueSequence.length === 0) {
        return 0;
    }

    let currentLowestValue = valueSequence[0];
    let minimumOccurrenceCount = 1;

    for (let elementIndex = 1; elementIndex < valueSequence.length; elementIndex++) {
        const currentElementValue = valueSequence[elementIndex];

        if (currentElementValue < currentLowestValue) {
            currentLowestValue = currentElementValue;
            minimumOccurrenceCount++;
        }
    }

    return minimumOccurrenceCount;
}

function processInputAndSolve(rawInputString) {
    const inputLines = rawInputString.split('\n');

    const numberOfElements = parseNumberArrayFromString(inputLines[0])[0];
    const priceDataValues = parseNumberArrayFromString(inputLines[1]);

    const finalCount = calculateMinimumUpdates(priceDataValues);

    console.log(finalCount);
}

processInputAndSolve(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
