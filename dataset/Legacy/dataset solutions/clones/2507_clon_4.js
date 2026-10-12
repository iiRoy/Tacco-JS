"use strict";

const GET = (() => {
    function createInputProcessor(inputContent) {
        const sourceLines = inputContent.trim().split('\n');
        let currentLineIndex = 0;
        let currentLineTokenBuffer = null;
        let tokenPosition = 0;

        const extractSingle = (returnAsString) => {
            if (currentLineTokenBuffer === null || tokenPosition >= currentLineTokenBuffer.length) {
                if (currentLineIndex >= sourceLines.length) {
                    throw new Error("Input exhausted for single item extraction.");
                }
                currentLineTokenBuffer = sourceLines[currentLineIndex].split(' ').reverse();
                tokenPosition = 0;
            }
            const extractedValue = currentLineTokenBuffer[tokenPosition++];
            if (tokenPosition >= currentLineTokenBuffer.length) {
                currentLineIndex++;
                currentLineTokenBuffer = null;
                tokenPosition = 0;
            }
            return returnAsString ? extractedValue : Number(extractedValue);
        };

        const extractFullLine = (returnAsStrings) => {
            if (currentLineIndex >= sourceLines.length) {
                throw new Error("Input exhausted for full line extraction.");
            }
            const lineContent = sourceLines[currentLineIndex++];
            currentLineTokenBuffer = null;
            tokenPosition = 0;
            const tokens = lineContent.split(' ');
            return returnAsStrings ? tokens : tokens.map(Number);
        };

        const extractMatrixData = (rowCount, returnAsStrings) => {
            const matrixResult = [];
            for (let i = 0; i < rowCount; i++) {
                matrixResult.push(extractFullLine(returnAsStrings));
            }
            return matrixResult;
        };

        const extractRawData = (lineCount, returnAsStrings) => {
            const rawResult = [];
            for (let i = 0; i < lineCount; i++) {
                if (currentLineIndex >= sourceLines.length) {
                    throw new Error("Input exhausted for raw data extraction.");
                }
                const lineContent = sourceLines[currentLineIndex++];
                currentLineTokenBuffer = null;
                tokenPosition = 0;
                rawResult.push(returnAsStrings ? lineContent : Number(lineContent));
            }
            return rawResult;
        };

        return {
            getValue: extractSingle,
            getLine: extractFullLine,
            getMatrix: extractMatrixData,
            getLines: extractRawData
        };
    }
    return createInputProcessor;
})();

function generateMultiDimensionalArray(initialFillValue, ...dimensions) {
    const constructRecursive = (dims) => {
        if (dims.length === 0) {
            return initialFillValue;
        }
        const currentDimensionSize = dims[0];
        const remainingDimensions = dims.slice(1);
        return Array.from({ length: currentDimensionSize }, () => constructRecursive(remainingDimensions));
    };
    return constructRecursive(dimensions);
}
const xArray = generateMultiDimensionalArray;

const inputReader = GET(require("fs").readFileSync("/dev/stdin", "utf8"));
const INFINITY_VAL = 1e15;

console.log(main());

function main() {
    const totalItems = inputReader.getValue();
    const itemValues = inputReader.getLine();

    const frequencyCounter = itemValues.reduce((accumulator, value) => {
        accumulator.set(value - 1, (accumulator.get(value - 1) || 0) + 1);
        return accumulator;
    }, new Map());

    const sortedFrequencies = Array.from(frequencyCounter.values()).sort((a, b) => b - a);

    const resultOutputs = [];
    resultOutputs.push(totalItems);

    for (let kGroupCount = 2; kGroupCount <= totalItems; kGroupCount++) {
        if (sortedFrequencies.length < kGroupCount) {
            resultOutputs.push(0);
        } else {
            let lowerBound = 0;
            let upperBound = Math.floor(totalItems / kGroupCount);
            let maxAchievableSize = 0;

            while (lowerBound <= upperBound) {
                const candidateSize = Math.floor((lowerBound + upperBound) / 2);
                let typesMeetingSize = 0;
                for (let freq of sortedFrequencies) {
                    if (freq >= candidateSize) {
                        typesMeetingSize++;
                    } else {
                        break;
                    }
                }

                if (typesMeetingSize >= kGroupCount) {
                    maxAchievableSize = candidateSize;
                    lowerBound = candidateSize + 1;
                } else {
                    upperBound = candidateSize - 1;
                }
            }
            resultOutputs.push(maxAchievableSize);
        }
    }

    return resultOutputs.join("\n");
}
