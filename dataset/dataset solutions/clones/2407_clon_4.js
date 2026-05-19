"use strict";

const InputProcessor = (function() {
    function createProcessor(rawInputString) {
        return new DataHandler(rawInputString);
    }

    function DataHandler(inputString) {
        this.lineBuffer = inputString.trim().split("\n");
        this.currentLineIndex = 0;
        this.currentTokenBuffer = [];
    }

    DataHandler.prototype.fetchNext = function(asString) {
        if (this.currentTokenBuffer.length === 0) {
            if (this.currentLineIndex >= this.lineBuffer.length) {
                return undefined;
            }
            this.currentTokenBuffer = this.lineBuffer[this.currentLineIndex++].split(" ");
        }
        const token = this.currentTokenBuffer.shift();
        return asString ? token : Number(token);
    };

    DataHandler.prototype.retrieveLine = function(asString) {
        if (this.currentLineIndex >= this.lineBuffer.length) {
            return undefined;
        }
        const lineContent = this.lineBuffer[this.currentLineIndex++].split(" ");
        return asString ? lineContent : lineContent.map(Number);
    };

    DataHandler.prototype.extractMatrix = function(rowCount, asString) {
        const resultMatrix = [];
        for (let i = 0; i < rowCount; i++) {
            resultMatrix.push(this.retrieveLine(asString));
        }
        return resultMatrix;
    };

    DataHandler.prototype.grabLines = function(count, asString) {
        const rawLines = [];
        for (let i = 0; i < count; i++) {
            if (this.currentLineIndex >= this.lineBuffer.length) {
                break;
            }
            const line = this.lineBuffer[this.currentLineIndex++];
            rawLines.push(asString ? line : Number(line));
        }
        return rawLines;
    };

    return createProcessor;
})();

function createMultiDimensionalArray(initialValue, ...dimensions) {
    const buildArray = (dims) => {
        if (dims.length === 0) {
            return initialValue;
        }
        const currentDimSize = dims[0];
        const remainingDims = dims.slice(1);
        return Array.from({ length: currentDimSize }, () => buildArray(remainingDims));
    };
    return buildArray(dimensions);
}

const inputSource = InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(calculateScore());

function calculateScore() {
    const firstValue = inputSource.fetchNext();
    const secondValue = inputSource.fetchNext();

    const scoreLookup = {
        1: 300000,
        2: 200000,
        3: 100000
    };

    let totalPoints = (scoreLookup[firstValue] || 0) + (scoreLookup[secondValue] || 0);

    totalPoints += (firstValue === 1 && secondValue === 1) ? 400000 : 0;

    return totalPoints;
}
