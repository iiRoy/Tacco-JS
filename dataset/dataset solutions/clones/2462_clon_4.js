"use strict";
const createInputParser = (rawContent) => {
    let lineBuffer = rawContent.trim().split("\n");
    let currentLineIndex = 0;
    let currentLineTokens = [];

    const advanceLine = () => {
        if (currentLineIndex < lineBuffer.length) {
            currentLineTokens = lineBuffer[currentLineIndex++].split(" ");
        } else {
            currentLineTokens = [];
        }
    };

    advanceLine(); // Initialize the first line's tokens

    const fetchToken = (asString = false) => {
        if (currentLineTokens.length === 0) {
            advanceLine();
            if (currentLineTokens.length === 0) {
                return undefined;
            }
        }
        const token = currentLineTokens.shift();
        return asString ? token : Number(token);
    };

    const fetchLine = (asStrings = false) => {
        const line = lineBuffer[currentLineIndex++];
        const tokens = line.split(" ");
        return asStrings ? tokens : tokens.map(Number);
    };

    const fetchMatrix = (rowCount, asStrings = false) => {
        const matrix = Array.from({ length: rowCount }, () => {
            const line = lineBuffer[currentLineIndex++];
            const tokens = line.split(" ");
            return asStrings ? tokens : tokens.map(Number);
        });
        return matrix;
    };

    const fetchRows = (rowCount, asStrings = false) => {
        const rows = Array.from({ length: rowCount }, () => {
            const line = lineBuffer[currentLineIndex++];
            return asStrings ? line : Number(line);
        });
        return rows;
    };

    return {
        fetchToken,
        fetchLine,
        fetchMatrix,
        fetchRows,
    };
};

const generateMultiDimensionalArray = (initialValue, ...dimensions) => {
    const createArrayRecursive = (dims, currentDepth) => {
        if (currentDepth === dims.length - 1) {
            return Array.from({ length: dims[currentDepth] }, () => initialValue);
        } else {
            return Array.from({ length: dims[currentDepth] }, () =>
                createArrayRecursive(dims, currentDepth + 1)
            );
        }
    };
    if (dimensions.length === 0) {
        return initialValue;
    }
    return createArrayRecursive(dimensions, 0);
};

const MOD_VAL = 998244353;
let _factorialValues = [];
let _inverseFactorialValues = [];

const modMultiply = (...factors) => {
    return factors.reduce((accumulator, currentFactor) => {
        return (accumulator * currentFactor) % MOD_VAL;
    }, 1);
};

const modInverse = (number) => {
    let a = number;
    let b = MOD_VAL;
    let x = 1, y = 0;
    let temp;

    while (b !== 0) {
        let quotient = Math.floor(a / b);
        temp = b;
        b = a % b;
        a = temp;

        temp = y;
        y = x - quotient * y;
        x = temp;
    }
    x %= MOD_VAL;
    return x < 0 ? x + MOD_VAL : x;
};

const modPower = (base, exponent) => {
    let result = 1;
    let currentBase = base % MOD_VAL;
    let currentExponent = exponent;

    while (currentExponent > 0) {
        if (currentExponent % 2 === 1) {
            result = modMultiply(result, currentBase);
        }
        currentBase = modMultiply(currentBase, currentBase);
        currentExponent = Math.floor(currentExponent / 2);
    }
    return result;
};

const precomputeFactorials = (limit) => {
    _factorialValues = new Array(limit + 1);
    _inverseFactorialValues = new Array(limit + 1);

    _factorialValues[0] = 1;
    for (let k = 1; k <= limit; k++) {
        _factorialValues[k] = modMultiply(_factorialValues[k - 1], k);
    }

    _inverseFactorialValues[limit] = modInverse(_factorialValues[limit]);
    for (let k = limit - 1; k >= 0; k--) {
        _inverseFactorialValues[k] = modMultiply(_inverseFactorialValues[k + 1], k + 1);
    }
};

const combinations = (nVal, rVal) => {
    if (rVal < 0 || rVal > nVal) return 0;
    return modMultiply(_factorialValues[nVal], _inverseFactorialValues[rVal], _inverseFactorialValues[nVal - rVal]);
};

const inputReader = createInputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

function solveProblem() {
    const problemSize = inputReader.fetchToken();
    precomputeFactorials(problemSize);

    let finalResult = modPower(3, problemSize);
    let currentPowerOfTwo = 1;

    const lowerBound = Math.floor(problemSize / 2);

    finalResult = Array.from({ length: problemSize - lowerBound }, (_, index) => problemSize - index)
        .reduce((accumulator, currentI) => {
            currentPowerOfTwo = modMultiply(currentPowerOfTwo, 2);
            const term = modMultiply(combinations(problemSize, currentI), currentPowerOfTwo);
            return (accumulator - term + MOD_VAL) % MOD_VAL;
        }, finalResult);

    return finalResult;
}

console.log(solveProblem());
