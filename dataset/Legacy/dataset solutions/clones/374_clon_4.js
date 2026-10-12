function transformGrid(sourceGrid) {
    const gridDim = sourceGrid.length;
    
    const rotatedStructure = Array.from({ length: gridDim }, (_, newRowIndex) => {
        return Array.from({ length: gridDim }, (_, newColIndex) => {
            const originalRow = gridDim - 1 - newColIndex;
            const originalCol = newRowIndex;
            return sourceGrid[originalRow][originalCol];
        });
    });

    return rotatedStructure;
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedInputLines = fileContent.trim().split('\n');

let currentGridData = processedInputLines.map(lineString => lineString.split(''));

currentGridData = transformGrid(currentGridData);
console.log(currentGridData.join('\n'));

currentGridData = transformGrid(currentGridData);
console.log(currentGridData.join('\n'));

currentGridData = transformGrid(currentGridData);
console.log(currentGridData.join('\n'));
