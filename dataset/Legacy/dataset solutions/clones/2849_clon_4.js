class InputProcessor {
    #sourceLines;
    #currentLineIndex;
    #currentLineTokens;

    constructor(rawInput) {
        this.#sourceLines = rawInput.trim().split("\n");
        this.#currentLineIndex = 0;
        this.#currentLineTokens = [];
    }

    #ensureTokens() {
        if (this.#currentLineTokens.length === 0 && this.#currentLineIndex < this.#sourceLines.length) {
            this.#currentLineTokens = this.#sourceLines[this.#currentLineIndex].split(" ").reverse();
        }
    }

    fetchToken(asString = false) {
        this.#ensureTokens();
        const token = this.#currentLineTokens.pop();
        if (this.#currentLineTokens.length === 0) {
            this.#currentLineIndex++;
        }
        return asString ? token : Number(token);
    }

    fetchLineTokens(asStrings = false) {
        if (this.#currentLineIndex >= this.#sourceLines.length) {
            return [];
        }
        const line = this.#sourceLines[this.#currentLineIndex++];
        const tokens = line.split(" ");
        return asStrings ? tokens : tokens.map(Number);
    }

    fetchMatrix(rows, asStrings = false) {
        const matrix = [];
        for (let k = 0; k < rows; k++) {
            if (this.#currentLineIndex >= this.#sourceLines.length) {
                break;
            }
            const line = this.#sourceLines[this.#currentLineIndex++];
            const tokens = line.split(" ");
            matrix.push(asStrings ? tokens : tokens.map(Number));
        }
        return matrix;
    }

    fetchLines(rows, asStrings = false) {
        const lines = [];
        for (let k = 0; k < rows; k++) {
            if (this.#currentLineIndex >= this.#sourceLines.length) {
                break;
            }
            const line = this.#sourceLines[this.#currentLineIndex++];
            lines.push(asStrings ? line : Number(line));
        }
        return lines;
    }
}

const inputReader = new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

function makeMultiArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }

    const createDimension = (dimIndex) => {
        if (dimIndex === dimensions.length - 1) {
            return Array.from({ length: dimensions[dimIndex] }, () => initialValue);
        } else {
            return Array.from({ length: dimensions[dimIndex] }, () => createDimension(dimIndex + 1));
        }
    };

    return createDimension(0);
}

console.log(performCalculations());

function performCalculations() {
    const initialCapacity = inputReader.fetchToken();
    const costsA = inputReader.fetchLineTokens();
    const costsB = inputReader.fetchLineTokens();

    const firstSet = costsA.reduce((acc, val, idx) => {
        if (val < costsB[idx]) {
            acc.costs.push(val);
            acc.profits.push(costsB[idx]);
        }
        return acc;
    }, { costs: [], profits: [] });

    const intermediateResult = calculateMaxProfit(initialCapacity, firstSet.costs, firstSet.profits);

    const secondSet = costsA.reduce((acc, val, idx) => {
        if (costsB[idx] < val) {
            acc.costs.push(costsB[idx]);
            acc.profits.push(val);
        }
        return acc;
    }, { costs: [], profits: [] });

    return calculateMaxProfit(intermediateResult, secondSet.costs, secondSet.profits);
}

function calculateMaxProfit(currentCapacity, itemCosts, itemProfits) {
    const itemCount = itemCosts.length;

    if (itemCount === 0) {
        return currentCapacity;
    }

    if (itemCount === 1) {
        const numExchanges = Math.floor(currentCapacity / itemCosts[0]);
        return currentCapacity + (numExchanges * (itemProfits[0] - itemCosts[0]));
    }

    const profitTable = Array(currentCapacity + 1).fill(Number.MIN_SAFE_INTEGER);
    profitTable[0] = currentCapacity;

    const items = itemCosts.map((cost, idx) => ({
        cost: cost,
        gain: itemProfits[idx] - cost
    }));

    for (const item of items) {
        for (let currentCost = item.cost; currentCost <= currentCapacity; currentCost++) {
            if (profitTable[currentCost - item.cost] !== Number.MIN_SAFE_INTEGER) {
                const potentialNewValue = profitTable[currentCost - item.cost] + item.gain;
                if (potentialNewValue > profitTable[currentCost]) {
                    profitTable[currentCost] = potentialNewValue;
                }
            }
        }
    }

    let overallMax = currentCapacity;
    const startIndex = Math.max(0, currentCapacity - 5000);

    for (let i = startIndex; i <= currentCapacity; i++) {
        if (profitTable[i] > overallMax) {
            overallMax = profitTable[i];
        }
    }
    
    return overallMax;
}
