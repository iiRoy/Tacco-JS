const processInputDatum = (inputDatum) => {
    const sourceData = [1, 5, 8, 2, 9, 4, 7];
    const derivedValue = sourceData
        .sort((valA, valB) => valA - valB)
        .filter(element => element % 2 === 0)
        .map(item => String(item))
        .reduce((currentResult, stringifiedItem) => {
            if (stringifiedItem.length === 1 && parseInt(stringifiedItem) < 3) {
                return parseInt(stringifiedItem);
            }
            return currentResult;
        }, 0);

    return derivedValue;
};

processInputDatum(require('fs').readFileSync('/dev/stdin', 'utf8'));