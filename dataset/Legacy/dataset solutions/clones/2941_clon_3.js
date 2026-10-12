var InputParserFactory = (function () {
    function createInputParser(sourceString) {
        return new InputParser(sourceString);
    }

    class InputParser {
        constructor(sourceString) {
            this.sourceLines = sourceString.trim().split("\n");
            this.currentLineIndex = 0;
        }

        readNextToken(shouldReturnString) {
            let currentLineContent = this.sourceLines[this.currentLineIndex];
            let tokenValue;

            if (typeof currentLineContent === "string") {
                this.sourceLines[this.currentLineIndex] = currentLineContent.split(" ").reverse();
            }

            let tokensOnCurrentLine = this.sourceLines[this.currentLineIndex];

            tokenValue = tokensOnCurrentLine.pop();

            if (tokensOnCurrentLine.length === 0) {
                this.currentLineIndex++;
            }

            return shouldReturnString ? tokenValue : +tokenValue;
        }

        readLineTokens(shouldReturnStrings) {
            let lineContent = this.sourceLines[this.currentLineIndex++];
            let tokens = lineContent.split(" ");

            const convertToNumber = (val) => +val;

            return shouldReturnStrings ? tokens : tokens.map(convertToNumber);
        }

        readMatrix(numRows, shouldReturnStrings) {
            let startRow = this.currentLineIndex;
            let endRow = this.currentLineIndex + numRows;
            let matrixRows = this.sourceLines.slice(startRow, endRow);

            this.currentLineIndex = endRow;

            const processRow = (rowStr) => {
                let rowTokens = rowStr.split(" ");
                return shouldReturnStrings ? rowTokens : rowTokens.map((val) => +val);
            };

            return matrixRows.map(processRow);
        }

        readLines(numLines, shouldReturnStrings) {
            let startLine = this.currentLineIndex;
            let endLine = this.currentLineIndex + numLines;
            let lines = this.sourceLines.slice(startLine, endLine);

            this.currentLineIndex = endLine;

            const convertToNumber = (val) => +val;

            return shouldReturnStrings ? lines : lines.map(convertToNumber);
        }
    }

    return createInputParser;
})();

var inputReader = InputParserFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue, ...dimensions) {
    const createDimension = (dimIndex) => {
        if (dimIndex === dimensions.length - 1) {
            return Array(dimensions[dimIndex]).fill(initialValue);
        } else {
            return Array(dimensions[dimIndex]).fill(0).map(() => createDimension(dimIndex + 1));
        }
    };
    return createDimension(0);
}

var primeModulus = 1e9 + 7;

function applyModMultiplication() {
    var args = arguments,
        result = args[0],
        argIndex = 1;
    for (; argIndex < args.length; argIndex++) {
        result = ((result >> 16) * args[argIndex] % primeModulus * 65536 + (result & 65535) * args[argIndex]) % primeModulus;
    }
    return result;
}

var factorialCache = [1, 1];

function getFactorialMod(num) {
    for (var i = factorialCache.length; i <= num; i++) {
        factorialCache[i] = applyModMultiplication(factorialCache[i - 1], i);
    }
    return factorialCache[num];
}

function nCrModulus(nVal, rVal) {
    const factN = getFactorialMod(nVal);
    const factR_inv = modularInverse(getFactorialMod(rVal));
    const factN_minus_R_inv = modularInverse(getFactorialMod(nVal - rVal));

    return applyModMultiplication(factN, factR_inv, factN_minus_R_inv);
}

function modularInverse(aVal) {
    var bVal = primeModulus,
        u = 1,
        v = 0,
        temp;
    while (bVal) {
        temp = Math.floor(aVal / bVal);
        aVal -= temp * bVal;
        u -= temp * v;
        temp = aVal;
        aVal = bVal;
        bVal = temp;
        temp = u;
        u = v;
        v = temp;
    }
    u %= primeModulus;
    return u < 0 ? u + primeModulus : u;
}

function summationHelper(val) {
    const decrementedVal = val - 1;
    return val * decrementedVal / 2;
}

function populateGridValues(grid, numRows, numCols) {
    for (let currentX = 0; currentX < numCols; currentX++) {
        for (let currentY = 0; currentY < numRows; currentY++) {
            const term1_val = summationHelper(currentX + 1) + summationHelper(numCols - currentX);
            const term2_val = summationHelper(currentY + 1) + summationHelper(numRows - currentY);

            grid[currentY][currentX] = term1_val * numRows;
            grid[currentY][currentX] += term2_val * numCols;
        }
    }
}

function sumAllGridValues(grid, numRows, numCols) {
    let totalSum = 0;
    for (let currentX = 0; currentX < numCols; currentX++) {
        for (let currentY = 0; currentY < numRows; currentY++) {
            totalSum += grid[currentY][currentX];
        }
    }
    return totalSum;
}

console.log(calculateResult());

function calculateResult() {
    var rowsCount = inputReader.readNextToken();
    var colsCount = inputReader.readNextToken();
    var targetK = inputReader.readNextToken();

    var gridValues = createMultiDimArray(0, rowsCount, colsCount);

    populateGridValues(gridValues, rowsCount, colsCount);

    var finalSum = sumAllGridValues(gridValues, rowsCount, colsCount);

    finalSum %= primeModulus;

    const totalCellsMinusTwo = rowsCount * colsCount - 2;
    const kMinusTwo = targetK - 2;

    const combinationsTerm = nCrModulus(totalCellsMinusTwo, kMinusTwo);
    const inverseOfTwo = modularInverse(2);

    return applyModMultiplication(finalSum, combinationsTerm, inverseOfTwo);
}
