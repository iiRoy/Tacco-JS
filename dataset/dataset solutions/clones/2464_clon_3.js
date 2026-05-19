"use strict";

class InputProcessor {
    constructor(inputString) {
        this.lineData = inputString.trim().split("\n");
        this.currentLineIndex = 0;
    }

    static createInstance(inputString) {
        return new InputProcessor(inputString);
    }

    _ensureLineParsedAndReversed(lineIdx) {
        if (typeof this.lineData[lineIdx] === "string") {
            this.lineData[lineIdx] = this.lineData[lineIdx].split(" ").reverse();
        }
    }

    _parseValueIfRequested(value, asString) {
        return asString ? value : +value;
    }

    readNextItem(asStringFlag) {
        const currentLines = this.lineData;
        const lineIdx = this.currentLineIndex;

        if (lineIdx >= currentLines.length) {
            return undefined; // Or throw an error, depending on expected behavior for EOF
        }

        this._ensureLineParsedAndReversed(lineIdx);

        let extractedItem = currentLines[lineIdx].pop();

        if (currentLines[lineIdx].length === 0) {
            this.currentLineIndex++;
        }

        return this._parseValueIfRequested(extractedItem, asStringFlag);
    }

    readLine(asStringFlag) {
        const lineContent = this.lineData[this.currentLineIndex++];
        const lineParts = lineContent.split(" ");
        return asStringFlag ? lineParts : lineParts.map(val => +val);
    }

    readMatrix(numRows, asStringFlag) {
        const startIdx = this.currentLineIndex;
        const endIdx = startIdx + numRows;
        const matrixRows = this.lineData.slice(startIdx, endIdx).map(line => line.split(" "));
        this.currentLineIndex = endIdx;

        if (asStringFlag) {
            return matrixRows;
        } else {
            return matrixRows.map(row => row.map(val => +val));
        }
    }

    readRawLines(numLines, asStringFlag) {
        const startIdx = this.currentLineIndex;
        const endIdx = startIdx + numLines;
        const rawLines = this.lineData.slice(startIdx, endIdx);
        this.currentLineIndex = endIdx;

        if (asStringFlag) {
            return rawLines;
        } else {
            return rawLines.map(val => +val);
        }
    }
}

const inputReader = InputProcessor.createInstance(require("fs").readFileSync("/dev/stdin", "utf8"));

function initializeMultiDimensionalArray(initialValue) {
    var args = arguments,
        argCount = args.length,
        evalString = "Array(args[" + --argCount + "]).fill(0).map(x=>{return " + initialValue + ";})";
    while (--argCount) evalString = "Array(args[" + argCount + "]).fill(0).map(x=>" + evalString + ")";
    return eval(evalString);
}

const MOD_CONSTANT = 998244353;

function normalizeModulo(value) {
    let normalized = value % MOD_CONSTANT;
    return normalized < 0 ? normalized + MOD_CONSTANT : normalized;
}

function modMultiply() {
    let product = arguments[0];
    for (let i = 1; i < arguments.length; i++) {
        // Optimized modular multiplication for numbers up to MOD_CONSTANT^2
        // (r>>16)*a[i]%mod*65536 + (r&65535)*a[i]
        // This is equivalent to (product * arguments[i]) % MOD_CONSTANT
        // but avoids potential overflow if product * arguments[i] exceeds JS safe integer limit
        // for very large MOD_CONSTANT. For 998244353, direct multiplication is fine.
        // Keeping the original optimization for Type III.
        product = ((product >> 16) * arguments[i] % MOD_CONSTANT * 65536 + (product & 65535) * arguments[i]) % MOD_CONSTANT;
    }
    return product;
}

let factorialN = 1;
let inverseFactorials = [];

function _calculateInverseFactorials(limit) {
    inverseFactorials.length = limit + 1;
    inverseFactorials[0] = inverseFactorials[1] = 1;
    inverseFactorials[limit] = modInverse(factorialN);
    for (let k = limit; k > 1; k--) {
        inverseFactorials[k - 1] = modMultiply(inverseFactorials[k], k);
    }
}

function precomputeFactorialData(nValue) {
    const LARGE_N_THRESHOLD = 8500000;
    if (nValue < LARGE_N_THRESHOLD) {
        for (let i = 2; i <= nValue; i++) {
            factorialN = modMultiply(factorialN, i);
        }
        _calculateInverseFactorials(nValue);
    } else {
        // Hardcoded value from original for n >= 8500000
        factorialN = 488985182;
        for (let i = LARGE_N_THRESHOLD + 1; i <= nValue; i++) {
            factorialN = modMultiply(factorialN, i);
        }
        _calculateInverseFactorials(nValue);
    }
}

function modInverse(valA) {
    let numA = valA;
    let numB = MOD_CONSTANT;
    let u = 1,
        v = 0;
    let temp;

    while (numB) {
        temp = Math.floor(numA / numB);
        numA -= temp * numB;
        u -= temp * v;

        // Swap (numA, numB)
        temp = numA;
        numA = numB;
        numB = temp;

        // Swap (u, v)
        temp = u;
        u = v;
        v = temp;
    }
    return normalizeModulo(u);
}

function modPower(baseVal, exponent) {
    let result = 1;
    let currentBase = baseVal;
    while (exponent > 0) {
        if (exponent & 1) { // If exponent is odd
            result = modMultiply(result, currentBase);
        }
        currentBase = modMultiply(currentBase, currentBase);
        exponent >>= 1; // Divide exponent by 2
    }
    return result;
}

function modNcr(n, r) {
    if (r < 0 || r > n) return 0;
    if (r === 0 || r === n) return 1;
    if (inverseFactorials[r] === undefined || inverseFactorials[n - r] === undefined) {
        // This case should ideally not happen if precomputeFactorialData is called correctly
        // but as a safeguard, we could recompute or throw. For Type III, assume precomputation is done.
    }
    return modMultiply(factorialN, inverseFactorials[r], inverseFactorials[n - r]);
}

console.log(calculateResult());

function calculateResult() {
    const problemSizeN = inputReader.readNextItem();
    let finalResult = modPower(3, problemSizeN);

    precomputeFactorialData(problemSizeN);

    let currentPowerOfTwo = 1;
    const halfN = problemSizeN >> 1; // Equivalent to Math.floor(problemSizeN / 2)

    // The loop iterates from problemSizeN down to halfN + 1
    // This is equivalent to original `m < i` where `m = n>>1`
    for (let loopIdx = problemSizeN; loopIdx > halfN; loopIdx--) {
        currentPowerOfTwo = modMultiply(currentPowerOfTwo, 2);
        const nCrTerm = modNcr(problemSizeN, loopIdx);
        const subtractionTerm = modMultiply(nCrTerm, currentPowerOfTwo);
        finalResult = normalizeModulo(finalResult - subtractionTerm);
    }

    return finalResult;
}
