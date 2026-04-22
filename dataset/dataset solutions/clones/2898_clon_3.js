// A self-executing function to encapsulate robust input parsing logic.
const InputProcessor = (function () {
    /**
     * Factory function to create a new input stream handler.
     * @param {string} rawDataString - The raw input data as a single string, typically from a file.
     * @returns {StreamReader} An instance of the StreamReader.
     */
    function instantiateStreamReader(rawDataString) {
        // Ensure input data is a string, trim leading/trailing whitespace, and split into individual lines.
        // If rawDataString is null/undefined, default to an empty string.
        const cleanedLines = String(rawDataString || '').trim().split("\n");
        return new StreamReader(cleanedLines);
    }

    /**
     * Manages reading and parsing lines and tokens from a pre-processed array of input lines.
     */
    class StreamReader {
        /**
         * Initializes the stream reader with an array of processed input lines.
         * @param {Array<string>} initialLines - An array where each element is a line from the input.
         */
        constructor(initialLines) {
            // Store the array of input lines.
            this.sourceLines = initialLines;
            // Pointer to the index of the current line being processed.
            this.currentLineIndex = 0;
            // Buffer to hold tokens of the current line, allowing token-by-token reading.
            this.lineTokenBuffer = [];
        }

        /**
         * Reads and returns the next single token from the input stream.
         * If the current line's token buffer is empty, it loads the next line.
         * The line pointer advances only after the *last* token of a line is read.
         * @param {boolean} [retrieveAsString=false] - If true, returns the token as a string; otherwise, attempts to convert to a number.
         * @returns {string|number|null} The next token, or null if the end of input is reached.
         */
        readNextToken(retrieveAsString = false) {
            // If the current line's token buffer is empty, attempt to load a new line.
            if (this.lineTokenBuffer.length === 0) {
                // Check if there are any more lines in the source input.
                if (this.currentLineIndex >= this.sourceLines.length) {
                    return null; // No more lines to read, end of input.
                }
                // Get the content of the current line.
                const lineContent = this.sourceLines[this.currentLineIndex];
                // Split the line by spaces into tokens. The original implementation
                // read tokens from right to left (reverse and pop), so we mimic that.
                this.lineTokenBuffer = lineContent.split(" ").reverse();
                // IMPORTANT: The line pointer is NOT advanced here. It will be advanced
                // only after the *last* token from `lineTokenBuffer` is consumed.
            }

            // Pop the next token from the end of the (reversed) buffer.
            const token = this.lineTokenBuffer.pop();

            // If the buffer is now empty, it means this was the last token of the current line.
            // Therefore, advance the line pointer to the next line.
            if (this.lineTokenBuffer.length === 0) {
                this.currentLineIndex++;
            }

            // Return the token, either as a string or converted to a number.
            return retrieveAsString ? token : Number(token);
        }

        /**
         * Reads an entire line from the input and returns its space-separated values.
         * The line pointer is advanced immediately after reading the line.
         * Any partially processed tokens for this line (from `readNextToken`) are discarded.
         * @param {boolean} [retrieveAsString=false] - If true, returns values as strings; otherwise, attempts to convert to numbers.
         * @returns {Array<string|number>} An array of values from the consumed line. Returns an empty array if no more lines.
         */
        readFullLineValues(retrieveAsString = false) {
            // Guard clause: Check if the line pointer is beyond the available lines.
            if (this.currentLineIndex >= this.sourceLines.length) {
                return []; // No more lines to read.
            }

            const lineToProcess = this.sourceLines[this.currentLineIndex];
            this.currentLineIndex++; // Advance the line pointer immediately.

            // Crucially, clear any tokens that might have been buffered for this line
            // by `readNextToken`, as `readFullLineValues` consumes the entire line.
            this.lineTokenBuffer = [];

            // Split the line into values and convert to numbers if requested.
            const values = lineToProcess.split(" ");
            return retrieveAsString ? values : values.map(val => Number(val));
        }

        /**
         * Reads a block of 'count' consecutive lines, typically for a matrix or table.
         * The line pointer is advanced by 'count'.
         * @param {number} count - The number of lines to read for the block.
         * @param {boolean} [retrieveAsString=false] - If true, returns values as strings; otherwise, attempts to convert to numbers.
         * @returns {Array<Array<string|number>>} A 2D array representing the block of lines. Returns empty array if no lines.
         */
        readBlockOfLines(count, retrieveAsString = false) {
            const startIndex = this.currentLineIndex;
            const endIndex = Math.min(startIndex + count, this.sourceLines.length);

            // Guard: If no lines can be read from the current position.
            if (startIndex >= this.sourceLines.length) {
                return [];
            }

            // Extract the relevant slice of lines.
            const linesToConvert = this.sourceLines.slice(startIndex, endIndex);
            this.currentLineIndex = endIndex; // Advance the line pointer.
            this.lineTokenBuffer = []; // Clear any pending tokens.

            // Process each line in the block.
            const resultMatrix = linesToConvert.map(line => {
                const rowValues = line.split(" ");
                return retrieveAsString ? rowValues : rowValues.map(val => Number(val));
            });

            return resultMatrix;
        }

        /**
         * Reads 'count' consecutive lines as raw strings.
         * The line pointer is advanced by 'count'.
         * @param {number} count - The number of raw lines to retrieve.
         * @returns {Array<string>} An array of raw line strings. Returns empty array if no lines.
         */
        retrieveRawLines(count) {
            const startIndex = this.currentLineIndex;
            const endIndex = Math.min(startIndex + count, this.sourceLines.length);

            // Guard: If no lines can be read.
            if (startIndex >= this.sourceLines.length) {
                return [];
            }

            const rawLineStrings = this.sourceLines.slice(startIndex, endIndex);
            this.currentLineIndex = endIndex; // Advance the line pointer.
            this.lineTokenBuffer = []; // Clear any pending tokens.

            return rawLineStrings;
        }
    }

    return instantiateStreamReader;
})();

