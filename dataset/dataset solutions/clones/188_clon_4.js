let collectedData = '';

process.stdin.on('data', (portion) => {
    collectedData += portion.toString();
});

process.stdin.on('end', () => {
    const numericalElements = collectedData
        .split('\n')
        .map(item => Number(item));

    const containsNonNumeric = numericalElements.some(val => isNaN(val));

    if (containsNonNumeric) {
        process.stdout.write(NaN.toString() + '\n');
        return;
    }

    const largestElement = numericalElements.reduce((currentHighest, currentEntry) => {
        return Math.max(currentHighest, currentEntry);
    }, -Infinity);

    const smallestElement = numericalElements.reduce((currentLowest, currentEntry) => {
        return Math.min(currentLowest, currentEntry);
    }, Infinity);

    const ultimateResult = largestElement - smallestElement;
    process.stdout.write(ultimateResult.toString() + '\n');
});