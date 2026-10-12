"use strict";
class InputParser {
    constructor(rawInputString) {
        this._lines = rawInputString.trim().split("\n");
        this._currentLineIndex = 0;
    }

    readSingleToken(returnAsString = false) {
        const currentLineIdx = this._currentLineIndex;
        let lineContent = this._lines[currentLineIdx];

        if (typeof lineContent === "string") {
            this._lines[currentLineIdx] = lineContent.split(" ").reverse();
            lineContent = this._lines[currentLineIdx];
        }

        const token = lineContent.pop();

        if (lineContent.length === 0) {
            this._currentLineIndex++;
        }

        return returnAsString ? token : Number(token);
    }

    readLineOfTokens(returnAsString = false) {
        if (this._currentLineIndex >= this._lines.length) {
            return [];
        }
        const lineString = this._lines[this._currentLineIndex++];
        const tokens = lineString.split(" ");
        return returnAsString ? tokens : tokens.map(Number);
    }

    readMatrix(numRows, returnAsString = false) {
        const matrixData = [];
        for (let i = 0; i < numRows; i++) {
            matrixData.push(this.readLineOfTokens(returnAsString));
        }
        return matrixData;
    }

    readRawLines(numLines, returnAsString = false) {
        const startIdx = this._currentLineIndex;
        const endIdx = startIdx + numLines;
        const rawLines = this._lines.slice(startIdx, endIdx);
        this._currentLineIndex = endIdx;
        return returnAsString ? rawLines : rawLines.map(Number);
    }
}

const InputParserFactory = (inputString) => new InputParser(inputString);

function createMultiDimArray(initialValue) {
    const dimensions = Array.from(arguments).slice(1);
    const dimCount = dimensions.length;

    if (dimCount === 0) {
        return initialValue;
    }

    let arrayCreationString = `Array(dimensions[${dimCount - 1}]).fill(0).map(x => { return ${initialValue}; })`;

    for (let i = dimCount - 2; i >= 0; i--) {
        arrayCreationString = `Array(dimensions[${i}]).fill(0).map(x => ${arrayCreationString})`;
    }

    const arrayBuilderFunction = new Function('dimensions', `return ${arrayCreationString};`);
    return arrayBuilderFunction(dimensions);
}

const parserInstance = InputParserFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

function solveProblem() {
    const arraySize = parserInstance.readSingleToken();
    const moduloValue = parserInstance.readSingleToken();
    const inputArray = parserInstance.readLineOfTokens().map(val => val - 1);

    const getPositiveModulo = (num, mod) => (num % mod + mod) % mod;

    const prefixSumsModK = new Array(arraySize + 1);
    prefixSumsModK[0] = 0;

    for (let currentIndex = 0; currentIndex < arraySize; currentIndex++) {
        prefixSumsModK[currentIndex + 1] = getPositiveModulo(prefixSumsModK[currentIndex] + inputArray[currentIndex], moduloValue);
    }

    let resultCount = 0;
    const frequencyMap = new Map();

    frequencyMap.set(0, 1);

    for (let currentIndex = 1; currentIndex <= arraySize; currentIndex++) {
        const currentPrefixSum = prefixSumsModK[currentIndex];

        if (moduloValue <= currentIndex) {
            const sumToDecrement = prefixSumsModK[currentIndex - moduloValue];
            if (frequencyMap.has(sumToDecrement)) {
                frequencyMap.set(sumToDecrement, frequencyMap.get(sumToDecrement) - 1);
            } else {
                frequencyMap.set(sumToDecrement, NaN);
            }
        }

        const currentFreqOfSum = frequencyMap.get(currentPrefixSum);

        if (currentFreqOfSum) {
            resultCount += currentFreqOfSum;
            frequencyMap.set(currentPrefixSum, currentFreqOfSum + 1);
        } else {
            frequencyMap.set(currentPrefixSum, 1);
        }
    }

    return resultCount;
}

console.log(solveProblem());
