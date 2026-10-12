const processInputData = (rawText) => {
    const dataSegments = rawText.trim().split('\n');
    const outputLines = [];

    let segmentIndex = 0;
    while (segmentIndex < dataSegments.length) {
        const currentDataLine = dataSegments[segmentIndex++];
        const [itemQuantity, sumUpperLimit] = currentDataLine.split(' ').map(Number);

        if (itemQuantity === 0 && sumUpperLimit === 0) {
            break;
        }

        const priceDataLine = dataSegments[segmentIndex++];
        const priceValues = priceDataLine.split(' ').map(Number);

        const collectedSums = Array.from({ length: sumUpperLimit + 1 }, (_, firstIdx) => firstIdx)
            .flatMap(firstIdx =>
                Array.from({ length: itemQuantity + 1 }, (_, secondIdx) => secondIdx)
                    .map(secondIdx => {
                        const valA = priceValues[firstIdx];
                        const valB = priceValues[secondIdx];
                        if (typeof valA === 'number' && typeof valB === 'number') {
                            return valA + valB;
                        }
                        return NaN;
                    })
            )
            .filter(currentSum => typeof currentSum === 'number' && !isNaN(currentSum) && currentSum <= sumUpperLimit);

        const lastValidSumFound = collectedSums[collectedSums.length - 1];

        const finalOutputValue = collectedSums.length > 1 && lastValidSumFound <= sumUpperLimit
            ? lastValidSumFound
            : 'NONE';
        outputLines.push(finalOutputValue);
    }
    return outputLines.join('\n');
};

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(processInputData(fileContent));
