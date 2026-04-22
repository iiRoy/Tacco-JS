const DataStreamHandler = (function() {
    function createStreamReader(sourceText) {
        return new StreamProcessor(sourceText);
    }

    function StreamProcessor(rawInput) {
        this._sourceLinesBuffer = rawInput.trim().split("\n");
        this._lineCursor = 0;
    }

    StreamProcessor.prototype.extractSingleValue = function(asString = false) {
        let currentLineParts = this._sourceLinesBuffer[this._lineCursor];

        if (typeof currentLineParts === 'string') {
            this._sourceLinesBuffer[this._lineCursor] = currentLineParts.split(" ").reverse();
            currentLineParts = this._sourceLinesBuffer[this._lineCursor];
        }

        const extractedItem = currentLineParts.pop();

        if (currentLineParts.length === 0) {
            this._lineCursor++;
        }
        return asString ? extractedItem : Number(extractedItem);
    };

    StreamProcessor.prototype.readLineAsArray = function(returnStrings = false) {
        const currentLineContent = this._sourceLinesBuffer[this._lineCursor++];
        const splitContent = currentLineContent.split(" ");
        return returnStrings ? splitContent : splitContent.map(val => Number(val));
    };

    StreamProcessor.prototype.readBlockAsMatrix = function(numLines, asStrings = false) {
        let matrixData = [];
        const startIndex = this._lineCursor;
        const endIndex = startIndex + numLines;

        const actualEndIndex = Math.min(endIndex, this._sourceLinesBuffer.length);

        for (let i = startIndex; i < actualEndIndex; i++) {
            const lineParts = this._sourceLinesBuffer[i].split(" ");
            matrixData.push(asStrings ? lineParts : lineParts.map(val => Number(val)));
        }
        this._lineCursor = actualEndIndex;
        return matrixData;
    };

    StreamProcessor.prototype.readBlockOfLines = function(count, asStrings = false) {
        const linesToProcess = this._sourceLinesBuffer.slice(this._lineCursor, this._lineCursor + count);
        this._lineCursor += count;
        return asStrings ? linesToProcess : linesToProcess.map(val => Number(val));
    };

    return createStreamReader;
})();

const inputReader = DataStreamHandler(require("fs").readFileSync("/dev/stdin", "utf8"));

function outputResult(finalSum) {
    console.log(finalSum);
}

outputResult(processDataAndFindMaxSum());

function processDataAndFindMaxSum() {
    const totalElementsAvailable = inputReader.extractSingleValue();
    const maxOperationsBudget = inputReader.extractSingleValue();
    const dataValues = inputReader.readLineAsArray();

    let currentMaxSum = 0;

    for (let totalElementsToTake = 0; totalElementsToTake <= maxOperationsBudget && totalElementsToTake <= totalElementsAvailable; ++totalElementsToTake) {
        for (let elementsFromLeft = 0; elementsFromLeft <= totalElementsToTake; ++elementsFromLeft) {
            let windowNegativeValues = [];
            let currentWindowSum = 0;

            for (let leftIndex = 0; leftIndex < elementsFromLeft; ++leftIndex) {
                const value = dataValues[leftIndex];
                if (value < 0) {
                    windowNegativeValues.push(value);
                }
                currentWindowSum += value;
            }

            const elementsFromRight = totalElementsToTake - elementsFromLeft;

            for (let rightIndex = 0; rightIndex < elementsFromRight; ++rightIndex) {
                const value = dataValues[totalElementsAvailable - 1 - rightIndex];
                if (value < 0) {
                    windowNegativeValues.push(value);
                }
                currentWindowSum += value;
            }

            windowNegativeValues.sort((a, b) => a - b);

            const discardOperationsBudget = maxOperationsBudget - totalElementsToTake;

            for (let discardCount = 0; discardCount < discardOperationsBudget && discardCount < windowNegativeValues.length; ++discardCount) {
                currentWindowSum -= windowNegativeValues[discardCount];
            }

            currentMaxSum = Math.max(currentMaxSum, currentWindowSum);
        }
    }
    return currentMaxSum;
}