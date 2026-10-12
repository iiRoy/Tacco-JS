function solveProblem() {
    let numRows = readInputToken();
    let numCols = readInputToken();

    let rowValues = new Array(numRows);
    for (let i = 0; i < numRows; ++i) {
        rowValues[i] = readInputToken();
    }

    let colCosts = new Array(numCols);
    for (let i = 0; i < numCols; ++i) {
        colCosts[i] = readInputToken();
    }

    let memoTable = new Array(numRows + 1);

    for (let i = 0; i <= numRows; ++i) {
        memoTable[i] = new Array(numCols + 1);
    }

    for (let rowIndex = 0; rowIndex <= numRows; ++rowIndex) {
        for (let colIndex = 0; colIndex <= numCols; ++colIndex) {
            if (rowIndex === 0) {
                memoTable[rowIndex][colIndex] = 0;
            } else if (colIndex === 0) {
                memoTable[rowIndex][colIndex] = Infinity;
            } else {
                let costIfSkippingCurrentCol = memoTable[rowIndex][colIndex - 1];
                
                let currentItemValue = rowValues[rowIndex - 1];
                let currentItemCost = colCosts[colIndex - 1];
                let costIfUsingCurrentCol = memoTable[rowIndex - 1][colIndex - 1] + (currentItemValue * currentItemCost);

                memoTable[rowIndex][colIndex] = Math.min(costIfSkippingCurrentCol, costIfUsingCurrentCol);
            }
        }
    }
    outputResult(memoTable[numRows][numCols]);
}

function iterateN(count, callbackFn) {
    for (let idx = 0; idx < count; ++idx) {
        callbackFn(idx);
    }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

let rawDataBuffer = '';
let currentInputPtr = 0;

function readInputToken(tokenType) {
    if (tokenType === 'string') {
        return rawDataBuffer[currentInputPtr++];
    } else {
        return +rawDataBuffer[currentInputPtr++];
    }
}

function outputResult(outputValue) {
    console.log(outputValue);
}

process.stdin.on('data', function(dataChunk) {
    rawDataBuffer += dataChunk;
});
process.stdin.on('end', function() {
    rawDataBuffer = rawDataBuffer.split(/\s+/);
    solveProblem();
});
