class DataStreamProcessor {
    constructor(rawInputContent) {
        this.inputLines = rawInputContent.trim().split('\n');
        this.currentLineIndex = 0;
        this.currentLineTokens = [];
    }

    // Corresponds to original GET.a()
    retrieveNextInteger() {
        if (this.currentLineTokens.length === 0) {
            if (this.currentLineIndex >= this.inputLines.length) {
                throw new Error("Input stream exhausted.");
            }
            // Original reverses the line and pops. We replicate this.
            this.currentLineTokens = this.inputLines[this.currentLineIndex].split(' ').reverse();
            // Original increments line index only when a line is fully consumed.
            // Our `currentLineIndex` will be advanced by other methods or when `currentLineTokens` is empty.
            // For `retrieveNextInteger`, we only advance `currentLineIndex` if the line becomes empty.
        }
        const token = this.currentLineTokens.pop();
        if (this.currentLineTokens.length === 0) {
            this.currentLineIndex++; // Advance to next line if current one is empty
        }
        return parseInt(token, 10);
    }

    // Corresponds to original GET.l()
    retrieveLineOfIntegers() {
        if (this.currentLineIndex >= this.inputLines.length) {
            throw new Error("Input stream exhausted.");
        }
        // Clear any pending tokens from previous `retrieveNextInteger` calls
        this.currentLineTokens = [];
        const line = this.inputLines[this.currentLineIndex++];
        return line.split(' ').map(Number);
    }

    // Corresponds to original GET.m()
    retrieveIntegerMatrix(rowCount) {
        const matrix = [];
        for (let i = 0; i < rowCount; i++) {
            matrix.push(this.retrieveLineOfIntegers());
        }
        return matrix;
    }

    // Corresponds to original GET.r()
    retrieveListOfNumbers(count) {
        const list = [];
        for (let i = 0; i < count; i++) {
            if (this.currentLineIndex >= this.inputLines.length) {
                throw new Error("Input stream exhausted.");
            }
            list.push(Number(this.inputLines[this.currentLineIndex++]));
        }
        return list;
    }
}

function initializeInput(inputString) {
    return new DataStreamProcessor(inputString);
}

// Clone of xArray, using recursion instead of eval
function constructMultiDimensionalArray(fillValue, ...dimensions) {
    const createDimension = (depth) => {
        if (depth === dimensions.length) {
            return fillValue;
        }
        const size = dimensions[depth];
        return Array.from({ length: size }).map(() => {
            // Intermediate dimensions are filled with 0, as per original's `fill(0)`
            return createDimension(depth + 1);
        });
    };
    return createDimension(0);
}

const MODULUS_VALUE = 1000000007n; // Using BigInt for modular arithmetic

// Clone of abmod, using BigInt for intermediate products
function calculateModularProduct(...factors) {
    let currentProduct = 1n;
    for (const factor of factors) {
        currentProduct = (currentProduct * BigInt(factor)) % MODULUS_VALUE;
    }
    return Number(currentProduct);
}

function executeMainLogic() {
    const inputHandler = initializeInput(require("fs").readFileSync("/dev/stdin", "utf8"));

    const totalIterations = inputHandler.retrieveNextInteger();
    const initialValueX = inputHandler.retrieveNextInteger();
    const divisorList = inputHandler.retrieveLineOfIntegers().sort((valA, valB) => valB - valA);

    let currentProbabilityMap = new Map();
    currentProbabilityMap.set(initialValueX, 1);

    // Transform the main loop using Array.prototype.reduce
    const finalProbabilityMap = Array.from({ length: totalIterations }).reduce((accumulatorMap, _, currentIteration) => {
        const nextProbabilityMap = new Map();

        // Transform the inner loop using Map.prototype.forEach
        accumulatorMap.forEach((countValue, currentKey) => {
            // Case 1: The value remains unchanged for future iterations
            // Original: dp2[j] += dp[j] * (n-i-1)
            const remainingSteps = totalIterations - currentIteration - 1;
            if (remainingSteps > 0) { // Only contribute if there are actual remaining steps
                const existingCount = nextProbabilityMap.get(currentKey) || 0;
                const incrementAmount = calculateModularProduct(countValue, remainingSteps);
                nextProbabilityMap.set(currentKey, (existingCount + incrementAmount) % Number(MODULUS_VALUE));
            }

            // Case 2: The value is transformed by modulo operation
            // Original: dp2[m] += dp[j]
            const moduloResult = currentKey % divisorList[currentIteration];
            const existingModCount = nextProbabilityMap.get(moduloResult) || 0;
            nextProbabilityMap.set(moduloResult, (existingModCount + countValue) % Number(MODULUS_VALUE));
        });
        return nextProbabilityMap;
    }, currentProbabilityMap); // Initial state for the reduce operation

    let finalAnswer = 0;
    finalProbabilityMap.forEach((countValue, keyVal) => {
        finalAnswer = (finalAnswer + calculateModularProduct(keyVal, countValue)) % Number(MODULUS_VALUE);
    });

    return finalAnswer;
}

console.log(executeMainLogic());