// Initialize the input handler by reading content from standard input.
const dataInputHandler = InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

// --- Mathematical Utility Functions (Modular Arithmetic) ---

// The primary modulus used for all calculations in this problem. It is a prime number.
const PRIMARY_MODULUS = 1000003;

/**
 * Ensures a number is positive within the modular arithmetic system.
 * This is useful for results that might be negative due to JavaScript's `%` operator behavior.
 * @param {number} value - The number to normalize.
 * @returns {number} The normalized positive value modulo PRIMARY_MODULUS.
 */
function normalizeModulo(value) {
    return (value % PRIMARY_MODULUS + PRIMARY_MODULUS) % PRIMARY_MODULUS;
}

/**
 * Performs chained modular multiplication of an arbitrary number of factors.
 * The result is `(factor1 * factor2 * ... * factorN) % PRIMARY_MODULUS`.
 * This function handles potential intermediate overflows for large numbers in JavaScript
 * by taking the modulus at each step, ensuring results stay within safe integer limits.
 * @param {...number} factors - A variable number of numbers to multiply.
 * @returns {number} The final modular product. Returns 1 if no factors are provided.
 */
function chainedModularMultiplication(...factors) {
    if (factors.length === 0) {
        return 1; // Multiplicative identity.
    }

    let accumulatedProduct = 1;

    // Iterate through all factors, applying modular multiplication at each step.
    for (const factor of factors) {
        // Ensure each factor is also within the modulus before multiplication.
        const currentFactor = normalizeModulo(factor);
        accumulatedProduct = normalizeModulo(accumulatedProduct * currentFactor);
    }
    return accumulatedProduct;
}

// Cache for precomputed factorials modulo PRIMARY_MODULUS.
// Initialized with 0! = 1 and 1! = 1.
const factorialLookupTable = [1, 1];

/**
 * Populates the `factorialLookupTable` up to a specified limit.
 * This function computes factorials incrementally, storing them for later use.
 * @param {number} upperLimit - The maximum number for which to compute factorials.
 */
function precomputeFactorials(upperLimit) {
    // If the cache already contains factorials up to the limit, no computation is needed.
    if (factorialLookupTable.length > upperLimit) {
        return;
    }
    // Start computing from the last known factorial up to the upper limit.
    for (let i = factorialLookupTable.length; i <= upperLimit; i++) {
        factorialLookupTable[i] = chainedModularMultiplication(factorialLookupTable[i - 1], i);
    }
}

