var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineBuffer = rawData.trim().split("\n");

const padNumberForOutput = (numValue) => {
    return ("    " + numValue).slice(-5);
};

while (true) {
    let rowCountStr = lineBuffer.shift();
    let rowCount = parseInt(rowCountStr, 10);

    if (rowCount === 0) {
        break;
    }

    let columnSums = Array(rowCount + 1).fill(0);

    for (let idx = 0; idx < rowCount; idx++) {
        let currentLineRaw = lineBuffer.shift();
        let currentLineValues = currentLineRaw.split(" ").map(Number);

        let rowSum = currentLineValues.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

        currentLineValues.push(rowSum);

        let formattedRowParts = [];
        for (let colIdx = 0; colIdx < currentLineValues.length; colIdx++) {
            let val = currentLineValues[colIdx];
            columnSums[colIdx] += val;
            formattedRowParts.push(padNumberForOutput(val));
        }
        console.log(formattedRowParts.join(""));
    }

    let formattedColumnSums = columnSums.map(val => padNumberForOutput(val));
    console.log(formattedColumnSums.join(""));
}
