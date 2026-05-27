const fileSystem = require('fs');
const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const lineArray = rawData.trim().split("\n");

let processedDataSets = [];
let currentN;

const PADDING_LENGTH = 5;
const PAD_STRING = " ".repeat(PADDING_LENGTH);

const formatPaddedNumber = (num) => (PAD_STRING + num).slice(-PADDING_LENGTH);

const processAndPrintDataSet = (dataSetRows, totalSums, nValue, formatter) => {
    dataSetRows.forEach(row => {
        for (let sumIdx = 0; sumIdx < nValue + 1; sumIdx++) {
            totalSums[sumIdx] += row[sumIdx];
        }
        const formattedRow = row.map(formatter);
        console.log(formattedRow.join(""));
    });
};

for (let lineIdx = 0; lineIdx < lineArray.length; lineIdx++) {
    const currentLineNums = lineArray[lineIdx].split(" ").map(Number);

    if (currentLineNums.length === 1) {
        const singleValue = currentLineNums[0];

        if (lineIdx === 0) {
            currentN = singleValue;
            continue;
        }

        let columnSums = Array(currentN + 1).fill(0);

        processAndPrintDataSet(processedDataSets, columnSums, currentN, formatPaddedNumber);

        const formattedColumnSums = columnSums.map(formatPaddedNumber);
        console.log(formattedColumnSums.join(""));

        if (singleValue === 0) {
            break;
        }

        processedDataSets = [];
        currentN = singleValue;
    } else {
        const rowSum = currentLineNums.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        currentLineNums.push(rowSum);
        processedDataSets.push(currentLineNums);
    }
}
