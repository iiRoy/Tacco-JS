class InputProcessor {
    constructor(rawInput) {
        this._lines = rawInput.trim().split("\n");
        this._currentLineIndex = 0;
        this._currentLineTokens = null;
    }

    _ensureLineTokens() {
        if (this._currentLineTokens === null || this._currentLineTokens.length === 0) {
            if (this._currentLineIndex >= this._lines.length) {
                throw new Error("End of input reached.");
            }
            const line = this._lines[this._currentLineIndex];
            this._currentLineTokens = line.split(" ").reverse();
        }
    }

    extractToken(asNumber = false) {
        this._ensureLineTokens();
        const token = this._currentLineTokens.pop();
        if (this._currentLineTokens.length === 0) {
            this._currentLineIndex++;
            this._currentLineTokens = null;
        }
        return asNumber ? +token : token;
    }

    extractLine(asNumber = false) {
        if (this._currentLineIndex >= this._lines.length) {
            throw new Error("End of input reached for line extraction.");
        }
        const line = this._lines[this._currentLineIndex++];
        const tokens = line.split(" ");
        return asNumber ? tokens.map(Number) : tokens;
    }

    extractMatrix(rowCount, asNumber = false) {
        const matrix = [];
        for (let i = 0; i < rowCount; i++) {
            matrix.push(this.extractLine(asNumber));
        }
        return matrix;
    }

    extractRawLines(rowCount, asNumber = false) {
        const lines = [];
        for (let i = 0; i < rowCount; i++) {
            if (this._currentLineIndex >= this._lines.length) {
                throw new Error("End of input reached for raw line extraction.");
            }
            const line = this._lines[this._currentLineIndex++];
            lines.push(asNumber ? +line : line);
        }
        return lines;
    }
}

function createNestedArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }
    const currentDim = dimensions[0];
    const remainingDims = dimensions.slice(1);
    return Array.from({ length: currentDim }, () => createNestedArray(initialValue, ...remainingDims));
}

class OrderedCollection {
    constructor() {
        this._entries = [];
    }

    addEntry(item) {
        let low = 0;
        let high = this._entries.length;
        while (low < high) {
            const mid = Math.floor((low + high) / 2);
            if (this._entries[mid][0] < item[0]) {
                low = mid + 1;
            } else {
                high = mid;
            }
        }
        this._entries.splice(low, 0, item);
    }

    retrieveEntry() {
        if (this._entries.length === 0) {
            return undefined;
        }
        return this._entries.shift();
    }

    getSize() {
        return this._entries.length;
    }
}

const inputSource = new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

function executeProblem() {
    const sequenceLength = inputSource.extractToken(true);
    const initialValues = inputSource.extractLine(true);
    const targetValues = inputSource.extractLine(true);

    const adjustmentQueue = new OrderedCollection();
    let totalAdjustments = 0;

    const initialCheckResult = initialValues.reduce((acc, currentVal, idx) => {
        if (acc === -1) return -1;
        const targetVal = targetValues[idx];
        if (currentVal === targetVal) {
            return acc;
        }
        if (currentVal > targetVal) {
            return -1;
        }
        adjustmentQueue.addEntry([-targetVal, idx]);
        return acc;
    }, 0);

    if (initialCheckResult === -1) {
        return -1;
    }

    while (adjustmentQueue.getSize() > 0) {
        const currentEntry = adjustmentQueue.retrieveEntry();
        const currentIdx = currentEntry[1];

        const prevIdx = (currentIdx + sequenceLength - 1) % sequenceLength;
        const nextIdx = (currentIdx + 1) % sequenceLength;
        const neighborSum = targetValues[prevIdx] + targetValues[nextIdx];

        const requiredDiff = targetValues[currentIdx] - initialValues[currentIdx];
        const adjustmentFactor = Math.floor(requiredDiff / neighborSum);

        if (adjustmentFactor === 0) {
            return -1;
        }

        totalAdjustments += adjustmentFactor;
        initialValues[currentIdx] += neighborSum * adjustmentFactor;

        if (initialValues[currentIdx] === targetValues[currentIdx]) {
            continue;
        }
        if (initialValues[currentIdx] > targetValues[currentIdx]) {
            return -1;
        }
        adjustmentQueue.addEntry([-targetValues[currentIdx], currentIdx]);
    }

    return totalAdjustments;
}

console.log(executeProblem());
