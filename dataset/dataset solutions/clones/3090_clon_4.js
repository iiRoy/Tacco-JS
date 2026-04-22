class StreamProcessor {
    #inputLines;
    #linePointer;
    #tokenBuffer;

    constructor(sourceData) {
        this.#inputLines = sourceData.trim().split('\n');
        this.#linePointer = 0;
        this.#tokenBuffer = [];
    }

    // Retrieves a single scalar value from the input stream.
    // It consumes tokens from the current line. If the current line is exhausted,
    // it moves to the next line.
    retrieveScalar(asText = false) {
        if (this.#tokenBuffer.length === 0) {
            if (this.#linePointer >= this.#inputLines.length) {
                // No more lines to read
                return undefined;
            }
            // Populate the buffer with tokens from the current line
            this.#tokenBuffer = this.#inputLines[this.#linePointer].split(' ');
        }

        const nextToken = this.#tokenBuffer.shift();
        if (this.#tokenBuffer.length === 0) {
            // Current line is now empty, advance to the next line
            this.#linePointer++;
        }
        return asText ? nextToken : Number(nextToken);
    }

    // Reads an entire line of space-separated values.
    // It consumes the current line and moves to the next.
    fetchLine(asTextArray = false) {
        if (this.#linePointer >= this.#inputLines.length) {
            return undefined; // No more lines to read
        }
        const lineTokens = this.#inputLines[this.#linePointer].split(' ');
        this.#linePointer++;
        this.#tokenBuffer = []; // Clear buffer as the line is fully consumed
        return asTextArray ? lineTokens : lineTokens.map(Number);
    }
}

function initializeInputProcessor(dataString) {
    return new StreamProcessor(dataString);
}

const MODULO_CONSTANT = 1000000007;

// Performs modular multiplication (A * B) % M, designed to prevent overflow
// for intermediate products when A and B are standard JavaScript Numbers
// and M is up to 10^9 + 7.
function performModularMultiplication(operandA, operandB) {
    const highPartA = operandA >> 16;
    const lowPartA = operandA & 0xFFFF; // 65535

    const termHigh = (highPartA * operandB) % MODULO_CONSTANT;
    const termLow = (lowPartA * operandB) % MODULO_CONSTANT;

    // (termHigh * 65536 + termLow) % MODULO_CONSTANT
    // termHigh * 65536 is safe from overflow as MODULO_CONSTANT * 65536 fits in MAX_SAFE_INTEGER
    let finalProduct = (termHigh * 65536 + termLow) % MODULO_CONSTANT;
    return finalProduct;
}

function calculateOutcome() {
    const dataReader = initializeInputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));
    const totalElements = dataReader.retrieveScalar();
    const startingValue = dataReader.retrieveScalar();
    const divisorCollection = dataReader.fetchLine().sort((valX, valY) => valY - valX);

    let stateAccumulator = new Map();
    stateAccumulator.set(startingValue, 1);

    for (let currentStep = 0; currentStep < totalElements; ++currentStep) {
        let nextAccumulator = new Map();
        const currentDivisor = divisorCollection[currentStep];
        const remainingStepsCount = totalElements - currentStep - 1;

        for (const [currentKey, currentCount] of stateAccumulator.entries()) {
            // Scenario 1: The current divisor is NOT used in this step.
            // The value remains currentKey. The count is multiplied by the number of
            // remaining elements that could have been used instead of the current one.
            if (remainingStepsCount > 0) {
                const countForSkipping = performModularMultiplication(currentCount, remainingStepsCount);
                nextAccumulator.set(currentKey, ((nextAccumulator.get(currentKey) || 0) + countForSkipping) % MODULO_CONSTANT);
            }

            // Scenario 2: The current divisor IS used in this step.
            // The value becomes currentKey % currentDivisor. The count is currentCount.
            const nextKey = currentKey % currentDivisor;
            nextAccumulator.set(nextKey, ((nextAccumulator.get(nextKey) || 0) + currentCount) % MODULO_CONSTANT);
        }
        stateAccumulator = nextAccumulator;
    }

    let overallResultSum = 0;
    for (const [finalKey, finalCount] of stateAccumulator.entries()) {
        overallResultSum = (overallResultSum + performModularMultiplication(finalKey, finalCount)) % MODULO_CONSTANT;
    }
    return overallResultSum;
}

console.log(calculateOutcome());