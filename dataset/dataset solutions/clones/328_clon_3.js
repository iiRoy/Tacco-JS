var logOutput = console.log;

function createInputReader(rawInputData) {
    const inputLines = rawInputData.split("\n");
    return function () {
        return inputLines.shift();
    };
}

String.prototype.repeatString = function (count) {
    if (count <= 0) {
        return "";
    }
    return new Array(count).fill(this.toString()).join('');
};

function padLeftWithSpaces(value, width) {
    const stringValue = String(value);
    return (' '.repeat(width) + stringValue).slice(-width);
}

function parseNumbersFromLine(inputLineStr) {
    const parts = inputLineStr.split(' ');
    return parts.map(Number);
}

function createNumberRange(startVal, endVal) {
    return Array.from({ length: endVal - startVal }, (_, k) => k + startVal);
}

function getMaximum(val1, val2) {
    return Math.max(val1, val2);
}

function getMinimum(val1, val2) {
    return Math.min(val1, val2);
}

function createKeyBasedComparator(keyName) {
    return function (objA, objB) {
        if (objA[keyName] < objB[keyName]) return -1;
        else if (objA[keyName] > objB[keyName]) return 1;
        return 0;
    };
}

Array.prototype.calculateTotalSum = function () {
    return this.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
};

Array.prototype.formatPaddedStrings = function () {
    return this.map(currentValue => padLeftWithSpaces(currentValue, 5));
};

function processSingleTestCase(inputLines) {
    const numRows = Number(inputLines.shift());
    if (numRows === 0) {
        return false;
    }

    const columnSums = new Array(numRows + 1).fill(0);

    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
        const currentRowData = parseNumbersFromLine(inputLines.shift());
        currentRowData.push(currentRowData.calculateTotalSum());
        
        logOutput(currentRowData.formatPaddedStrings().join(''));

        for (let colIndex = 0; colIndex < numRows + 1; colIndex++) {
            columnSums[colIndex] += currentRowData[colIndex];
        }
    }

    logOutput(columnSums.splice(0, numRows + 1).formatPaddedStrings().join(''));
    
    return true;
}

function processInputData(fullInputString) {
    const remainingLines = fullInputString.split("\n");
    
    while (remainingLines.length > 0) {
        const shouldContinue = processSingleTestCase(remainingLines);
        if (!shouldContinue) {
            break;
        }
    }
}

processInputData(require("fs").readFileSync("input.txt", "utf8"));
