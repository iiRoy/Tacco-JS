const sourceLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

let currentLinePointer = 0;

while (true) {
    const dimensionData = sourceLines[currentLinePointer++].split(' ').map(Number);
    const [matrixRows, matrixCols] = dimensionData;

    if (matrixRows === 0) {
        break;
    }

    const columnSums = Array.from({ length: matrixCols }, () => 0);

    Array.from({ length: matrixRows }).forEach(() => {
        const rowNumericValues = sourceLines[currentLinePointer++].split(' ').map(Number);
        rowNumericValues.forEach((valueElement, columnIndex) => {
            columnSums[columnIndex] += valueElement;
        });
    });

    const rankedColumns = columnSums.map((totalValue, originalIndex) => ({
        position: originalIndex + 1,
        aggregate: totalValue
    }));

    rankedColumns.sort((firstCol, secondCol) => {
        if (firstCol.aggregate === secondCol.aggregate) {
            return firstCol.position - secondCol.position;
        }
        return secondCol.aggregate - firstCol.aggregate;
    });

    console.log(rankedColumns.map(col => col.position).join(' '));
}
