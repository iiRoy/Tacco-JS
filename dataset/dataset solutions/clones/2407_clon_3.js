"use strict";

const InputParser = (function() {
    function createParser(sourceText) {
        return new ParserInstance(sourceText);
    }

    class ParserInstance {
        constructor(sourceText) {
            this._sourceLines = sourceText.trim().split("\n");
            this._currentLineIndex = 0;
        }

        readNextValue(returnAsString) {
            const linesArray = this._sourceLines;
            const lineIdx = this._currentLineIndex;
            let extractedVal;

            if (typeof linesArray[lineIdx] === "string") {
                linesArray[lineIdx] = linesArray[lineIdx].split(" ").reverse();
            }

            extractedVal = linesArray[lineIdx].pop();

            if (!linesArray[lineIdx].length) {
                this._currentLineIndex++;
            }

            return returnAsString ? extractedVal : parseInt(extractedVal, 10);
        }

        readLineValues(returnAsString) {
            const lineContent = this._sourceLines[this._currentLineIndex++];
            const values = lineContent.split(" ");
            return returnAsString ? values : values.map(val => parseInt(val, 10));
        }

        readMatrix(numRows, returnAsString) {
            const startIdx = this._currentLineIndex;
            const endIdx = this._currentLineIndex + numRows;
            const matrixRows = this._sourceLines.slice(startIdx, endIdx);
            this._currentLineIndex = endIdx;

            if (returnAsString) {
                return matrixRows.map(row => row.split(" "));
            } else {
                return matrixRows.map(row => row.split(" ").map(val => parseInt(val, 10)));
            }
        }

        readLinesAsNumbers(numLines, returnAsString) {
            const startIdx = this._currentLineIndex;
            const endIdx = this._currentLineIndex + numLines;
            const lines = this._sourceLines.slice(startIdx, endIdx);
            this._currentLineIndex = endIdx;

            return returnAsString ? lines : lines.map(line => parseInt(line, 10));
        }
    }

    return createParser;
})();

const inputReader = InputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue) {
    const dimensions = Array.prototype.slice.call(arguments, 1);
    let dimCount = dimensions.length;
    let arrayCreationString = `Array(dimensions[${--dimCount}]).fill(0).map(x => { return ${initialValue}; })`;

    while (--dimCount >= 0) {
        arrayCreationString = `Array(dimensions[${dimCount}]).fill(0).map(x => ${arrayCreationString})`;
    }
    return eval(arrayCreationString);
}

function calculateScore() {
    const firstInput = inputReader.readNextValue();
    const secondInput = inputReader.readNextValue();

    const scoreLookup = new Map([
        [1, 300000],
        [2, 200000],
        [3, 100000]
    ]);

    let totalScore = 0;

    const firstInputBaseScore = scoreLookup.get(firstInput) || 0;
    const secondInputBaseScore = scoreLookup.get(secondInput) || 0;

    totalScore += firstInputBaseScore;
    totalScore += secondInputBaseScore;

    if (firstInput === 1 && secondInput === 1) {
        totalScore += 400000;
    }

    return totalScore;
}

console.log(calculateScore());
