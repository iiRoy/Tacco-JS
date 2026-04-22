const createNumericStreamExtractor = (sourceText) => {
    const allTokens = sourceText.split(/\s+/).filter(Boolean).map(Number);
    let tokenIndex = 0;

    return {
        grabNext: () => {
            if (tokenIndex < allTokens.length) {
                return allTokens[tokenIndex++];
            }
            throw new Error("Input data exhausted.");
        }
    };
};

const outputResult = (firstComponent, secondComponent) => {
    console.log(firstComponent, secondComponent);
};

const processQueryBatch = (rawInputText) => {
    const dataProvider = createNumericStreamExtractor(rawInputText);
    let totalQueryCount = dataProvider.grabNext();

    let elementCollection = [];
    let cumulativeShift = 0;

    let currentQuery = 0;
    while (currentQuery < totalQueryCount) {
        const operationCode = dataProvider.grabNext();

        if (operationCode === 1) {
            const itemValue = dataProvider.grabNext();
            const offsetValue = dataProvider.grabNext();
            cumulativeShift += offsetValue;
            elementCollection.push(itemValue);
        } else {
            const temporarySorted = [...elementCollection].sort((valA, valB) => valA - valB);
            const collectionSize = temporarySorted.length;
            const medianPosition = Math.floor((collectionSize - 1) / 2);
            const centralValue = temporarySorted[medianPosition];

            let sumOfAbsoluteDistances = 0;
            for (let k = 0; k < collectionSize; k++) {
                sumOfAbsoluteDistances += Math.abs(temporarySorted[k] - centralValue);
            }

            const finalResult = sumOfAbsoluteDistances + cumulativeShift;
            outputResult(centralValue, finalResult);
        }
        currentQuery++;
    }
};

processQueryBatch(require("fs").readFileSync("/dev/stdin", "utf8"));