class DataStreamProcessor {
    #allLines;
    #currentLineIndex = 0;
    #currentLineTokens = null;

    constructor(sourceString) {
        this.#allLines = sourceString.trim().split("\n");
    }

    #prepareCurrentLineForTokens() {
        if (this.#currentLineIndex >= this.#allLines.length) {
            return false;
        }
        let lineContent = this.#allLines[this.#currentLineIndex];
        if (typeof lineContent === "string") {
            this.#allLines[this.#currentLineIndex] = lineContent.split(" ").reverse();
        }
        this.#currentLineTokens = this.#allLines[this.#currentLineIndex];
        return true;
    }

    fetchNextItem(asString = false) {
        if (!this.#currentLineTokens || this.#currentLineTokens.length === 0) {
            if (!this.#prepareCurrentLineForTokens()) {
                return undefined;
            }
        }

        const item = this.#currentLineTokens.pop();
        if (this.#currentLineTokens.length === 0) {
            this.#currentLineIndex++;
            this.#currentLineTokens = null;
        }
        return asString ? item : Number(item);
    }

    fetchLineItems(asStrings = false) {
        if (this.#currentLineIndex >= this.#allLines.length) {
            return [];
        }
        const lineContent = this.#allLines[this.#currentLineIndex++];
        const items = lineContent.split(" ");
        return asStrings ? items : items.map(Number);
    }

    fetchMatrix(rowsToRead, asStrings = false) {
        const matrix = [];
        for (let k = 0; k < rowsToRead; k++) {
            matrix.push(this.fetchLineItems(asStrings));
        }
        return matrix;
    }

    fetchColumn(rowsToRead, asStrings = false) {
        const column = [];
        for (let k = 0; k < rowsToRead; k++) {
            const lineContent = this.#allLines[this.#currentLineIndex++];
            column.push(asStrings ? lineContent : Number(lineContent));
        }
        return column;
    }
}

const inputProcessor = new DataStreamProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimensionalArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }
    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);
    return Array.from({ length: currentDimensionSize }, () =>
        createMultiDimensionalArray(initialValue, ...remainingDimensions)
    );
}

const MOD_CONSTANT = 998244353;

function modularProduct(factorA, factorB) {
    return Number((BigInt(factorA) * BigInt(factorB)) % BigInt(MOD_CONSTANT));
}

function modularExponentiation(baseValue, exponentValue) {
    let resultAccumulator = 1;
    let currentBase = baseValue;
    let currentExponent = exponentValue;

    while (currentExponent > 0) {
        if (currentExponent % 2 === 1) {
            resultAccumulator = modularProduct(resultAccumulator, currentBase);
        }
        currentBase = modularProduct(currentBase, currentBase);
        currentExponent = Math.floor(currentExponent / 2);
    }
    return resultAccumulator;
}

function calculateMainResult() {
    const elementCount = inputProcessor.fetchNextItem();
    const numberSequence = inputProcessor.fetchColumn(elementCount).sort((valA, valB) => valA - valB);
    const totalSum = numberSequence.reduce((acc, val) => acc + val, 0);

    let sumCounts = [1];

    sumCounts = numberSequence.reduce((currentSumCounts, currentElement) => {
        const nextSumCounts = createMultiDimensionalArray(0, currentSumCounts.length + currentElement);
        
        for (let s = 0; s < currentSumCounts.length; s++) {
            if (currentSumCounts[s] === 0) continue;

            nextSumCounts[s] = (nextSumCounts[s] + modularProduct(currentSumCounts[s], 2)) % MOD_CONSTANT;
            nextSumCounts[s + currentElement] = (nextSumCounts[s + currentElement] + currentSumCounts[s]) % MOD_CONSTANT;
        }
        return nextSumCounts;
    }, sumCounts);

    let finalAnswer = modularExponentiation(3, elementCount);

    if (totalSum % 2 === 0) {
        finalAnswer = (finalAnswer + computeSubsetSumWays(numberSequence, elementCount, totalSum / 2)) % MOD_CONSTANT;
    }

    const halfTotalSumCeil = (totalSum + 1) >> 1;

    for (let s = halfTotalSumCeil; s < sumCounts.length; s++) {
        finalAnswer = (finalAnswer - modularProduct(sumCounts[s], 3) + MOD_CONSTANT) % MOD_CONSTANT;
    }

    return (finalAnswer + MOD_CONSTANT) % MOD_CONSTANT;
}

function computeSubsetSumWays(sequence, count, targetSum) {
    let ways = [1];

    ways = sequence.reduce((currentWays, currentElement) => {
        const nextWays = createMultiDimensionalArray(0, currentWays.length + currentElement);
        
        for (let s = 0; s < currentWays.length; s++) {
            if (currentWays[s] === 0) continue;

            nextWays[s] = (nextWays[s] + currentWays[s]) % MOD_CONSTANT;
            nextWays[s + currentElement] = (nextWays[s + currentElement] + currentWays[s]) % MOD_CONSTANT;
        }
        return nextWays;
    }, ways);

    return modularProduct(ways[targetSum] || 0, 3);
}

console.log(calculateMainResult());
