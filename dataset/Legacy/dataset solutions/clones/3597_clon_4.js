function createInputProcessor(inputString) {
    const lineSegments = inputString.split("\n");
    let currentLineIndex = 0;
    const lineTokenCaches = new Map();

    const extractAtom = (asString) => {
        if (currentLineIndex >= lineSegments.length) {
            return undefined;
        }

        let currentLineTokens = lineTokenCaches.get(currentLineIndex);

        if (!currentLineTokens) {
            const lineContent = lineSegments[currentLineIndex];
            currentLineTokens = lineContent.split(" ").reverse();
            lineTokenCaches.set(currentLineIndex, currentLineTokens);
        }

        const value = currentLineTokens.pop();

        if (currentLineTokens.length === 0) {
            currentLineIndex++;
            lineTokenCaches.delete(currentLineIndex - 1);
        }

        return asString ? value : Number(value);
    };

    const fetchLine = (asStrings) => {
        if (currentLineIndex >= lineSegments.length) {
            return undefined;
        }
        lineTokenCaches.delete(currentLineIndex);
        const lineContent = lineSegments[currentLineIndex++];
        const tokens = lineContent.split(" ");
        return asStrings ? tokens : tokens.map(Number);
    };

    const acquireMultipleLines = (count, asStrings) => {
        const startIndex = currentLineIndex;
        currentLineIndex += count;
        return Array.from({ length: count }, (_, k) => {
            const lineIdx = startIndex + k;
            if (lineIdx >= lineSegments.length) {
                return undefined;
            }
            lineTokenCaches.delete(lineIdx);
            const lineContent = lineSegments[lineIdx];
            const tokens = lineContent.split(" ");
            return asStrings ? tokens : tokens.map(Number);
        });
    };

    return {
        extractAtom,
        fetchLine,
        acquireMultipleLines,
    };
}

function findKthSmallest(collection, kTarget) {
    if (kTarget < 0 || kTarget >= collection.length) {
        throw new Error("Target index k is out of bounds.");
    }

    const partitionElements = (items, low, high, pivotIdx) => {
        const pivotVal = items[pivotIdx];
        [items[pivotIdx], items[high]] = [items[high], items[pivotIdx]];
        let storeIdx = low;
        for (let j = low; j < high; j++) {
            if (items[j] < pivotVal) {
                [items[storeIdx], items[j]] = [items[j], items[storeIdx]];
                storeIdx++;
            }
        }
        [items[high], items[storeIdx]] = [items[storeIdx], items[high]];
        return storeIdx;
    };

    const recursiveSelect = (items, low, high, k) => {
        if (low === high) {
            return items[low];
        }

        let pivotIndex = low + Math.floor(Math.random() * (high - low + 1));
        pivotIndex = partitionElements(items, low, high, pivotIndex);

        if (k === pivotIndex) {
            return items[k];
        } else if (k < pivotIndex) {
            return recursiveSelect(items, low, pivotIndex - 1, k);
        } else {
            return recursiveSelect(items, pivotIndex + 1, high, k);
        }
    };

    return recursiveSelect(collection, 0, collection.length - 1, kTarget);
}

function executeProblemSolution() {
    const dataReader = createInputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

    const elementCount = dataReader.extractAtom();
    const initialSequence = dataReader.fetchLine();

    if (elementCount <= 2) {
        return Math.max(...initialSequence);
    }

    const derivedMaximums = Array.from({ length: elementCount - 1 }, (_, idx) =>
        Math.max(initialSequence[idx], initialSequence[idx + 1])
    );

    const combinedSequence = [...initialSequence, ...derivedMaximums];

    const medianIndex = Math.floor(combinedSequence.length / 2);
    return findKthSmallest(combinedSequence, medianIndex);
}

console.log(executeProblemSolution());
