(function processInput(sourceData) {
    const rawEntries = sourceData.trim().split('\n');
    const topNumericValues = [];
    let nanOccurrences = 0;

    for (let i = 0; i < rawEntries.length; i++) {
        const currentDatum = Number(rawEntries[i]);

        if (Number.isNaN(currentDatum)) {
            nanOccurrences++;
        } else {
            let insertionPoint = 0;
            // Find the correct position to insert currentDatum to maintain descending order
            // topNumericValues only contains numbers, so direct numerical comparison works.
            while (insertionPoint < topNumericValues.length && currentDatum <= topNumericValues[insertionPoint]) {
                insertionPoint++;
            }

            topNumericValues.splice(insertionPoint, 0, currentDatum);

            // Ensure the array does not exceed 3 elements, removing the smallest if it does
            if (topNumericValues.length > 3) {
                topNumericValues.pop();
            }
        }
    }

    // After processing all entries, if there are fewer than 3 numeric values,
    // fill the remaining slots with NaNs if any were encountered.
    // This mimics the behavior of Array.prototype.sort where NaNs are typically
    // placed at the end and would only appear in the top 3 if there aren't enough numbers.
    while (topNumericValues.length < 3 && nanOccurrences > 0) {
        topNumericValues.push(Number.NaN);
        nanOccurrences--;
    }

    // Output the resulting top values
    for (let j = 0; j < topNumericValues.length; j++) {
        console.log(topNumericValues[j]);
    }

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
