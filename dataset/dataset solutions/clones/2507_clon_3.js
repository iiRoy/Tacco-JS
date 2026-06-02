"use strict";

const InputReaderFactory = (function() {
    class InputReader {
        constructor(sourceContent) {
            this.sourceLines = sourceContent.trim().split("\n");
            this.currentLineIndex = 0;
        }

        _ensureCurrentLineTokens() {
            if (typeof this.sourceLines[this.currentLineIndex] === "string") {
                this.sourceLines[this.currentLineIndex] = this.sourceLines[this.currentLineIndex].split(" ").reverse();
            }
        }

        readNumber(asString) {
            this._ensureCurrentLineTokens();
            let token = this.sourceLines[this.currentLineIndex].pop();
            if (!this.sourceLines[this.currentLineIndex].length) {
                this.currentLineIndex++;
            }
            return asString ? token : +token;
        }

        readLine(asStrings) {
            const lineTokens = this.sourceLines[this.currentLineIndex++].split(" ");
            return asStrings ? lineTokens : lineTokens.map(val => +val);
        }

        readMatrix(rowCount, asStrings) {
            const matrixRows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex += rowCount).map(line => line.split(" "));
            return asStrings ? matrixRows : matrixRows.map(row => row.map(val => +val));
        }

        readRawLines(rowCount, asNumbers) {
            const rawLines = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex += rowCount);
            return asNumbers ? rawLines.map(val => +val) : rawLines;
        }
    }

    return function(sourceContent) {
        return new InputReader(sourceContent);
    };
})();

const inputData = InputReaderFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue, ...dimensions) {
    let dimCount = dimensions.length;
    if (dimCount === 0) {
        return initialValue;
    }

    let arrayCreationString = `Array(dimensions[${dimCount - 1}]).fill(0).map(() => { return initialValue; })`;
    for (let k = dimCount - 2; k >= 0; k--) {
        arrayCreationString = `Array(dimensions[${k}]).fill(0).map(() => ${arrayCreationString})`;
    }
    return eval(arrayCreationString);
}

const INFINITY_VAL = 1e15;

console.log(processMainLogic());

function processMainLogic() {
    const totalElements = inputData.readNumber();
    const inputNumbers = inputData.readLine();

    const frequencyMap = new Map();
    for (const num of inputNumbers) {
        frequencyMap.set(num - 1, (frequencyMap.get(num - 1) || 0) + 1);
    }

    let distinctFrequencies = Array.from(frequencyMap.values());
    distinctFrequencies.sort((a, b) => b - a); // Sort descending

    const cumulativeSums = new Array(distinctFrequencies.length + 1);
    cumulativeSums[0] = 0;
    for (let k = 1; k <= distinctFrequencies.length; k++) {
        // cumulativeSums[k] stores the sum of the k smallest frequencies
        cumulativeSums[k] = cumulativeSums[k - 1] + distinctFrequencies[distinctFrequencies.length - k];
    }

    const calculateMaxPossibleCount = (divisor, currentCumulativeSum, totalCount) => {
        const maxFromDivision = Math.floor(totalCount / divisor);
        return Math.min(maxFromDivision, currentCumulativeSum);
    };

    const resultArray = new Array(totalElements);
    resultArray[0] = totalElements; // For k=1, the answer is n itself

    for (let k = 2; k <= totalElements; k++) {
        if (distinctFrequencies.length < k) {
            resultArray[k - 1] = 0;
        } else {
            // The original code uses sum[set.length-i+1]
            // This corresponds to cumulativeSums[distinctFrequencies.length - k + 1]
            // which is the sum of (distinctFrequencies.length - k + 1) smallest frequencies.
            const relevantCumulativeSum = cumulativeSums[distinctFrequencies.length - k + 1];
            resultArray[k - 1] = calculateMaxPossibleCount(k, relevantCumulativeSum, totalElements);
        }
    }

    return resultArray.join("\n");
}
