"use strict";
const fileSystem = require("fs");
const rawInputData = fileSystem.readFileSync("/dev/stdin", "utf8");
let tokenArray = rawInputData.split(/ |\n/);
let tokenIndex = 0;

const inputReader = {
    readNum: function() {
        return +tokenArray[tokenIndex++];
    },
    readStr: function() {
        return tokenArray[tokenIndex++];
    },
    readBigInt: function() {
        return BigInt(tokenArray[tokenIndex++]);
    },
    readNumSequence: function(count, mapToNumber = true) {
        const sequence = tokenArray.slice(tokenIndex, tokenIndex += count);
        return mapToNumber ? sequence.map(val => +val) : sequence;
    },
    readMatrix: function(height, width, mapToNumber = true) {
        const matrix = [];
        for (let rowIdx = 0; rowIdx < height; rowIdx++) {
            const row = tokenArray.slice(tokenIndex, tokenIndex += width);
            matrix.push(mapToNumber ? row.map(val => +val) : row);
        }
        return matrix;
    },
    createMultiDimArray: function(initialValue) {
        const args = arguments;
        const argCount = args.length;
        let evalString = "Array(args[" + (argCount - 1) + "]).fill().map(x=>{return " + initialValue + ";})";
        for (let i = argCount - 2; i >= 0; i--) {
            evalString = "Array(args[" + i + "]).fill().map(x=>" + evalString + ")";
        }
        return eval(evalString);
    }
};

const MODULUS_VAL = 1e9 + 7;

function multiplyMod(firstOperand, ...otherOperands) {
    let currentResult = firstOperand;
    for (let i = 0; i < otherOperands.length; i++) {
        const nextOperand = otherOperands[i];
        currentResult = ((currentResult >> 16) * nextOperand % MODULUS_VAL * 65536 + (currentResult & 65535) * nextOperand) % MODULUS_VAL;
    }
    return currentResult;
}

let factorials = [];
let invFactorials = [];

function precomputeFactorials(limit) {
    factorials.length = limit + 1;
    factorials[0] = factorials[1] = 1;
    for (let i = 2; i <= limit; i++) {
        factorials[i] = multiplyMod(factorials[i - 1], i);
    }

    invFactorials.length = limit + 1;
    invFactorials[0] = invFactorials[1] = 1;
    invFactorials[limit] = modInverse(factorials[limit]);
    for (let i = limit; i > 2; i--) {
        invFactorials[i - 1] = multiplyMod(invFactorials[i], i);
    }
}

function modInverse(num) {
    let a = MODULUS_VAL,
        b = num,
        u = 0,
        v = 1,
        temp;
    while (b) {
        temp = a / b | 0;
        a -= temp * b;
        u -= temp * v;
        temp = a;
        a = b;
        b = temp;
        temp = u;
        u = v;
        v = temp;
    }
    u %= MODULUS_VAL;
    return u < 0 ? u + MODULUS_VAL : u;
}

function modPow(base, exponent) {
    let res = 1;
    let currentBase = base;
    while (exponent) {
        if (exponent & 1) {
            res = multiplyMod(currentBase, res);
        }
        currentBase = multiplyMod(currentBase, currentBase);
        exponent >>= 1;
    }
    return res;
}

function nCrMod(n, r) {
    if (r < 0 || r > n) return 0;
    return multiplyMod(factorials[n], invFactorials[r], invFactorials[n - r]);
}

function nPrMod(n, r) {
    if (r < 0 || r > n) return 0;
    return multiplyMod(factorials[n], invFactorials[n - r]);
}

function normalizeMod(num) {
    return (num % MODULUS_VAL + MODULUS_VAL) % MODULUS_VAL;
}

const problemResult = solveProblem();
if (problemResult !== undefined) {
    console.log(String(problemResult));
}

function solveProblem() {
    const countVal = inputReader.readNum();
    let valA = inputReader.readBigInt();
    let valB = inputReader.readBigInt();

    let xorSumOthers = 0n;
    for (let idx = 2; idx < countVal; idx++) {
        xorSumOthers ^= inputReader.readBigInt();
    }

    let finalAnswer = 0n;
    let currentXorSum = valA ^ valB ^ xorSumOthers;

    while (currentXorSum !== 0n) {
        // Note: valA is a BigInt, so valA === 1 will always be false.
        // This preserves the original behavior where this condition never triggers.
        if (valA === 1) {
            return -1;
        }

        const MAX_BIT_POSITION = 40;
        for (let bitIdx = MAX_BIT_POSITION; bitIdx >= 0; bitIdx--) {
            const bitMask = 1n << BigInt(bitIdx);
            
            if ((currentXorSum & bitMask) === 0n) {
                continue;
            }

            const lowerBitsMask = bitMask - 1n;
            let transferAmount = (valA & lowerBitsMask) + 1n;
            
            transferAmount = getMin(transferAmount, bitMask - (valB & lowerBitsMask));

            if (transferAmount < valA) {
                finalAnswer += transferAmount;
                valA -= transferAmount;
                valB += transferAmount;
                break;
            } else {
                return -1;
            }
        }
        currentXorSum = valA ^ valB ^ xorSumOthers;
    }

    return finalAnswer;
}

function getMin(value1, value2) {
    return value1 > value2 ? value2 : value1;
}