/**
 * Calculates the modular multiplicative inverse of a number 'val' modulo PRIMARY_MODULUS
 * using the Extended Euclidean Algorithm. This is necessary for division in modular arithmetic.
 * Since PRIMARY_MODULUS is prime, Fermat's Little Theorem (val^(mod-2) % mod) could also be used,
 * but Extended Euclidean is more general.
 * @param {number} val - The number for which to find the inverse. Must be coprime to PRIMARY_MODULUS.
 * @returns {number} The modular inverse of 'val'.
 */
function calculateModularInverse(val) {
    let currentA = val;
    let currentB = PRIMARY_MODULUS;
    let xCoefficient0 = 1, xCoefficient1 = 0; // Coefficients for 'a' (currentA)

    // Extended Euclidean Algorithm loop.
    while (currentB !== 0) {
        const quotient = Math.floor(currentA / currentB);
        // Update currentA and currentB
        let tempA = currentA;
        currentA = currentB;
        currentB = tempA % currentB;

        // Update x coefficients (for Bezout's identity: ax + by = gcd(a,b))
        let tempX = xCoefficient0;
        xCoefficient0 = xCoefficient1;
        xCoefficient1 = tempX - quotient * xCoefficient1;
    }

    // At this point, currentA holds gcd(val, PRIMARY_MODULUS). Since PRIMARY_MODULUS is prime
    // and val < PRIMARY_MODULUS, gcd should be 1. xCoefficient0 is the inverse.
    return normalizeModulo(xCoefficient0);
}

/**
 * Calculates the number of permutations P(n, r) modulo PRIMARY_MODULUS.
 * P(n, r) = n! / (n-r)! = n! * ((n-r)!)^(-1) mod M.
 * @param {number} nValue - The total number of items.
 * @param {number} rValue - The number of items to choose and arrange.
 * @returns {number} The result of P(nValue, rValue) modulo PRIMARY_MODULUS.
 */
function computePermutationsMod(nValue, rValue) {
    // Guard against invalid input for permutations.
    if (rValue < 0 || rValue > nValue) {
        return 0; // By definition, P(n,r) is 0 for r < 0 or r > n.
    }
    if (rValue === 0) {
        return 1; // P(n,0) = 1.
    }

    const differenceNMinusR = nValue - rValue;

    // Ensure factorials up to nValue are precomputed.
    precomputeFactorials(nValue);

    // Calculate the modular inverse of (n-r)!
    const inverseFactorialNMinusR = calculateModularInverse(factorialLookupTable[differenceNMinusR]);

    // The result is n! * ((n-r)!)^(-1) mod M.
    return chainedModularMultiplication(factorialLookupTable[nValue], inverseFactorialNMinusR);
}

/**
 * Calculates modular exponentiation (base^exponent) modulo PRIMARY_MODULUS
 * using the method of binary exponentiation (also known as exponentiation by squaring).
 * @param {number} baseValue - The base number.
 * @param {number} powerValue - The exponent. Must be a non-negative integer.
 * @returns {number} The result of (baseValue^powerValue) % PRIMARY_MODULUS.
 */
function calculateModularPower(baseValue, powerValue) {
    let finalResult = 1;
    let currentBase = normalizeModulo(baseValue); // Ensure base is within modulus range.

    // If exponent is 0, any base (except 0^0 which is undefined/1) is 1.
    // For competitive programming, 0^0 is typically treated as 1.
    if (powerValue === 0) {
        return 1;
    }
    // Handle negative exponents if applicable (would involve modular inverse),
    // but typically problems assume non-negative exponents.
    if (powerValue < 0) {
        // Depending on problem context, this might be an error or require inverse.
        // For this problem, exponents are positive integers.
        return 0; // Or throw an error.
    }

    let tempPower = powerValue;
    while (tempPower > 0) {
        // If the current bit of the exponent is 1 (i.e., exponent is odd).
        if (tempPower % 2 === 1) { // Equivalent to (tempPower & 1)
            finalResult = chainedModularMultiplication(finalResult, currentBase);
        }
        // Square the current base and halve the exponent.
        currentBase = chainedModularMultiplication(currentBase, currentBase);
        tempPower = Math.floor(tempPower / 2); // Equivalent to (tempPower >>= 1)
    }
    return finalResult;
}

// --- Main Solution Logic ---

