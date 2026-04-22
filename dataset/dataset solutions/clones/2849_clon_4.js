class InputProcessor {
    #sourceTextLines;
    #currentLineIndex;
    #cachedLineTokens;

    constructor(initialContent) {
        this.#sourceTextLines = initialContent.split(/\r?\n/).map(txt => txt.trim()).filter(txt => txt.length > 0);
        this.#currentLineIndex = 0;
        this.#cachedLineTokens = [];
    }

    // Corresponds to GET.a() - reads a single token from the current line, right-to-left
    fetchSingle(asString = false) {
        if (this.#cachedLineTokens.length === 0) {
            if (this.#currentLineIndex >= this.#sourceTextLines.length) {
                throw new Error("No further input available.");
            }
            this.#cachedLineTokens = this.#sourceTextLines[this.#currentLineIndex].split(/\s+/).filter(t => t.length > 0).reverse();
        }
        const tokenValue = this.#cachedLineTokens.pop();
        if (this.#cachedLineTokens.length === 0) {
            this.#currentLineIndex++;
        }
        return asString ? tokenValue : Number(tokenValue);
    }

    // Corresponds to GET.l() - reads an entire line as an array of tokens, left-to-right
    fetchLineTokens(asStrings = false) {
        if (this.#currentLineIndex >= this.#sourceTextLines.length) {
            throw new Error("No further input available.");
        }
        this.#cachedLineTokens = []; // Clear any partially consumed line tokens
        const lineContent = this.#sourceTextLines[this.#currentLineIndex++];
        const tokensArray = lineContent.split(/\s+/).filter(t => t.length > 0);
        return asStrings ? tokensArray : tokensArray.map(Number);
    }

    // Corresponds to GET.m() - reads multiple lines as a 2D array
    fetchMatrixTokens(lineCount, asStrings = false) {
        const matrixResult = [];
        for (let i = 0; i < lineCount; i++) {
            matrixResult.push(this.fetchLineTokens(asStrings));
        }
        return matrixResult;
    }

    // Corresponds to GET.r() - reads multiple lines as a 1D array (each line is one element)
    fetchSequentialValues(count, asStrings = false) {
        const sequenceResult = [];
        for (let i = 0; i < count; i++) {
            if (this.#currentLineIndex >= this.#sourceTextLines.length) {
                throw new Error("No further input available.");
            }
            const lineValue = this.#sourceTextLines[this.#currentLineIndex++];
            sequenceResult.push(asStrings ? lineValue : Number(lineValue));
        }
        this.#cachedLineTokens = []; // Clear any partially consumed line tokens
        return sequenceResult;
    }
}

const createDynamicArray = (...argumentsList) => {
    const fillingValue = argumentsList[0];
    const arrayDimensions = argumentsList.slice(1);

    if (arrayDimensions.length === 0) {
        // Handles xArray(value) -> Array(value).map(() => value)
        return Array.from({ length: fillingValue }).map(() => fillingValue);
    }

    const recursiveArrayBuilder = (currentDepth) => {
        if (currentDepth === arrayDimensions.length - 1) {
            return Array.from({ length: arrayDimensions[currentDepth] }).map(() => fillingValue);
        }
        return Array.from({ length: arrayDimensions[currentDepth] }).map(() => recursiveArrayBuilder(currentDepth + 1));
    };

    return recursiveArrayBuilder(0);
};

const performOverallCalculation = () => {
    const dataStream = new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

    const initialQuantity = dataStream.fetchSingle();
    const listAlpha = dataStream.fetchLineTokens();
    const listBeta = dataStream.fetchLineTokens();

    const firstTransformationSet = listAlpha.reduce((accumulator, valueAlpha, index) => {
        if (valueAlpha < listBeta[index]) {
            accumulator.push({ cost: valueAlpha, gain: listBeta[index] });
        }
        return accumulator;
    }, []);

    const firstResult = determineOptimalValue(initialQuantity, firstTransformationSet);

    const secondTransformationSet = listBeta.reduce((accumulator, valueBeta, index) => {
        if (valueBeta < listAlpha[index]) {
            accumulator.push({ cost: valueBeta, gain: listAlpha[index] });
        }
        return accumulator;
    }, []);

    return determineOptimalValue(firstResult, secondTransformationSet);
};

const determineOptimalValue = (startingValue, transformationsList) => {
    const numTransformations = transformationsList.length;

    if (numTransformations === 0) {
        return startingValue;
    }

    if (numTransformations === 1) {
        const { cost: singleCost, gain: singleGain } = transformationsList[0];
        const applicationCount = Math.floor(startingValue / singleCost);
        return startingValue - (applicationCount * singleCost) + (applicationCount * singleGain);
    }

    // Dynamic programming array: `maximizedValueAtCost[c]` stores the highest value achievable
    // when a total 'cost' of `c` has been "spent" from the startingValue.
    const maximizedValueAtCost = Array(startingValue + 1).fill(undefined);
    maximizedValueAtCost[0] = startingValue; // Base case: 0 cost spent, value remains startingValue.

    // Iterate through each available transformation type
    for (const { cost: currentCostAmount, gain: currentGainAmount } of transformationsList) {
        // Iterate through all possible total costs from `currentCostAmount` up to `startingValue`
        // This ensures that each transformation can be applied multiple times (unbounded knapsack-like)
        for (let currentTotalCost = currentCostAmount; currentTotalCost <= startingValue; currentTotalCost++) {
            if (maximizedValueAtCost[currentTotalCost - currentCostAmount] !== undefined) {
                const calculatedNewValue = maximizedValueAtCost[currentTotalCost - currentCostAmount] + (currentGainAmount - currentCostAmount);
                if (maxizedValueAtCost[currentTotalCost] === undefined || calculatedNewValue > maximizedValueAtCost[currentTotalCost]) {
                    maximizedValueAtCost[currentTotalCost] = calculatedNewValue;
                }
            }
        }
    }

    // Scan for the maximum value within a specific range of total costs
    let finalOptimizedResult = startingValue;
    const scanLowerBound = Math.max(0, startingValue - 5000);
    for (let currentTotalCost = scanLowerBound; currentTotalCost <= startingValue; currentTotalCost++) {
        if (maximizedValueAtCost[currentTotalCost] !== undefined && maximizedValueAtCost[currentTotalCost] > finalOptimizedResult) {
            finalOptimizedResult = maximizedValueAtCost[currentTotalCost];
        }
    }
    return finalOptimizedResult;
};

console.log(performOverallCalculation());