const fileSystem = require('fs');

const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const gridDataMatrix = rawInputContent.trim().split('\n').map(lineSegment =>
    lineSegment.split(' ').map(Number)
);

const minimumsByRow = gridDataMatrix.map(currentRow => Math.min(...currentRow));

const minimumsByColumn = Array.from({ length: gridDataMatrix[0].length }, (_, columnIndex) =>
    Math.min(...gridDataMatrix.map(rowItem => rowItem[columnIndex]))
);

const isStructureConsistent = gridDataMatrix.every((currentRow, rowIndex) =>
    currentRow.every((cellValue, colIndex) =>
        cellValue === (minimumsByRow[rowIndex] + minimumsByColumn[colIndex])
    )
);

console.log(isStructureConsistent ? 'Yes' : 'No');
