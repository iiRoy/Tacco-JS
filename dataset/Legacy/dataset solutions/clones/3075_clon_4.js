class MinHeap {
    constructor() {
        this._heap = [];
    }

    size() {
        return this._heap.length;
    }

    peek() {
        return this._heap.length === 0 ? undefined : this._heap[0];
    }

    push(value) {
        this._heap.push(value);
        this._bubbleUp(this._heap.length - 1);
    }

    pop() {
        if (this._heap.length === 0) return undefined;
        if (this._heap.length === 1) return this._heap.pop();

        const root = this._heap[0];
        this._heap[0] = this._heap.pop();
        this._bubbleDown(0);
        return root;
    }

    _bubbleUp(idx) {
        while (idx > 0) {
            const parentIdx = Math.floor((idx - 1) / 2);
            if (this._heap[parentIdx] <= this._heap[idx]) break;
            [this._heap[parentIdx], this._heap[idx]] = [this._heap[idx], this._heap[parentIdx]];
            idx = parentIdx;
        }
    }

    _bubbleDown(idx) {
        const lastIdx = this._heap.length - 1;
        while (true) {
            let leftChildIdx = 2 * idx + 1;
            let rightChildIdx = 2 * idx + 2;
            let smallestIdx = idx;

            if (leftChildIdx <= lastIdx && this._heap[leftChildIdx] < this._heap[smallestIdx]) {
                smallestIdx = leftChildIdx;
            }
            if (rightChildIdx <= lastIdx && this._heap[rightChildIdx] < this._heap[smallestIdx]) {
                smallestIdx = rightChildIdx;
            }

            if (smallestIdx === idx) break;

            [this._heap[idx], this._heap[smallestIdx]] = [this._heap[smallestIdx], this._heap[idx]];
            idx = smallestIdx;
        }
    }

    toArray() {
        return [...this._heap];
    }
}

function findTopK(elementsCollection, countLimit) {
    const heapInstance = new MinHeap();
    for (const currentElement of elementsCollection) {
        if (heapInstance.size() < countLimit) {
            heapInstance.push(currentElement);
        } else if (currentElement > heapInstance.peek()) {
            heapInstance.pop();
            heapInstance.push(currentElement);
        }
    }
    return heapInstance.toArray();
}

var INPUT_PARSER = (function() {
    class InputReader {
        constructor(sourceText) {
            this._sourceLines = sourceText.trim().split('\n');
            this._currentLineIndex = 0;
            this._cachedTokens = [];
            this._currentTokenIndex = 0;
        }

        _loadNextLineTokens() {
            if (this._currentLineIndex < this._sourceLines.length) {
                this._cachedTokens = this._sourceLines[this._currentLineIndex].split(' ');
                this._currentTokenIndex = 0;
                this._currentLineIndex++;
            } else {
                this._cachedTokens = [];
                this._currentTokenIndex = 0;
            }
        }

        fetchAtom(asString) {
            if (this._currentTokenIndex >= this._cachedTokens.length) {
                this._loadNextLineTokens();
                if (this._currentTokenIndex >= this._cachedTokens.length) {
                    return undefined;
                }
            }
            const tokenValue = this._cachedTokens[this._currentTokenIndex];
            this._currentTokenIndex++;
            return asString ? tokenValue : +tokenValue;
        }

        fetchLine(asStrings) {
            if (this._currentLineIndex >= this._sourceLines.length) {
                return [];
            }
            const lineContent = this._sourceLines[this._currentLineIndex];
            this._currentLineIndex++;
            this._cachedTokens = [];
            this._currentTokenIndex = 0;
            const lineTokens = lineContent.split(' ');
            return asStrings ? lineTokens : lineTokens.map(Number);
        }

        fetchMatrix(numLines, asStrings) {
            const resultMatrix = [];
            for (let i = 0; i < numLines; i++) {
                if (this._currentLineIndex >= this._sourceLines.length) break;
                const lineContent = this._sourceLines[this._currentLineIndex];
                this._currentLineIndex++;
                this._cachedTokens = [];
                this._currentTokenIndex = 0;
                const lineTokens = lineContent.split(' ');
                resultMatrix.push(asStrings ? lineTokens : lineTokens.map(Number));
            }
            return resultMatrix;
        }

        fetchRaw(numLines, asStrings) {
            const rawLines = [];
            for (let i = 0; i < numLines; i++) {
                if (this._currentLineIndex >= this._sourceLines.length) break;
                const lineContent = this._sourceLines[this._currentLineIndex];
                this._currentLineIndex++;
                this._cachedTokens = [];
                this._currentTokenIndex = 0;
                rawLines.push(asStrings ? lineContent : Number(lineContent));
            }
            return rawLines;
        }
    }

    function createInputReaderInstance(source) {
        const readerInstance = new InputReader(source);
        return {
            a: (asString) => readerInstance.fetchAtom(asString),
            l: (asStrings) => readerInstance.fetchLine(asStrings),
            m: (count, asStrings) => readerInstance.fetchMatrix(count, asStrings),
            r: (count, asStrings) => readerInstance.fetchRaw(count, asStrings)
        };
    }
    return createInputReaderInstance;
})();

function createMultiDimArray(fillValue, ...dimensions) {
    const buildDimensionRecursively = (dimIdx) => {
        if (dimIdx === dimensions.length - 1) {
            return Array(dimensions[dimIdx]).fill(fillValue);
        } else {
            return Array(dimensions[dimIdx]).fill(null).map(() => buildDimensionRecursively(dimIdx + 1));
        }
    };
    return buildDimensionRecursively(0);
}

var o = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

function processMain() {
    const countX = o.a();
    const countY = o.a();
    const countZ = o.a();
    const limitK = o.a();

    const arrayA = o.l().sort((val1, val2) => val2 - val1);
    const arrayB = o.l().sort((val1, val2) => val2 - val1);
    const arrayC = o.l().sort((val1, val2) => val2 - val1);

    const allFirstCombinations = arrayA.slice(0, countX).flatMap(itemA =>
        arrayB.slice(0, countY).map(itemB => itemA + itemB)
    );

    let intermediateResultSums;
    if (allFirstCombinations.length > limitK) {
        intermediateResultSums = findTopK(allFirstCombinations, limitK);
    } else {
        intermediateResultSums = allFirstCombinations;
    }
    intermediateResultSums.sort((val1, val2) => val2 - val1);

    const allSecondCombinations = [];
    for (let i = 0; i < countZ; i++) {
        const currentJLimit = Math.min(intermediateResultSums.length, limitK - i);
        if (currentJLimit <= 0) break;

        for (let j = 0; j < currentJLimit; j++) {
            allSecondCombinations.push(arrayC[i] + intermediateResultSums[j]);
        }
    }

    let finalOutputSums;
    if (allSecondCombinations.length > limitK) {
        finalOutputSums = findTopK(allSecondCombinations, limitK);
    } else {
        finalOutputSums = allSecondCombinations;
    }

    return finalOutputSums.sort((val1, val2) => val2 - val1).join('\n');
}

console.log(processMain());
