const InputReaderFactory = (function() {
    // Helper to convert a value to a number if the 'asString' flag is false.
    const _parseValue = (value, asString) => asString ? value : Number(value);

    class InputReader {
        constructor(sourceContent) {
            // Store the input content as an array of lines.
            // Trim to remove leading/trailing whitespace from the whole input.
            this.sourceLines = sourceContent.trim().split("\n");
            // Keep track of the current line being processed.
            this.currentLineIndex = 0;
        }

        // Reads a single value from the current line.
        // If the current line is exhausted, it advances to the next line.
        // The original implementation reverses the line and pops values from the end.
        // This effectively reads values from left-to-right in the original line order.
        readNextValue(asString = false) {
            let lineData = this.sourceLines[this.currentLineIndex];

            // If the current line hasn't been split and reversed yet, do it.
            // This modification is stateful, affecting subsequent calls for the same line.
            if (typeof lineData === "string") {
                this.sourceLines[this.currentLineIndex] = lineData.split(" ").reverse();
            }
            
            // Pop the last element (which is the first element in original order after reverse).
            const value = this.sourceLines[this.currentLineIndex].pop();
            
            // If the current line is now empty, advance to the next line.
            if (!this.sourceLines[this.currentLineIndex].length) {
                this.currentLineIndex++;
            }
            return _parseValue(value, asString);
        }

        // Reads an entire line, splits it by space, and returns the array of values.
        // Advances to the next line.
        readLineValues(asString = false) {
            const lineContent = this.sourceLines[this.currentLineIndex++];
            const values = lineContent.split(" ");
            return asString ? values : values.map(val => Number(val));
        }

        // Reads 'count' consecutive lines, splitting each into values, forming a 2D array (matrix).
        // Advances 'count' lines.
        readMatrixValues(count, asString = false) {
            const matrixRows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + count);
            this.currentLineIndex += count; // Update line index after slicing
            const parsedMatrix = matrixRows.map(row => {
                const rowValues = row.split(" ");
                return asString ? rowValues : rowValues.map(val => Number(val));
            });
            return parsedMatrix;
        }

        // Reads 'count' raw lines without splitting them into individual values.
        // Advances 'count' lines.
        readRawLines(count, asString = false) {
            const lines = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + count);
            this.currentLineIndex += count; // Update line index after slicing
            // The original 'r' method also maps to Number if 'f' is false.
            return asString ? lines : lines.map(line => Number(line));
        }
    }

    // The factory function returns an instance of InputReader.
    return function createReader(sourceContent) {
        return new InputReader(sourceContent);
    };
})();

// Initialize the input reader by reading from stdin.
const inputReader = InputReaderFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

// Define the modulus value for all modular arithmetic operations.
const MODULUS_VALUE = 1e9 + 7;

// Helper function for modular addition: (a + b) % MODULUS_VALUE
const addMod = (val1, val2) => (val1 + val2) % MODULUS_VALUE;

// Helper function for modular multiplication of two numbers,
// specifically designed to handle potential overflow for large intermediate products
// by splitting numbers into 16-bit parts (a = a_high * 2^16 + a_low).
// (a * b) % m = ((a_high * 2^16 + a_low) * b) % m
//             = (a_high * b * 2^16 + a_low * b) % m
const multiplyTwoMod = (val1, val2) => {
    const highPart = (val1 >> 16); // Extract the higher 16 bits of val1
    const lowPart = (val1 & 65535); // Extract the lower 16 bits of val1 (65535 = 2^16 - 1)
    
    // Calculate (highPart * val2 * 65536) % MODULUS_VALUE
    const term1 = (highPart * val2) % MODULUS_VALUE;
    const term1Scaled = (term1 * 65536) % MODULUS_VALUE;

    // Calculate (lowPart * val2) % MODULUS_VALUE
    const term2 = (lowPart * val2) % MODULUS_VALUE;

    // Sum the two terms modulo MODULUS_VALUE
    return addMod(term1Scaled, term2);
};

// Function to calculate the modular product of multiple factors.
// It iteratively applies `multiplyTwoMod` to all factors.
function calculateModularProduct(...factors) {
    if (factors.length === 0) return 0; // Or 1, depending on desired identity for empty product.
    
    let result = factors[0];
    for (let k = 1; k < factors.length; k++) {
        result = multiplyTwoMod(result, factors[k]);
    }
    return result;
}

// Helper to safely get a value from a state map, returning an initial value if undefined.
const getOrInitializeState = (stateMap, key, initialValue = 0) => {
    return stateMap[key] !== undefined ? stateMap[key] : initialValue;
};

function solveProblem() {
    const totalItems = inputReader.readNextValue();
    const initialValue = inputReader.readNextValue();
    // Read divisors and sort them in descending order as per original logic.
    const divisors = inputReader.readLineValues().sort((a, b) => b - a);

    // `currentStates` will store the counts of ways to reach a particular remainder value.
    // Key: remainder value, Value: count of ways.
    let currentStates = {};
    currentStates[initialValue] = 1; // Start with the initial value, reachable in 1 way.

    // Iterate through each divisor.
    for (let itemIndex = 0; itemIndex < totalItems; itemIndex++) {
        // `nextStates` will accumulate the counts for the next iteration.
        const nextStates = {};
        const currentDivisor = divisors[itemIndex];
        // `remainingItemsCount` is `n - i - 1`, representing the number of items
        // that come *after* the current `itemIndex`.
        const remainingItemsCount = totalItems - itemIndex - 1;

        // Iterate over all current remainder states and their counts.
        for (const keyStr in currentStates) {
            const currentStateKey = Number(keyStr); // Convert string key to number.
            const currentCount = currentStates[currentStateKey];

            // Case 1: The current divisor (`currentDivisor`) is NOT applied to `currentStateKey`.
            // If the divisor is not applied, `currentStateKey` remains unchanged.
            // The `currentCount` contributes to `nextStates[currentStateKey]`
            // multiplied by `remainingItemsCount`. This factor accounts for the ways
            // to choose *not* to apply this specific divisor.
            // If `remainingItemsCount` is 0 (last item), this contribution will be 0,
            // which matches the original behavior `dp[j] * 0`.
            const existingCountForJ = getOrInitializeState(nextStates, currentStateKey);
            nextStates[currentStateKey] = addMod(existingCountForJ, calculateModularProduct(currentCount, remainingItemsCount));

            // Case 2: The current divisor (`currentDivisor`) IS applied to `currentStateKey`.
            // If the divisor is applied, `currentStateKey` becomes `currentStateKey % currentDivisor`.
            // The `currentCount` contributes directly to `nextStates[remainder]`.
            const remainder = currentStateKey % currentDivisor;
            const existingCountForM = getOrInitializeState(nextStates, remainder);
            nextStates[remainder] = addMod(existingCountForM, currentCount);
        }
        // After processing all states for the current divisor, update `currentStates` for the next iteration.
        currentStates = nextStates;
    }

    // Calculate the final answer by summing (remainder * count) for all final states.
    let finalResult = 0;
    for (const keyStr in currentStates) {
        const stateKey = Number(keyStr);
        const stateCount = currentStates[stateKey];
        finalResult = addMod(finalResult, calculateModularProduct(stateKey, stateCount));
    }
    return finalResult;
}

// Output the result of the problem.
console.log(solveProblem());
