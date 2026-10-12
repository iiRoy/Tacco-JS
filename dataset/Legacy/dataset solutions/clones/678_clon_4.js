class OperationFailure extends Error {
    constructor(message) {
        super(message);
        this.name = "OperationFailure";
    }
    static report(msg) {
        throw new OperationFailure(msg);
    }
}

const StringComposer = {
    duplicate(count, char) {
        if (count <= 0) return "";
        return char.repeat(count);
    }
};

const NumericProcessor = {
    highest(val1, val2) {
        return val1 > val2 ? val1 : val2;
    }
};

class DataExtractor {
    constructor() {
        this.rawContent = require("fs").readFileSync("/dev/stdin", "utf8");
        this.tokens = this.rawContent.split(/\s+/).filter(Boolean);
        this.currentTokenIndex = 0;
    }

    fetchNextInteger() {
        if (this.currentTokenIndex >= this.tokens.length) {
            OperationFailure.report("Incomplete input data encountered.");
        }
        const value = parseInt(this.tokens[this.currentTokenIndex++], 10);
        if (isNaN(value)) {
            OperationFailure.report("Malformed numeric input detected.");
        }
        return value;
    }

    *generateTestCases() {
        while (true) {
            const arrayLength = this.fetchNextInteger();
            const windowSize = this.fetchNextInteger();

            if (arrayLength === 0 && windowSize === 0) {
                break;
            }

            const numbersArray = [];
            for (let i = 0; i < arrayLength; i++) {
                numbersArray.push(this.fetchNextInteger());
            }
            yield { arrayLength, windowSize, numbersArray };
        }
    }
}

const ProductEvaluator = {
    compute(sourceArray, startIndex, size) {
        let currentProduct = 1;
        for (let i = 0; i < size; i++) {
            currentProduct *= sourceArray[startIndex + i];
        }
        return currentProduct;
    }
};

class SegmentMaxTree {
    constructor(leafNodeCount) {
        this.leafNodeCount = leafNodeCount;
        if (leafNodeCount <= 0) {
            this.tree = [];
            return;
        }
        this.tree = new Array(2 * leafNodeCount - 1).fill(0);
    }

    initialize(initialLeafValues) {
        if (this.leafNodeCount <= 0) return;
        for (let i = 0; i < this.leafNodeCount; i++) {
            this.tree[this.leafNodeCount - 1 + i] = initialLeafValues[i];
        }
        for (let i = this.leafNodeCount - 2; i >= 0; i--) {
            this.tree[i] = NumericProcessor.highest(this.tree[2 * i + 1], this.tree[2 * i + 2]);
        }
    }

    modifyLeaf(leafIdentifier, newValue) {
        if (this.leafNodeCount <= 0) return;
        let currentTreeIndex = this.leafNodeCount - 1 + leafIdentifier;
        this.tree[currentTreeIndex] = newValue;

        while (currentTreeIndex > 0) {
            currentTreeIndex = Math.floor((currentTreeIndex - 1) / 2);
            this.tree[currentTreeIndex] = NumericProcessor.highest(this.tree[2 * currentTreeIndex + 1], this.tree[2 * currentTreeIndex + 2]);
        }
    }

    retrieveMax() {
        if (this.leafNodeCount <= 0) return 0; // Or some appropriate default for empty set
        return this.tree[0];
    }
}

class GameSolver {
    constructor(arrayLength, windowSize, numbers) {
        this.arrayLength = arrayLength;
        this.windowSize = windowSize;
        this.numbers = [...numbers];

        const numWindows = this.arrayLength - this.windowSize + 1;
        this.initialWindowProducts = [];
        if (numWindows > 0) {
            for (let i = 0; i < numWindows; i++) {
                this.initialWindowProducts.push(ProductEvaluator.compute(this.numbers, i, this.windowSize));
            }
        }
        
        this.valueSegmentTree = new SegmentMaxTree(numWindows);
        this.valueSegmentTree.initialize(this.initialWindowProducts);
        this.originalMaxProduct = this.valueSegmentTree.retrieveMax();
        this.overallBestResult = this.originalMaxProduct;
    }

    updateRelevantWindows(modifiedIndex, changeLog) {
        const affectedWindowStart = NumericProcessor.highest(0, modifiedIndex - this.windowSize + 1);
        const affectedWindowEnd = NumericProcessor.highest(-1, Math.min(this.arrayLength - this.windowSize, modifiedIndex));

        for (let windowIndex = affectedWindowStart; windowIndex <= affectedWindowEnd; windowIndex++) {
            const currentProductInTree = this.valueSegmentTree.tree[this.valueSegmentTree.leafNodeCount - 1 + windowIndex];
            changeLog.push({ windowIndex, previousProduct: currentProductInTree });
            const recalculatedProduct = ProductEvaluator.compute(this.numbers, windowIndex, this.windowSize);
            this.valueSegmentTree.modifyLeaf(windowIndex, recalculatedProduct);
        }
    }

    restoreWindowUpdates(changeLog) {
        while (changeLog.length > 0) {
            const { windowIndex, previousProduct } = changeLog.pop();
            this.valueSegmentTree.modifyLeaf(windowIndex, previousProduct);
        }
    }

    execute() {
        for (let idx1 = 0; idx1 < this.arrayLength; idx1++) {
            for (let idx2 = idx1 + 1; idx2 < this.arrayLength; idx2++) {
                const valA = this.numbers[idx1];
                const valB = this.numbers[idx2];

                [this.numbers[idx1], this.numbers[idx2]] = [this.numbers[idx2], this.numbers[idx1]];

                const changeRecord = [];
                this.updateRelevantWindows(idx1, changeRecord);
                this.updateRelevantWindows(idx2, changeRecord);

                const currentMaxProduct = this.valueSegmentTree.retrieveMax();
                this.overallBestResult = NumericProcessor.highest(this.overallBestResult, currentMaxProduct);

                [this.numbers[idx1], this.numbers[idx2]] = [valA, valB];
                this.restoreWindowUpdates(changeRecord);
            }
        }

        const improvement = this.overallBestResult - this.originalMaxProduct;
        if (improvement < 0) {
            console.log("NO GAME");
        } else {
            console.log(improvement);
        }
    }
}

(function() {
    try {
        const dataReader = new DataExtractor();
        for (const { arrayLength, windowSize, numbersArray } of dataReader.generateTestCases()) {
            if (windowSize > arrayLength || windowSize <= 0 || arrayLength <= 0) {
                console.log("NO GAME");
                continue;
            }
            const solver = new GameSolver(arrayLength, windowSize, numbersArray);
            solver.execute();
        }
    } catch (error) {
        if (error instanceof OperationFailure) {
            console.error("Processing halted: " + error.message);
        } else {
            console.error("An unhandled exception occurred: " + error.message);
        }
    }
})();