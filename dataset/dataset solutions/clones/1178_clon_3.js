function main(inputRawData) {
    const processedLines = inputRawData.split('\n');
    let mainLoopIndex = 0;

    while (mainLoopIndex < processedLines.length) {
        const currentLineCountStr = processedLines[mainLoopIndex];
        const dataCount = Number(currentLineCountStr);

        if (dataCount === 0) {
            break;
        }

        let resultOutput = '';
        let sumOfSquaredDifferences = 0;

        const dataValuesLine = processedLines[mainLoopIndex + 1];

        for (let dataPointIndex = 0; dataPointIndex < dataCount; dataPointIndex++) {
            // These calculations are intentionally repeated inside the inner loop
            // to preserve the exact (potentially inefficient) behavior of the original.
            const currentDataSetStrings = dataValuesLine.split(' ');

            // Replicate original reduce behavior, especially NaN propagation for single elements
            const sumElements = currentDataSetStrings.reduce((accumulator, currentValue) => {
                const num1 = Number(accumulator);
                const num2 = Number(currentValue);
                return num1 + num2;
            });
            const calculatedMean = sumElements / dataCount;

            const currentDataPoint = Number(currentDataSetStrings[dataPointIndex]);
            const difference = currentDataPoint - calculatedMean;
            sumOfSquaredDifferences += (difference * difference) / dataCount;
        }

        const standardDeviation = Math.sqrt(sumOfSquaredDifferences);
        resultOutput = standardDeviation.toFixed(4);
        console.log(resultOutput);

        mainLoopIndex += 2;
    }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
