class InputSource {
    #lineBuffer;
    #currentLinePointer;
    #tokenQueue;

    constructor(sourceString) {
        this.#lineBuffer = sourceString.split("\n");
        this.#currentLinePointer = 0;
        this.#tokenQueue = null; // null indicates no line loaded yet for token processing
    }

    #primeTokenQueue() {
        if (this.#tokenQueue !== null && this.#tokenQueue.length > 0) {
            return true; // Tokens already available
        }

        // If current queue is exhausted or not initialized, advance to next line
        if (this.#tokenQueue !== null) { // Only increment if we just exhausted a line
            this.#currentLinePointer++;
        }

        if (this.#currentLinePointer >= this.#lineBuffer.length) {
            this.#tokenQueue = []; // No more lines, set to empty to indicate exhaustion
            return false;
        }

        const currentLine = this.#lineBuffer[this.#currentLinePointer];
        const tokens = currentLine.split(" ");
        if (tokens.length === 1 && tokens[0] === "") {
            this.#tokenQueue = []; // Empty line, no tokens
        } else {
            this.#tokenQueue = tokens;
        }
        return this.#tokenQueue.length > 0;
    }

    fetchToken(returnAsString = false) {
        if (!this.#primeTokenQueue()) {
            return undefined; // No more tokens available
        }

        const tokenValue = this.#tokenQueue.shift();
        return returnAsString ? tokenValue : +tokenValue;
    }

    fetchLine(returnAsStringArray = false) {
        if (this.#currentLinePointer >= this.#lineBuffer.length) {
            throw new Error("Input stream exhausted. Attempted to read beyond available lines.");
        }
        // When a full line is fetched, any pending tokens for token-by-token fetching are discarded.
        this.#tokenQueue = null;

        const lineContent = this.#lineBuffer[this.#currentLinePointer++];
        const lineTokens = lineContent.split(" ");
        if (lineTokens.length === 1 && lineTokens[0] === "") {
            return returnAsStringArray ? [] : [];
        }
        return returnAsStringArray ? lineTokens : lineTokens.map(Number);
    }

    fetchMultipleLines(count, returnAsStringArrays = false) {
        const collectedLines = [];
        // When multiple lines are fetched, any pending tokens for token-by-token fetching are discarded.
        this.#tokenQueue = null;

        for (let i = 0; i < count; i++) {
            // fetchLine will throw if out of bounds, matching original behavior.
            collectedLines.push(this.fetchLine(returnAsStringArrays));
        }
        return collectedLines;
    }
}

const generateFibonacciSequence = (maxIndex) => {
    if (maxIndex < 0) return [];
    const sequence = new Array(maxIndex + 1);
    sequence[0] = 1; // F(1)
    if (maxIndex > 0) {
        sequence[1] = 1; // F(2)
        for (let i = 2; i <= maxIndex; i++) {
            sequence[i] = sequence[i - 1] + sequence[i - 2];
        }
    }
    return sequence;
};

const retrieveFibonacciValue = (index, fibSequence) => {
    if (index < 0 || index >= fibSequence.length) {
        return 0; // Corresponds to F(0) or out of bounds
    }
    return fibSequence[index];
};

function solvePathProblem() {
    const dataReader = new InputSource(require("fs").readFileSync("/dev/stdin", "utf8"));
    const MODULO_CONSTANT = 1e9 + 7;

    const totalHeight = dataReader.fetchToken(false);
    const totalWidth = dataReader.fetchToken(false);
    const finalColumn = dataReader.fetchToken(false);

    if (totalWidth === 1) {
        return 1;
    }

    // The largest index for fibonacci sequence needed is totalWidth - 1.
    // E.g., if totalWidth=2, max index is 1 (v[1]).
    const fibonacciValues = generateFibonacciSequence(totalWidth - 1);

    // Memoization table for dynamic programming
    // Initialized with -1 to indicate uncomputed states
    const memoizationTable = Array.from({ length: totalHeight + 1 }, () =>
        Array.from({ length: totalWidth + 1 }, () => -1)
    );

    // Recursive function to count paths with memoization
    const calculateWays = (currentLevel, currentPosition) => {
        // Boundary conditions for column
        if (currentPosition < 1 || currentPosition > totalWidth) {
            return 0;
        }

        // Base case: At the starting level (level 0)
        if (currentLevel === 0) {
            return currentPosition === 1 ? 1 : 0; // Only dp[0][1] is 1
        }

        // Check memoization table
        if (memoizationTable[currentLevel][currentPosition] !== -1) {
            return memoizationTable[currentLevel][currentPosition];
        }

        let accumulatedWays = 0;

        // Option 1: Came from (currentLevel - 1, currentPosition - 1) (moved right)
        if (currentPosition > 1) {
            const leftSegmentWays = retrieveFibonacciValue(currentPosition - 2, fibonacciValues);
            const rightSegmentWays = retrieveFibonacciValue(totalWidth - currentPosition, fibonacciValues);
            const transitionFactor = (leftSegmentWays * rightSegmentWays) % MODULO_CONSTANT;
            accumulatedWays = (accumulatedWays + calculateWays(currentLevel - 1, currentPosition - 1) * transitionFactor) % MODULO_CONSTANT;
        }

        // Option 2: Came from (currentLevel - 1, currentPosition) (stayed)
        const leftSegmentWaysStay = retrieveFibonacciValue(currentPosition - 1, fibonacciValues);
        const rightSegmentWaysStay = retrieveFibonacciValue(totalWidth - currentPosition, fibonacciValues);
        const transitionFactorStay = (leftSegmentWaysStay * rightSegmentWaysStay) % MODULO_CONSTANT;
        accumulatedWays = (accumulatedWays + calculateWays(currentLevel - 1, currentPosition) * transitionFactorStay) % MODULO_CONSTANT;

        // Option 3: Came from (currentLevel - 1, currentPosition + 1) (moved left)
        if (currentPosition < totalWidth) {
            const leftSegmentWaysLeft = retrieveFibonacciValue(currentPosition - 1, fibonacciValues);
            const rightSegmentWaysLeft = retrieveFibonacciValue(totalWidth - currentPosition - 1, fibonacciValues);
            const transitionFactorLeft = (leftSegmentWaysLeft * rightSegmentWaysLeft) % MODULO_CONSTANT;
            accumulatedWays = (accumulatedWays + calculateWays(currentLevel - 1, currentPosition + 1) * transitionFactorLeft) % MODULO_CONSTANT;
        }

        memoizationTable[currentLevel][currentPosition] = accumulatedWays;
        return accumulatedWays;
    };

    return calculateWays(totalHeight, finalColumn);
}

console.log(solvePathProblem());
