var InputProcessorFactory = (function () {
    function createProcessor(sourceString) {
        return new InputProcessor(sourceString);
    }

    function InputProcessor(sourceString) {
        this.lineBuffer = sourceString.trim().split("\n");
        this.currentLineIdx = 0;
        this.currentLineTokens = [];
    }

    InputProcessor.prototype._ensureLineTokens = function() {
        if (this.currentLineTokens.length === 0) {
            if (this.currentLineIdx >= this.lineBuffer.length) {
                return false;
            }
            this.currentLineTokens = this.lineBuffer[this.currentLineIdx].split(" ").reverse();
        }
        return true;
    };

    InputProcessor.prototype.readNextToken = function (asString) {
        if (!this._ensureLineTokens()) {
            return undefined;
        }
        var tokenValue = this.currentLineTokens.pop();
        if (this.currentLineTokens.length === 0) {
            this.currentLineIdx++;
        }
        return asString ? tokenValue : Number(tokenValue);
    };

    InputProcessor.prototype.readLineAsNumbers = function (asStrings) {
        if (this.currentLineIdx >= this.lineBuffer.length) {
            return [];
        }
        var lineTokens = this.lineBuffer[this.currentLineIdx++].split(" ");
        return asStrings ? lineTokens : lineTokens.map(Number);
    };

    InputProcessor.prototype.readMatrixAsNumbers = function (numRows, asStrings) {
        var startIdx = this.currentLineIdx;
        var endIdx = this.currentLineIdx + numRows;
        this.currentLineIdx = endIdx;
        var matrixRows = this.lineBuffer.slice(startIdx, endIdx);
        return asStrings ? matrixRows.map(row => row.split(" ")) : matrixRows.map(row => row.split(" ").map(Number));
    };

    InputProcessor.prototype.readRawLines = function (numRows, asStrings) {
        var startIdx = this.currentLineIdx;
        var endIdx = this.currentLineIdx + numRows;
        this.currentLineIdx = endIdx;
        var rawLines = this.lineBuffer.slice(startIdx, endIdx);
        return asStrings ? rawLines : rawLines.map(Number);
    };

    return createProcessor;
})();

var inputHandler = InputProcessorFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

function initializeNDArray(fillValue, ...dimensions) {
    if (dimensions.length === 0) {
        return fillValue;
    }

    const createDimension = (dims) => {
        const currentDimSize = dims[0];
        const remainingDims = dims.slice(1);
        const arr = new Array(currentDimSize);

        for (let i = 0; i < currentDimSize; i++) {
            arr[i] = remainingDims.length > 0 ? createDimension(remainingDims) : fillValue;
        }
        return arr;
    };

    return createDimension(dimensions);
}

var MODULO_VALUE = 1e9 + 7;

function applyModulo(value) {
    return (value % MODULO_VALUE + MODULO_VALUE) % MODULO_VALUE;
}

console.log(solveProblem());

function solveProblem() {
    var lengthS = inputHandler.readNextToken();
    var lengthT = inputHandler.readNextToken();

    var sequenceS = inputHandler.readLineAsNumbers();
    var sequenceT = inputHandler.readLineAsNumbers();

    var dpTable = initializeNDArray(0, lengthS + 1, lengthT + 1);
    var totalSubsequences = 1;

    for (var sIdx = 0; sIdx < lengthS; sIdx++) {
        var currentMatchSum = 0;
        for (var tIdx = 0; tIdx < lengthT; tIdx++) {
            let currentDpValue = dpTable[sIdx][tIdx];

            if (sequenceS[sIdx] === sequenceT[tIdx]) {
                let matchedCount = applyModulo(currentDpValue + 1);
                currentMatchSum = applyModulo(currentMatchSum + matchedCount);
                totalSubsequences = applyModulo(totalSubsequences + matchedCount);

                let valFromLeft = dpTable[sIdx + 1][tIdx];
                let valFromAbove = dpTable[sIdx][tIdx + 1];
                dpTable[sIdx + 1][tIdx + 1] = applyModulo(valFromLeft + valFromAbove + 1);
            } else {
                dpTable[sIdx + 1][tIdx + 1] = applyModulo(currentMatchSum + dpTable[sIdx][tIdx + 1]);
            }
        }
    }
    return totalSubsequences;
}
