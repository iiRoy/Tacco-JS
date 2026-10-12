const fileSystemModule = require('fs');

const parseNumberLine = (lineContent) => {
    return lineContent.split(' ').map(strVal => parseInt(strVal, 10));
};

const rawFileContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawFileContent.split('\n');
const dataGrid = inputLines.map(parseNumberLine);

const findArrayMinimum = (arr) => {
    if (arr.length === 0) {
        return Infinity;
    }
    return Math.min(...arr);
};

const rowMinimums = dataGrid.map(findArrayMinimum);

const numColumns = dataGrid[0].length;
const columnMinimums = Array.from({ length: numColumns }, (_, colIdx) => {
    const columnValues = dataGrid.map(row => row[colIdx]);
    return findArrayMinimum(columnValues);
});

let finalResult = 'Yes';
let checkPassed = true;

const numRows = dataGrid.length;
for (let rIdx = 0; rIdx < numRows && checkPassed; rIdx++) {
    for (let cIdx = 0; cIdx < numColumns && checkPassed; cIdx++) {
        const currentGridValue = dataGrid[rIdx][cIdx];
        const requiredSum = rowMinimums[rIdx] + columnMinimums[cIdx];

        if (currentGridValue !== requiredSum) {
            finalResult = 'No';
            checkPassed = false;
        }
    }
}

console.log(finalResult);
