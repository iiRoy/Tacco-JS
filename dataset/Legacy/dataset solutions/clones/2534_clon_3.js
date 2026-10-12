const InputReaderFactory = (function() {
    function InputReader(sourceString) {
        this._sourceLines = sourceString.trim().split("\n");
        this._currentLineIndex = 0;
    }

    InputReader.prototype.readNextValue = function(asString) {
        let currentLineTokens = this._sourceLines[this._currentLineIndex];
        if (typeof currentLineTokens === "string") {
            this._sourceLines[this._currentLineIndex] = currentLineTokens.split(" ").reverse();
            currentLineTokens = this._sourceLines[this._currentLineIndex];
        }
        const extractedValue = currentLineTokens.pop();
        if (!currentLineTokens.length) {
            this._currentLineIndex++;
        }
        return asString ? extractedValue : Number(extractedValue);
    };

    InputReader.prototype.readLineValues = function(asStrings) {
        const lineContent = this._sourceLines[this._currentLineIndex++];
        const values = lineContent.split(" ");
        return asStrings ? values : values.map(val => Number(val));
    };

    InputReader.prototype.readMatrix = function(rowCount, asStrings) {
        const matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex + rowCount);
        this._currentLineIndex += rowCount;
        const parsedMatrix = matrixRows.map(row => row.split(" "));
        return asStrings ? parsedMatrix : parsedMatrix.map(row => row.map(val => Number(val)));
    };

    InputReader.prototype.readLines = function(rowCount, asStrings) {
        const lines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex + rowCount);
        this._currentLineIndex += rowCount;
        return asStrings ? lines : lines.map(line => Number(line));
    };

    return function createReader(sourceString) {
        return new InputReader(sourceString);
    };
})();

const inputParser = InputReaderFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue, ...dimensions) {
    const buildArrayRecursive = (dims) => {
        if (dims.length === 0) {
            return initialValue;
        }
        const currentDimensionSize = dims[0];
        const remainingDimensions = dims.slice(1);
        return Array(currentDimensionSize).fill(null).map(() => buildArrayRecursive(remainingDimensions));
    };
    return buildArrayRecursive(dimensions);
}

const MAX_COST = 1e9;

console.log(main());

function main() {
    const numItems = inputParser.readNextValue();
    const numSets = inputParser.readNextValue();

    const setCosts = Array(numSets);
    const setBitmasks = Array(numSets);

    const calculateSetMask = (countOfItemsInSet) => {
        let currentSetMask = 0;
        for (let k = 0; k < countOfItemsInSet; k++) {
            const itemIndex = inputParser.readNextValue();
            currentSetMask |= (1 << (itemIndex - 1));
        }
        return currentSetMask;
    };

    for (let setIdx = 0; setIdx < numSets; setIdx++) {
        setCosts[setIdx] = inputParser.readNextValue();
        const itemsInSetCount = inputParser.readNextValue();
        setBitmasks[setIdx] = calculateSetMask(itemsInSetCount);
    }

    const totalStates = 1 << numItems;
    const minCosts = createMultiDimArray(MAX_COST, totalStates);
    minCosts[0] = 0;

    for (let currentStateIdx = 0; currentStateIdx < totalStates; currentStateIdx++) {
        if (minCosts[currentStateIdx] === MAX_COST) {
            continue;
        }

        for (let setIdx = 0; setIdx < numSets; setIdx++) {
            const costToReachCurrentState = minCosts[currentStateIdx];
            const currentSetCost = setCosts[setIdx];
            const currentSetMask = setBitmasks[setIdx];

            const nextStateIdx = currentStateIdx | currentSetMask;
            const potentialNewCost = costToReachCurrentState + currentSetCost;

            minCosts[nextStateIdx] = Math.min(minCosts[nextStateIdx], potentialNewCost);
        }
    }

    const finalStateIdx = totalStates - 1;
    const resultCost = minCosts[finalStateIdx];

    return resultCost === MAX_COST ? -1 : resultCost;
}