/**
 * Main function to execute the problem's solution logic.
 * It reads queries, performs calculations based on modular arithmetic,
 * and compiles the results into a newline-separated string.
 * @returns {string} The final computed results, each on a new line.
 */
function executeSolution() {
    // Read the total number of queries from the first line of input.
    const numberOfQueries = dataInputHandler.readNextToken();

    // An array to accumulate the results for each query.
    const collectedOutputs = [];

    // Precompute factorials up to the maximum possible value for 'n' or 'a' in the problem,
    // which can be up to PRIMARY_MODULUS - 1. This is an optimization.
    precomputeFactorials(PRIMARY_MODULUS);

    // Iterate through each query to process it.
    for (let queryIteration = 0; queryIteration < numberOfQueries; queryIteration++) {
        // Read the three parameters (x, d, n) for the current query from a single line.
        const queryInputParams = dataInputHandler.readFullLineValues();
        const baseParamX = queryInputParams[0]; // Represents 'x' in the problem.
        const diffParamD = queryInputParams[1]; // Represents 'd' in the problem.
        const countParamN = queryInputParams[2]; // Represents 'n' in the problem.

        let currentQueryAnswer;

        // Optimization/Guard: If 'n' (countParamN) is greater than or equal to the modulus,
        // the product will contain a factor of 'mod' (or a multiple of it), making the result 0 mod mod.
        // This is because P(A, n) involves A! / (A-n)!, and if n >= mod, then A! will contain mod.
        // The original problem statement implicitly handles this as `n` is up to `mod-1`.
        // However, if `n` were allowed to be `>= mod`, then P(A, n) where A < mod would be 0.
        // But here `A = transformedBase + countParamN - 1`. If `countParamN >= PRIMARY_MODULUS`,
        // then `permutationN` will be `>= PRIMARY_MODULUS`.
        // `P(N, R)` is defined as `N! / (N-R)!`. If `N >= PRIMARY_MODULUS`, then `N!` contains a factor of `PRIMARY_MODULUS`,
        // which makes `N! % PRIMARY_MODULUS` equal to 0. Thus, `P(N,R)` is 0.
        if (countParamN >= PRIMARY_MODULUS) {
            currentQueryAnswer = 0;
            collectedOutputs.push(currentQueryAnswer);
            continue; // Skip further calculations for this query.
        }

        // Case 1: The common difference 'd' is zero.
        if (diffParamD === 0) {
            // The sequence is x, x, x, ... (n times).
            // The product is x^n.
            currentQueryAnswer = calculateModularPower(baseParamX, countParamN);
        } else {
            // Case 2: The common difference 'd' is non-zero.
            // The product is x * (x+d) * (x+2d) * ... * (x+(n-1)d).
            // This can be rewritten as d^n * (x/d) * (x/d + 1) * ... * (x/d + n - 1).
            // Let 'a' = x * d^(-1) (modulo M).
            // Then the product becomes d^n * a * (a+1) * ... * (a+n-1).
            // This is equivalent to d^n * P(a + n - 1, n) (modulo M).

            // First, calculate the modular multiplicative inverse of 'd'.
            const inverseOfDiffD = calculateModularInverse(diffParamD);

            // Compute 'a' = (x * d^(-1)) % M.
            const transformedInitialTermA = chainedModularMultiplication(baseParamX, inverseOfDiffD);

            // Calculate the 'N' for permutations: (a + n - 1) % M.
            // Ensure the result is positive.
            const permutationsNValue = normalizeModulo(transformedInitialTermA + countParamN - 1);

            // Calculate the permutations term: P(permutationsNValue, countParamN) % M.
            const permutationsTerm = computePermutationsMod(permutationsNValue, countParamN);

            // Calculate the power term: (d^n) % M.
            const powerOfDiffDTerm = calculateModularPower(diffParamD, countParamN);

            // The final answer is the product of the permutations term and the power term.
            currentQueryAnswer = chainedModularMultiplication(permutationsTerm, powerOfDiffDTerm);
        }
        collectedOutputs.push(currentQueryAnswer);
    }

    // Join all the collected results with newline characters for the final output string.
    return collectedOutputs.join("\n");
}

// Execute the main solution function and print its return value to the console.
console.log(executeSolution());