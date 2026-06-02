"use strict";
const FS_MODULE = require("fs");
const INPUT_FILE_PATH = "/dev/stdin";
const NEWLINE_OR_SPACE_REGEX = / |\n/;

var rawInputData = FS_MODULE.readFileSync(INPUT_FILE_PATH, "utf8");
var inputTokens = rawInputData.split(NEWLINE_OR_SPACE_REGEX);
var currentTokenIndex = 0;

function getNextInteger() { return +inputTokens[currentTokenIndex++]; }
function getNextString() { return inputTokens[currentTokenIndex++]; }
function getNextBigInt() { return BigInt(inputTokens[currentTokenIndex++]); }

function getNextArray(count, returnAsStrings) {
    const startIndex = currentTokenIndex;
    currentTokenIndex += count;
    const slice = inputTokens.slice(startIndex, currentTokenIndex);
    return returnAsStrings ? slice : slice.map(val => +val);
}

function getNextMatrix(height, width, returnAsStrings) {
    const matrixResult = [];
    for (let row = 0; row < height; row++) {
        const startIndex = currentTokenIndex;
        currentTokenIndex += width;
        const rowSlice = inputTokens.slice(startIndex, currentTokenIndex);
        matrixResult.push(returnAsStrings ? rowSlice : rowSlice.map(val => +val));
    }
    return matrixResult;
}

function initializeMultiDimArray(initialValue) {
    const args = arguments;
    let dimCount = args.length;
    let evalExpression = `Array(args[${--dimCount}]).fill().map(() => ${initialValue})`;
    while (--dimCount) {
        evalExpression = `Array(args[${dimCount}]).fill().map(() => ${evalExpression})`;
    }
    return eval(evalExpression);
}

const MODULUS_VALUE = 1_000_000_007;
const BIGINT_ONE = 1n;
const BIGINT_ZERO = 0n;

function performModularMultiplication() {
    let currentProduct = arguments[0];
    for (let argIndex = 1; argIndex < arguments.length; argIndex++) {
        const multiplier = arguments[argIndex];
        currentProduct = ((currentProduct >> 16) * multiplier % MODULUS_VALUE * 65536 + (currentProduct & 65535) * multiplier) % MODULUS_VALUE;
    }
    return currentProduct;
}

var precomputedFactorials = [];
var precomputedInverseFactorials = [];

function setupFactorialTables(limit) {
    precomputedFactorials.length = limit + 1;
    precomputedFactorials[0] = precomputedFactorials[1] = 1;
    for (let i = 2; i <= limit; i++) {
        precomputedFactorials[i] = performModularMultiplication(precomputedFactorials[i - 1], i);
    }

    precomputedInverseFactorials.length = limit + 1;
    precomputedInverseFactorials[0] = precomputedInverseFactorials[1] = 1;
    precomputedInverseFactorials[limit] = calculateModularInverse(precomputedFactorials[limit]);
    for (let i = limit; i > 2; i--) {
        precomputedInverseFactorials[i - 1] = performModularMultiplication(precomputedInverseFactorials[i], i);
    }
}

function calculateModularInverse(numValue) {
    let a = MODULUS_VALUE, u = 0, v = 1, tempVal;
    while (numValue) {
        tempVal = Math.floor(a / numValue);
        a -= tempVal * numValue;
        u -= tempVal * v;
        tempVal = a; a = numValue; numValue = tempVal;
        tempVal = u; u = v; v = tempVal;
    }
    u %= MODULUS_VALUE;
    return u < 0 ? u + MODULUS_VALUE : u;
}

function calculateModularPower(base, exponent) {
    let result = 1;
    while (exponent > 0) {
        if (exponent & 1) {
            result = performModularMultiplication(base, result);
        }
        base = performModularMultiplication(base, base);
        exponent >>= 1;
    }
    return result;
}

function calculateNcrMod(n, r) {
    return performModularMultiplication(precomputedFactorials[n], precomputedInverseFactorials[r], precomputedInverseFactorials[n - r]);
}

function calculateNprMod(n, r) {
    return performModularMultiplication(precomputedFactorials[n], precomputedInverseFactorials[n - r]);
}

function ensurePositiveModulo(num) {
    return (num % MODULUS_VALUE + MODULUS_VALUE) % MODULUS_VALUE;
}

const EXECUTION_TIME_LIMIT = +(new Date()) + 1900;
const PROGRAM_OUTPUT = executeMainLogic();
if (PROGRAM_OUTPUT !== undefined) {
    console.log(String(PROGRAM_OUTPUT));
}

function findMinBigInt(val1, val2) {
    return val1 > val2 ? val2 : val1;
}

function executeMainLogic() {
    const totalCount = getNextInteger();
    let valueA = getNextBigInt();
    let valueB = getNextBigInt();

    let xorSumOfOthers = BIGINT_ZERO;
    for (let i = 2; i < totalCount; i++) {
        xorSumOfOthers ^= getNextBigInt();
    }

    let totalTransferOperations = BIGINT_ZERO;
    let currentXorDifference = valueA ^ valueB ^ xorSumOfOthers;

    while (currentXorDifference !== BIGINT_ZERO) {
        if (valueA === BIGINT_ONE || new Date() > EXECUTION_TIME_LIMIT) {
            return -1;
        }

        for (let bitPosition = 40; bitPosition >= 0; bitPosition--) {
            const currentBitMask = BIGINT_ONE << BigInt(bitPosition);

            if ((currentXorDifference & currentBitMask) === BIGINT_ZERO) {
                continue;
            }

            const lowerBitsOfA = valueA & (currentBitMask - BIGINT_ONE);
            const lowerBitsOfB = valueB & (currentBitMask - BIGINT_ONE);

            let potentialTransfer = lowerBitsOfA + BIGINT_ONE;
            potentialTransfer = findMinBigInt(potentialTransfer, currentBitMask - lowerBitsOfB);

            if (potentialTransfer < valueA) {
                totalTransferOperations += potentialTransfer;
                valueA -= potentialTransfer;
                valueB += potentialTransfer;
                break;
            } else {
                return -1;
            }
        }
        currentXorDifference = valueA ^ valueB ^ xorSumOfOthers;
    }
    return totalTransferOperations;
}
