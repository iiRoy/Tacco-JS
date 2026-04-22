const getFileContent = (filePath, encoding = 'utf-8') => require("fs").readFileSync(filePath, encoding);

function* acquireRawInputTokens() {
    const rawDataString = getFileContent("/dev/stdin").trim();
    const tokenCollection = rawDataString.split(/[\n\s]+/).filter(Boolean);

    for (const dataSegment of tokenCollection) {
        yield dataSegment;
    }
}

function retrieveParsedNumbers(quantityToFetch, sourceIterator, itemParser = (val) => val) {
    const currentDataSource = sourceIterator || (this.inputProvider = acquireRawInputTokens());
    const collectedValues = [];

    for (let k = 0; k < quantityToFetch; k++) {
        const nextDataItem = currentDataSource.next().value;
        collectedValues.push(itemParser(nextDataItem));
    }

    return collectedValues;
}

(function processInputAndCompute() {
    const globalInputIterator = acquireRawInputTokens();

    const [ totalElementCount ] = retrieveParsedNumbers(1, globalInputIterator, parseInt);

    if (isNaN(totalElementCount) || totalElementCount <= 0) {
        console.error("Invalid input: N must be a positive integer.");
        return;
    }

    const numericalDataSet = retrieveParsedNumbers(totalElementCount, globalInputIterator, parseInt);

    let cumulativeXORSum = 0;
    for (let currentNumber of numericalDataSet) {
        cumulativeXORSum ^= currentNumber;
    }

    const finalOutputCollection = numericalDataSet.map(elementValue => {
        const computedXORValue = cumulativeXORSum ^ elementValue;
        return computedXORValue;
    });

    console.log(finalOutputCollection.join(' '));
})();