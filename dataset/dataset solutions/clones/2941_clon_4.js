const createInputParser = (rawInputContent) => {
    let allInputLines = rawInputContent.trim().split('\n');
    let currentLineIndex = 0;
    let currentLineTokens = [];
    let currentTokenIndex = 0;

    const ensureTokensAvailable = () => {
        if (currentTokenIndex >= currentLineTokens.length) {
            if (currentLineIndex >= allInputLines.length) {
                throw new Error("Input exhausted.");
            }
            currentLineTokens = allInputLines[currentLineIndex].split(' ');
            currentTokenIndex = 0;
            currentLineIndex++;
        }
    };

    const retrieveSingleValue = (asStringFlag) => {
        ensureTokensAvailable();
        const extractedToken = currentLineTokens[currentTokenIndex];
        currentTokenIndex++;
        return asStringFlag ? extractedToken : Number(extractedToken);
    };

    const retrieveLineValues = (asStringsFlag) => {
        if (currentLineIndex >= allInputLines.length) {
            throw new Error("Input exhausted.");
        }
        const lineContent = allInputLines[currentLineIndex];
        currentLineIndex++;
        currentLineTokens = [];
        currentTokenIndex = 0;
        return asStringsFlag ? lineContent.split(' ') : lineContent.split(' ').map(Number);
    };

    const retrieveMatrix = (rowCount, asStringsFlag) => {
        const collectedRows = [];
        for (let i = 0; i < rowCount; i++) {
            collectedRows.push(retrieveLineValues(asStringsFlag));
        }
        return collectedRows;
    };

    const retrieveRawLines = (count, asStringsFlag) => {
        const collectedLines = [];
        for (let i = 0; i < count; i++) {
            if (currentLineIndex >= allInputLines.length) {
                throw new Error("Input exhausted.");
            }
            const line = allInputLines[currentLineIndex];
            currentLineIndex++;
            collectedLines.push(asStringsFlag ? line : Number(line));
        }
        return collectedLines;
    };

    return {
        getValue: retrieveSingleValue,
        getLine: retrieveLineValues,
        getMatrix: retrieveMatrix,
        getRows: retrieveRawLines
    };
};
const inputProcessor = createInputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

const createMultiDimArray = (initialFillValue, ...dimensions) => {
    const recursiveArrayBuilder = (depth) => {
        if (depth === dimensions.length) {
            return initialFillValue;
        }
        const currentDimensionSize = dimensions[depth];
        return Array.from({ length: currentDimensionSize }, () => recursiveArrayBuilder(depth + 1));
    };
    return recursiveArrayBuilder(0);
};

const MOD_VAL = 1000000007n;

const calculateModularProduct = (...factors) => {
    return factors.reduce((accumulator, currentFactor) => (accumulator * BigInt(currentFactor)) % MOD_VAL, 1n);
};

const factorialCache = [1n, 1n];
const getFactorialMod = (limit) => {
    for (let i = factorialCache.length; i <= limit; i++) {
        factorialCache[i] = (factorialCache[i - 1] * BigInt(i)) % MOD_VAL;
    }
    return factorialCache[limit];
};

const findModularInverse = (value) => {
    let a = BigInt(value);
    let b = MOD_VAL;
    let x0 = 0n, x1 = 1n;
    while (a > 1n) {
        let quotient = a / b;
        [a, b] = [b, a % b];
        [x0, x1] = [x1 - quotient * x0, x0];
    }
    return x1 < 0n ? x1 + MOD_VAL : x1;
};

const calculateCombinationsMod = (totalItems, chosenItems) => {
    if (chosenItems < 0n || chosenItems > totalItems) return 0n;
    if (chosenItems === 0n || chosenItems === totalItems) return 1n;
    if (chosenItems > totalItems / 2n) chosenItems = totalItems - chosenItems;
    
    return calculateModularProduct(
        getFactorialMod(totalItems),
        findModularInverse(getFactorialMod(chosenItems)),
        findModularInverse(getFactorialMod(totalItems - chosenItems))
    );
};

const computeQuadraticSum = (val) => {
    return val * (val - 1) / 2;
};

const sumQuadraticTermsUpTo = (limit) => {
    let currentTotal = 0n;
    for (let i = 1; i <= limit; i++) {
        currentTotal = (currentTotal + BigInt(computeQuadraticSum(i))) % MOD_VAL;
    }
    return currentTotal;
};

const processCalculation = () => {
    const N_val = inputProcessor.getValue();
    const M_val = inputProcessor.getValue();
    const K_val = inputProcessor.getValue();

    const sumF_M = sumQuadraticTermsUpTo(M_val);
    const sumF_N = sumQuadraticTermsUpTo(N_val);

    let intermediateResult = (
        calculateModularProduct(2n, BigInt(N_val) * BigInt(N_val), sumF_M) +
        calculateModularProduct(2n, BigInt(M_val) * BigInt(M_val), sumF_N)
    ) % MOD_VAL;

    return calculateModularProduct(
        intermediateResult,
        calculateCombinationsMod(BigInt(N_val) * BigInt(M_val) - 2n, BigInt(K_val) - 2n),
        findModularInverse(2n)
    );
};

console.log(processCalculation().toString());
