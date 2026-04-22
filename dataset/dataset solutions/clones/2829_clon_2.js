const DATA_PARSER = (function() {
    function createInputUtility(sourceText) {
        return new InputReader(sourceText);
    }
    function InputReader(rawData) {
        this._lineStore = rawData.trim().split('\n');
        this._currentLinePos = 0;
    }
    InputReader.prototype.getToken = function(asStringFlag) {
        let currentLines = this._lineStore;
        let position = this._currentLinePos;
        let nextItem;
        if (typeof currentLines[position] === 'string') {
            currentLines[position] = currentLines[position].split(' ').reverse();
        }
        nextItem = currentLines[position].pop();
        if (!currentLines[position].length) {
            this._currentLinePos++;
        }
        return asStringFlag ? nextItem : Number(nextItem);
    };
    InputReader.prototype.getTokensOnLine = function(returnAsText) {
        let lineContents = this._lineStore[this._currentLinePos++].split(' ');
        return returnAsText ? lineContents : lineContents.map(token => Number(token));
    };
    InputReader.prototype.getMatrixOfTokens = function(rowCount, stringOutput) {
        let matrixRows = this._lineStore.slice(this._currentLinePos, this._currentLinePos += rowCount)
                                        .map(line => line.split(' '));
        return stringOutput ? matrixRows : matrixRows.map(row => row.map(cell => Number(cell)));
    };
    InputReader.prototype.getRawLines = function(numberOfLines, keepText) {
        let fetchedLines = this._lineStore.slice(this._currentLinePos, this._currentLinePos += numberOfLines);
        return keepText ? fetchedLines : fetchedLines.map(lineValue => Number(lineValue));
    };
    return createInputUtility;
})();

let inputHandler = DATA_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

function generateMultiDimensionalArray(initialVal) {
    let dimensionalArgs = arguments;
    let dimensionCount = dimensionalArgs.length;
    let arrayExpression = "Array(dimensionalArgs[" + --dimensionCount + "]).fill(0).map(element => { return " + initialVal + "; })";
    while (--dimensionCount) {
        arrayExpression = "Array(dimensionalArgs[" + dimensionCount + "]).fill(0).map(element => " + arrayExpression + ")";
    }
    return eval(arrayExpression);
}

const MODULO_VALUE = 1000000007;

console.log(calculateResult());

function calculateResult() {
    let countN = inputHandler.getToken();
    let countM = inputHandler.getToken();
    let sequenceS = inputHandler.getTokensOnLine();
    let sequenceT = inputHandler.getTokensOnLine();

    let dynamicMatrix = generateMultiDimensionalArray(0, countN + 1, countM + 1);
    let totalScore = 1;

    for (let indexS = 0; indexS < countN; indexS++) {
        for (let indexT = 0; indexT < countM; indexT++) {
            if (sequenceS[indexS] === sequenceT[indexT]) {
                totalScore += dynamicMatrix[indexS][indexT] + 1;
                totalScore %= MODULO_VALUE;
                dynamicMatrix[indexS + 1][indexT + 1] = dynamicMatrix[indexS + 1][indexT] + dynamicMatrix[indexS][indexT + 1] + 1;
            } else {
                dynamicMatrix[indexS + 1][indexT + 1] = dynamicMatrix[indexS + 1][indexT] + dynamicMatrix[indexS][indexT + 1] - dynamicMatrix[indexS][indexT];
            }
            dynamicMatrix[indexS + 1][indexT + 1] %= MODULO_VALUE;
        }
    }
    return totalScore;
}