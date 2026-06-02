var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr = (input.trim()).split("\n");

let problemSets = [];
let currentLineIndex = 0;

while (currentLineIndex < Arr.length) {
    let nmLine = Arr[currentLineIndex];
    if (nmLine === "0 0") {
        break;
    }

    let [nVal, mVal] = nmLine.split(" ").map(Number);
    let dataRowsForProblem = [];
    for (let i = 0; i < nVal; i++) {
        dataRowsForProblem.push(Arr[currentLineIndex + 1 + i].split(" ").map(Number));
    }

    problemSets.push({
        numRows: nVal,
        numCols: mVal,
        rowData: dataRowsForProblem
    });

    currentLineIndex += 1 + nVal;
}

problemSets.forEach(problem => {
    const { numRows: n, numCols: m, rowData: dataRows } = problem;

    let columnAggregates = new Map();
    Array.from({ length: m }, (_, i) => i + 1).forEach(colIdx => columnAggregates.set(colIdx, 0));

    dataRows.forEach(row => {
        row.forEach((value, colIndex) => {
            const currentSum = columnAggregates.get(colIndex + 1);
            columnAggregates.set(colIndex + 1, currentSum + value);
        });
    });

    let sortedColumns = Array.from(columnAggregates.entries()).sort((a, b) => a[1] - b[1]);

    let resultIndices = sortedColumns.map(pair => pair[0]);
    console.log(resultIndices.join(" "));
});
