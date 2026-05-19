// Input parsing utility
class InputProcessor {
    constructor(rawInputContent) {
        this.sourceLines = rawInputContent.trim().split("\n");
        this.lineCursor = 0;
        this.firstLineTokens = null; // Cache for tokens of the first line, specifically for 'fetchSingleToken'
    }

    // Mimics GET.a - reads a single token, from right-to-left on the first line.
    // This method is designed to be used once for the initial 'q' value,
    // as per the observed usage pattern in the original 'main' function.
    fetchSingleToken(asString) {
        if (this.firstLineTokens === null) {
            const line = this.sourceLines[this.lineCursor];
            this.firstLineTokens = line.split(" ").reverse();
            this.lineCursor++; // Advance cursor after processing the first line for 'a'
        }
        const token = this.firstLineTokens.pop();
        return asString ? token : Number(token);
    }

    // Mimics GET.l - reads a full line, splits into tokens.
    // This method is used for subsequent lines after 'fetchSingleToken' has processed the first.
    fetchLineTokens(asString) {
        if (this.lineCursor >= this.sourceLines.length) {
            return undefined; // No more lines
        }
        const line = this.sourceLines[this.lineCursor++];
        const tokens = line.split(" ");
        return asString ? tokens : tokens.map(Number);
    }

    // Mimics GET.m - reads multiple lines as a matrix.
    fetchTokenMatrix(numRows, asString) {
        const matrix = [];
        for (let i = 0; i < numRows; i++) {
            matrix.push(this.fetchLineTokens(asString));
        }
        return matrix;
    }

    // Mimics GET.r - reads multiple lines, each as a single token.
    fetchRawTokens(numRows, asString) {
        const tokens = [];
        for (let i = 0; i < numRows; i++) {
            const lineTokens = this.fetchLineTokens(asString);
            tokens.push(asString ? lineTokens[0] : Number(lineTokens[0]));
        }
        return tokens;
    }
}

const inputReaderInstance = new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

// Multi-dimensional array creation using recursion, avoiding eval.
// Takes initial value and then dimensions as separate arguments.
function buildMultiArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }
    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);
    return Array.from({ length: currentDimensionSize }, () =>
        buildMultiArray(initialValue, ...remainingDimensions)
    );
}

const MOD_PRIME = 1000003;

// Performs modular multiplication (a * b) % MOD_PRIME.
// Direct multiplication is safe as MOD_PRIME^2 fits within JavaScript's safe integer limits.
function modMultiply(factorA, factorB) {
    return (factorA * factorB) % MOD_PRIME;
}

// Cache for precomputed factorials modulo MOD_PRIME.
const cachedFactorials = [1, 1];

// Populates the factorial cache up to a given limit.
function precomputeFactorials(limit) {
    for (let i = 2; i <= limit; i++) {
        cachedFactorials[i] = modMultiply(cachedFactorials[i - 1], i);
    }
}

// Calculates the modular multiplicative inverse of 'numberA' modulo MOD_PRIME
// using the extended Euclidean algorithm.
function getModularInverse(numberA) {
    let currentA = numberA;
    let currentB = MOD_PRIME;
    let uVal = 1;
    let vVal = 0;
    let tempVal;

    while (currentB !== 0) {
        const quotient = Math.floor(currentA / currentB);
        tempVal = currentA - quotient * currentB;
        currentA = currentB;
        currentB = tempVal;

        tempVal = uVal - quotient * vVal;
        uVal = vVal;
        vVal = tempVal;
    }
    uVal %= MOD_PRIME;
    return uVal < 0 ? uVal + MOD_PRIME : uVal;
}

// Calculates nPr (permutations) modulo MOD_PRIME.
// nPr = n! / (n-r)! = n! * (n-r)!^-1 mod MOD_PRIME.
function calculatePermutationsMod(nValue, rValue) {
    const numerator = cachedFactorials[nValue];
    const denominatorInverse = getModularInverse(cachedFactorials[(nValue - rValue + MOD_PRIME) % MOD_PRIME]);
    return modMultiply(numerator, denominatorInverse);
}

// Calculates (base^exponent) modulo MOD_PRIME using binary exponentiation (exponentiation by squaring).
function calculatePowerMod(baseValue, exponentValue) {
    let resultValue = 1;
    let currentBase = baseValue % MOD_PRIME; // Ensure base is within modulo range

    while (exponentValue > 0) {
        if (exponentValue & 1) { // If exponent is odd
            resultValue = modMultiply(resultValue, currentBase);
        }
        currentBase = modMultiply(currentBase, currentBase);
        exponentValue >>= 1; // Divide exponent by 2
    }
    return resultValue;
}

// Orchestrates the main calculation logic.
function executeCalculations() {
    const queryCount = inputReaderInstance.fetchSingleToken();
    const resultCollection = [];

    precomputeFactorials(MOD_PRIME); // Precompute factorials up to MOD_PRIME

    for (let i = 0; i < queryCount; i++) {
        const [xVal, dVal, nVal] = inputReaderInstance.fetchLineTokens();

        // If n is greater than or equal to MOD_PRIME, the result is 0 in this context.
        // This preserves the original 'continue' behavior which effectively leaves the result as 0.
        if (nVal >= MOD_PRIME) {
            resultCollection.push(0);
            continue;
        }

        if (dVal === 0) {
            resultCollection.push(calculatePowerMod(xVal, nVal));
        } else {
            // Calculate intermediateA = (MOD_PRIME - x * d^-1) % MOD_PRIME
            const intermediateA = (MOD_PRIME - modMultiply(xVal, getModularInverse(dVal)) % MOD_PRIME + MOD_PRIME) % MOD_PRIME;
            
            // Calculate permutationsResult = nPr(intermediateA, nVal)
            const permutationsResult = calculatePermutationsMod(intermediateA, nVal);
            
            // Calculate modPowerResult = (MOD_PRIME - dVal)^nVal
            const modPowerResult = calculatePowerMod(MOD_PRIME - dVal, nVal);
            
            // Final result is (permutationsResult * modPowerResult) % MOD_PRIME
            resultCollection.push(modMultiply(permutationsResult, modPowerResult));
        }
    }
    return resultCollection.join("\n");
}

console.log(executeCalculations());
