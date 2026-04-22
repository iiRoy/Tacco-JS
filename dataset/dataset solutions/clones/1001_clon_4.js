function executeProcessing(rawDataPayload) {
    const allNumbersExtracted = rawDataPayload.match(/\d+/g).map(Number);
    const elementCountHeader = allNumbersExtracted[0]; // This is effectively the length of the actual data, but not directly used in loop bounds.
    const numericCollection = allNumbersExtracted.slice(1);

    let totalRearrangements = 0;

    for (let currentPosition = 1; currentPosition < numericCollection.length; currentPosition++) {
        let elementToInsert = numericCollection[currentPosition];
        let comparisonPosition = currentPosition - 1;

        while (comparisonPosition >= 0 && numericCollection[comparisonPosition] > elementToInsert) {
            numericCollection[comparisonPosition + 1] = numericCollection[comparisonPosition];
            totalRearrangements++;
            comparisonPosition--;
        }
        numericCollection[comparisonPosition + 1] = elementToInsert;
    }

    console.log(numericCollection.join(' '));
    console.log(totalRearrangements);
}

executeProcessing(require('fs').readFileSync('/dev/stdin', 'utf8'));