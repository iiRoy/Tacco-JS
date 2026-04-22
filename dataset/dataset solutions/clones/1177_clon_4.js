function processInputData() {
    let rawContentStream = require('node:fs').readFileSync('/dev/stdin', 'utf8');
    let contentRowsArr = rawContentStream.split('\n');
    let linePointer = 0;

    for (;;) {
        let elementQuantity = parseInt(contentRowsArr[linePointer++], 10);

        if (elementQuantity === 0) {
            break;
        }

        let currentNumericString = contentRowsArr[linePointer++];
        let numericalElements = [];
        let currentNumberBuffer = '';

        for (let idx = 0; idx < currentNumericString.length; ++idx) {
            let charUnit = currentNumericString[idx];
            if (charUnit === ' ') {
                if (currentNumberBuffer !== '') {
                    numericalElements.push(parseFloat(currentNumberBuffer));
                    currentNumberBuffer = '';
                }
            } else {
                currentNumberBuffer += charUnit;
            }
        }
        if (currentNumberBuffer !== '') {
            numericalElements.push(parseFloat(currentNumberBuffer));
        }

        console.log(computeDispersionMetric(numericalElements));
    }
}

function computeDispersionMetric(numericSeriesCollection) {
    let totalSummation = 0;
    let collectionLength = numericSeriesCollection.length;

    for (let j = 0; j < collectionLength; ++j) {
        totalSummation += numericSeriesCollection[j];
    }

    let centralTendency = totalSummation / collectionLength;
    let sumOfSquaredDifferences = 0;

    for (let k = 0; k < collectionLength; ++k) {
        let differenceFromMean = numericSeriesCollection[k] - centralTendency;
        sumOfSquaredDifferences += differenceFromMean * differenceFromMean;
    }

    let finalVariance = sumOfSquaredDifferences / collectionLength;

    return Math.sqrt(finalVariance);
}

processInputData();