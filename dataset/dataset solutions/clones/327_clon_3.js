const fileSystemModule = require('fs');

const formatNumericValue = (value, desiredWidth = 5) => {
    return String(Number(value)).padStart(desiredWidth, ' ');
};

try {
    const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    const inputLineBuffer = rawInputContent.trim().split('\n');

    let processedSetCounter = 0;

    while (true) {
        processedSetCounter++;

        const currentSizeLine = inputLineBuffer.shift();

        if (currentSizeLine === undefined) {
            break;
        }

        const currentDataSetSize = parseInt(currentSizeLine, 10);

        if (currentDataSetSize === 0) {
            break;
        }

        const aggregatedColumnTotals = Array(currentDataSetSize + 1).fill(0);

        for (let rowIndex = 0; rowIndex < currentDataSetSize; rowIndex++) {
            const currentRowString = inputLineBuffer.shift();

            if (currentRowString === undefined) {
                break;
            }

            const numericalRowValues = currentRowString.split(' ').map(Number);
            const currentRowSum = numericalRowValues.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

            numericalRowValues.push(currentRowSum);

            numericalRowValues.forEach((valueItem, columnIndex) => {
                aggregatedColumnTotals[columnIndex] += valueItem;
            });

            const formattedRowOutput = numericalRowValues.map(valueItem => formatNumericValue(valueItem)).join('');
            console.log(formattedRowOutput);
        }

        const finalTotalsFormatted = aggregatedColumnTotals.map(totalValue => formatNumericValue(totalValue)).join('');
        console.log(finalTotalsFormatted);
    }
} catch (operationalError) {
    // Handle any operational errors during file reading or processing.
}