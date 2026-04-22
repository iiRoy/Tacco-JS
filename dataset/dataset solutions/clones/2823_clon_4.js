const processNumericSeries = (sourceText) => {
    const contentLines = sourceText.split('\n');
    const firstLineTokens = contentLines[0].split(' ').map(numStr => Number.parseInt(numStr, 10));
    const totalItemsCount = firstLineTokens[0];
    const thresholdMagnitude = firstLineTokens[1];
    const inputNumericSequence = contentLines[1].split(' ').map(numStr => Number.parseInt(numStr, 10));

    const cumulativeSumArray = [];
    let currentAccumulation = 0;
    for (const val of inputNumericSequence) {
        currentAccumulation += val;
        cumulativeSumArray.push(currentAccumulation);
    }

    const firstExceedingIndex = cumulativeSumArray.findIndex(sumValue => sumValue > thresholdMagnitude);

    let finalResult;
    if (firstExceedingIndex !== -1) {
        finalResult = firstExceedingIndex + 1;
    } else {
        finalResult = totalItemsCount;
    }

    console.log(finalResult);
};

const systemInput = require('node:fs').readFileSync('/dev/stdin', 'utf8');
processNumericSeries(systemInput);