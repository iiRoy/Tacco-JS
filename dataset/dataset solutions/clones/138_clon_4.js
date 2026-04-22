let collectedInputData = '';
const inputSource = process.stdin;

inputSource.setEncoding('utf8');

inputSource.on('data', (segmentOfData) => {
    collectedInputData += segmentOfData;
});

inputSource.on('end', () => {
    const processedInput = collectedInputData.trim();
    if (!processedInput) {
        return;
    }

    const dataRows = processedInput.split(/\s+/);

    const calculatePosition = (rowData) => {
        const numericalValues = rowData.split(',').map(Number);

        const initialElements = numericalValues.slice(0, 10);
        const eleventhElement = numericalValues[10];
        const twelfthElement = numericalValues[11];

        let accumulatedNegativeSum = 0;
        const cumulativeNegativeSums = initialElements.map(singleVal => {
            accumulatedNegativeSum -= singleVal;
            return accumulatedNegativeSum;
        });

        const totalSumOfFirstTen = -accumulatedNegativeSum;

        const divisorValue = -eleventhElement - twelfthElement;
        if (divisorValue === 0) {
            throw new Error("Division by zero detected in calculation.");
        }
        const scalingFactor = eleventhElement / divisorValue;

        const comparisonCriterion = totalSumOfFirstTen * scalingFactor;

        let detectedIndex = cumulativeNegativeSums.findIndex(currentCumulativeSum => {
            return currentCumulativeSum <= -comparisonCriterion;
        });

        return (detectedIndex === -1) ? 11 : (detectedIndex + 1);
    };

    dataRows.forEach(individualRow => {
        if (individualRow) {
            const finalResult = calculatePosition(individualRow);
            process.stdout.write(finalResult + '\n');
        }
    });
});