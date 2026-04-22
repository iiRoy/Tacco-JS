const processInputData = (payloadString) => {
    const fullLineArray = payloadString.split('\n');

    const dimensionsRaw = fullLineArray[0].split(' ').map(Number);
    const matrixRowsCount = dimensionsRaw[0];
    const matrixColsCount = dimensionsRaw[1];

    const contentLines = fullLineArray.slice(1);

    const dataGrid = contentLines.slice(0, matrixRowsCount).map(lineText =>
        lineText.split(' ').map(Number)
    );

    const vectorLengthDeterminedByOriginalLogic = contentLines.length - matrixRowsCount - 1;
    const multiplierVector = contentLines.slice(matrixRowsCount, matrixRowsCount + vectorLengthDeterminedByOriginalLogic).map(Number);

    const accumulateProductsRecursively = (rowArr, coeffVec, indexer, maxIndex, currentTotal) => {
        if (indexer === maxIndex) {
            return currentTotal;
        }
        const gridVal = rowArr[indexer];
        const coeffVal = coeffVec[indexer];
        const productTerm = gridVal * coeffVal;
        return accumulateProductsRecursively(rowArr, coeffVec, indexer + 1, maxIndex, currentTotal + productTerm);
    };

    const finalOutputValues = dataGrid.map(singleRow => {
        return accumulateProductsRecursively(singleRow, multiplierVector, 0, matrixColsCount, 0);
    });

    finalOutputValues.forEach(valueToPrint => console.log(valueToPrint));
};

const receivedStreamContent = require('node:fs').readFileSync(process.stdin.fd, 'utf8');
processInputData(receivedStreamContent);