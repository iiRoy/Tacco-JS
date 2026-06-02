const fs = require("fs");

const rightAlign = (value, width) => {
    const text = String(value);
    return (" ".repeat(width) + text).slice(-width);
};

const sumValues = (values) => {
    return values.reduce((total, value) => total + Number(value), 0);
};

const printAlignedRow = (values) => {
    console.log(values.map(value => rightAlign(value, 5)).join(""));
};

const inputLines = fs.readFileSync("/dev/stdin", "utf8").trim().split("\n");
let linePointer = 0;

while (inputLines[linePointer] !== "0") {
    const rowCount = Number(inputLines[linePointer++]);
    const completedRows = [];

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        const rowValues = inputLines[linePointer++].split(" ");
        const rowTotal = sumValues(rowValues);
        const rowWithTotal = [...rowValues, rowTotal];

        completedRows.push(rowWithTotal);
        printAlignedRow(rowWithTotal);
    }

    const totalsRow = [];

    for (let columnIndex = 0; columnIndex < rowCount + 1; columnIndex++) {
        const columnValues = completedRows.map(row => row[columnIndex]);
        totalsRow.push(sumValues(columnValues));
    }

    printAlignedRow(totalsRow);
}