var createInputProcessor = (function() {
    function create(inputString) {
        return new InputProcessor(inputString);
    }

    function InputProcessor(inputString) {
        this._allLines = inputString.trim().split("\n");
        this._currentLineIndex = 0;
        this._currentLineTokens = null;
        this._currentTokenIndex = 0;
    }

    InputProcessor.prototype.readNextToken = function(asString) {
        if (this._currentLineTokens === null || this._currentTokenIndex >= this._currentLineTokens.length) {
            if (this._currentLineIndex >= this._allLines.length) {
                return undefined;
            }
            this._currentLineTokens = this._allLines[this._currentLineIndex].split(" ");
            this._currentTokenIndex = 0;
            this._currentLineIndex++;
        }
        const token = this._currentLineTokens[this._currentTokenIndex++];
        return asString ? token : Number(token);
    };

    InputProcessor.prototype.readFullLine = function(asStrings) {
        if (this._currentLineIndex >= this._allLines.length) {
            return undefined;
        }
        this._currentLineTokens = null;
        this._currentTokenIndex = 0;

        const line = this._allLines[this._currentLineIndex++];
        const tokens = line.split(" ");
        return asStrings ? tokens : tokens.map(Number);
    };

    InputProcessor.prototype.readMultipleLines = function(count, asStrings) {
        this._currentLineTokens = null;
        this._currentTokenIndex = 0;

        const result = [];
        for (let k = 0; k < count; k++) {
            if (this._currentLineIndex >= this._allLines.length) {
                break;
            }
            const line = this._allLines[this._currentLineIndex++];
            const tokens = line.split(" ");
            result.push(asStrings ? tokens : tokens.map(Number));
        }
        return result;
    };

    InputProcessor.prototype.readRawLines = function(count, asNumbers) {
        this._currentLineTokens = null;
        this._currentTokenIndex = 0;

        const result = [];
        for (let k = 0; k < count; k++) {
            if (this._currentLineIndex >= this._allLines.length) {
                break;
            }
            const line = this._allLines[this._currentLineIndex++];
            result.push(asNumbers ? Number(line) : line);
        }
        return result;
    };

    return create;
})();
var inputProcessor = createInputProcessor(require("fs").readFileSync("/dev/stdin","utf8"));

function createMultiDimArray(initialValue) {
    const dimensions = Array.from(arguments).slice(1);
    const createRecursive = (dims) => {
        if (dims.length === 0) {
            return initialValue;
        }
        const currentDimSize = dims[0];
        const remainingDims = dims.slice(1);
        return Array.from({ length: currentDimSize }, () => createRecursive(remainingDims));
    };
    return createRecursive(dimensions);
}

var createMinHeap = (function() {
    function factory() {
        return new MinHeap();
    }

    function MinHeap() {
        this._elements = [];
        this._comparator = (a, b) => a.priority - b.priority;
    }

    MinHeap.prototype.insert = function(item) {
        this._elements.push(item);
        this._siftUp(this._elements.length - 1);
    };

    MinHeap.prototype.extractMin = function() {
        if (this._elements.length === 0) {
            return undefined;
        }
        if (this._elements.length === 1) {
            return this._elements.pop();
        }

        const minItem = this._elements[0];
        this._elements[0] = this._elements.pop();
        this._siftDown(0);
        return minItem;
    };

    MinHeap.prototype._siftUp = function(index) {
        let currentIdx = index;
        const currentElement = this._elements[currentIdx];

        while (currentIdx > 0) {
            const parentIdx = Math.floor((currentIdx - 1) / 2);
            const parentElement = this._elements[parentIdx];

            if (this._comparator(currentElement, parentElement) >= 0) {
                break;
            }

            this._elements[currentIdx] = parentElement;
            currentIdx = parentIdx;
        }
        this._elements[currentIdx] = currentElement;
    };

    MinHeap.prototype._siftDown = function(index) {
        let currentIdx = index;
        const count = this._elements.length;
        const currentElement = this._elements[currentIdx];

        while (true) {
            const leftChildIdx = 2 * currentIdx + 1;
            const rightChildIdx = 2 * currentIdx + 2;
            let smallestChildIdx = currentIdx;

            if (leftChildIdx < count && this._comparator(this._elements[leftChildIdx], this._elements[smallestChildIdx]) < 0) {
                smallestChildIdx = leftChildIdx;
            }

            if (rightChildIdx < count && this._comparator(this._elements[rightChildIdx], this._elements[smallestChildIdx]) < 0) {
                smallestChildIdx = rightChildIdx;
            }

            if (smallestChildIdx === currentIdx) {
                break;
            }

            this._elements[currentIdx] = this._elements[smallestChildIdx];
            currentIdx = smallestChildIdx;
        }
        this._elements[currentIdx] = currentElement;
    };

    Object.defineProperty(MinHeap.prototype, 'size', {
        get: function() { return this._elements.length; }
    });

    return factory;
})();

console.log(processSequence());

function processSequence() {
    const sequenceLength = inputProcessor.readNextToken();
    const sequenceA = inputProcessor.readFullLine();
    const sequenceB = inputProcessor.readFullLine();

    const activeElements = createMinHeap();

    for (let currentIdx = 0; currentIdx < sequenceLength; currentIdx++) {
        if (sequenceA[currentIdx] === sequenceB[currentIdx]) {
            continue;
        }
        if (sequenceA[currentIdx] > sequenceB[currentIdx]) {
            return -1;
        }
        activeElements.insert({ priority: -sequenceB[currentIdx], originalIndex: currentIdx });
    }

    let totalOperations = 0;

    while (activeElements.size > 0) {
        const extractedItem = activeElements.extractMin();
        const elementIndex = extractedItem.originalIndex;

        const neighborSum = sequenceB[(elementIndex + sequenceLength - 1) % sequenceLength] + sequenceB[(elementIndex + 1) % sequenceLength];
        const operationCount = Math.floor(sequenceB[elementIndex] / neighborSum);

        if (operationCount === 0) {
            return -1;
        }

        totalOperations += operationCount;
        sequenceB[elementIndex] %= neighborSum;

        if (sequenceA[elementIndex] === sequenceB[elementIndex]) {
            continue;
        }
        if (sequenceA[elementIndex] > sequenceB[elementIndex]) {
            return -1;
        }
        activeElements.insert({ priority: -sequenceB[elementIndex], originalIndex: elementIndex });
    }
    return totalOperations;
}
