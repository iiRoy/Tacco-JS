var InputHandlerFactory = (function () {
    const SPACE_DELIMITER = " ";

    function createInputReader(sourceString) {
        return new InputReader(sourceString);
    }

    function InputReader(rawSource) {
        this._sourceLinesData = rawSource.trim().split("\n");
        this._currentLinePointer = 0;
    }

    InputReader.prototype.popNextValue = function (returnAsString) {
        let currentLineData = this._sourceLinesData;
        let lineIndex = this._currentLinePointer;
        let resultValue;

        if (typeof currentLineData[lineIndex] === "string") {
            currentLineData[lineIndex] = currentLineData[lineIndex].split(SPACE_DELIMITER).reverse();
        }

        resultValue = currentLineData[lineIndex].pop();

        if (!currentLineData[lineIndex].length) {
            this._currentLinePointer++;
        }

        return returnAsString ? resultValue : +resultValue;
    };

    InputReader.prototype.readNumericLine = function (returnAsString) {
        const lineContent = this._sourceLinesData[this._currentLinePointer++];
        const splitLine = lineContent.split(SPACE_DELIMITER);
        return returnAsString ? splitLine : splitLine.map(val => +val);
    };

    InputReader.prototype.readNumericMatrix = function (rowCount, returnAsString) {
        let matrixRows = this._sourceLinesData.slice(this._currentLinePointer, this._currentLinePointer += rowCount);
        let processedMatrix = matrixRows.map(row => row.split(SPACE_DELIMITER));
        return returnAsString ? processedMatrix : processedMatrix.map(row => row.map(val => +val));
    };

    InputReader.prototype.readNumericLines = function (count, returnAsString) {
        let lines = this._sourceLinesData.slice(this._currentLinePointer, this._currentLinePointer += count);
        return returnAsString ? lines : lines.map(line => +line);
    };

    return createInputReader;
})();

var inputProcessor = InputHandlerFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

function initializeMultiDimensionalArray(initialValue) {
    var args = arguments,
        argCount = args.length,
        arrayCreationString = "Array(args[" + --argCount + "]).fill(0).map(x=>{return " + initialValue + ";})";
    while (--argCount) {
        arrayCreationString = "Array(args[" + argCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
    }
    return eval(arrayCreationString);
}

console.log(solveMatchingProblem());

function solveMatchingProblem() {
    var numElements = inputProcessor.popNextValue();
    var preferenceMatrix = inputProcessor.readNumericMatrix(numElements);

    const adjustedPreferenceMatrix = preferenceMatrix.map(row => row.map(val => val - 1));

    var currentPreferenceIndices = initializeMultiDimensionalArray(0, numElements);

    var activeElementsQueue = [];
    for (let i = 0; i < numElements; i++) {
        activeElementsQueue.push(i);
    }

    var matchRounds = 0;
    const maxPreferenceIndex = numElements - 1;

    function processMatchingRound(currentQueue, matrix, indices, maxIdx) {
        const nextRoundQueue = [];
        const processedThisRound = new Set();

        for (let k = 0; k < currentQueue.length; k++) {
            const currentElement = currentQueue[k];

            if (processedThisRound.has(currentElement) || indices[currentElement] === maxIdx) {
                continue;
            }

            const preferredPartner = matrix[currentElement][indices[currentElement]];

            if (currentElement === matrix[preferredPartner][indices[preferredPartner]]) {
                indices[currentElement]++;
                indices[preferredPartner]++;
                nextRoundQueue.push(currentElement, preferredPartner);
                processedThisRound.add(preferredPartner);
            }
        }
        return nextRoundQueue;
    }

    while (activeElementsQueue.length) {
        matchRounds++;
        activeElementsQueue = processMatchingRound(
            activeElementsQueue,
            adjustedPreferenceMatrix,
            currentPreferenceIndices,
            maxPreferenceIndex
        );
    }

    function validateAllMatched(indicesArray, expectedMaxIdx) {
        for (let k = 0; k < numElements; k++) {
            if (indicesArray[k] !== expectedMaxIdx) {
                return false;
            }
        }
        return true;
    }

    if (!validateAllMatched(currentPreferenceIndices, maxPreferenceIndex)) {
        return -1;
    }

    return matchRounds;
}
