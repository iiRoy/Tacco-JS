"use strict";
const InputReaderFactory = (function () {
    function createReader(sourceString) {
        return new InputReader(sourceString);
    }

    function InputReader(sourceString) {
        this.sourceLines = sourceString.trim().split("\n");
        this.currentLineIndex = 0;
    }

    InputReader.prototype.readNumberFromLineEnd = function (returnAsString) {
        const lines = this.sourceLines;
        const lineIdx = this.currentLineIndex;
        let extractedToken;

        if (typeof lines[lineIdx] === "string") {
            lines[lineIdx] = lines[lineIdx].split(" ").reverse();
        }

        extractedToken = lines[lineIdx].pop();

        if (lines[lineIdx].length === 0) {
            this.currentLineIndex++;
        }

        return returnAsString ? extractedToken : Number(extractedToken);
    };

    InputReader.prototype.readNumbersFromLine = function (returnAsStrings) {
        const lineContent = this.sourceLines[this.currentLineIndex++];
        const tokens = lineContent.split(" ");
        return returnAsStrings ? tokens : tokens.map(token => Number(token));
    };

    InputReader.prototype.readMatrix = function (numRows, returnAsStrings) {
        const startIdx = this.currentLineIndex;
        this.currentLineIndex += numRows;
        const rawRows = this.sourceLines.slice(startIdx, this.currentLineIndex);

        const processedMatrix = rawRows.map(line => {
            const rowTokens = line.split(" ");
            return returnAsStrings ? rowTokens : rowTokens.map(token => Number(token));
        });
        return processedMatrix;
    };

    InputReader.prototype.readRawLines = function (numLines, returnAsNumbers) {
        const startIdx = this.currentLineIndex;
        this.currentLineIndex += numLines;
        const linesToProcess = this.sourceLines.slice(startIdx, this.currentLineIndex);
        return returnAsNumbers ? linesToProcess.map(line => Number(line)) : linesToProcess;
    };

    return createReader;
})();
const inputProcessor = InputReaderFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue) {
    const args = arguments;
    let dimensionCount = args.length;
    let arrayCreationCode = "";

    dimensionCount--;
    arrayCreationCode = `Array(args[${dimensionCount}]).fill(0).map(element => { return ${initialValue}; })`;

    while (--dimensionCount > 0) {
        arrayCreationCode = `Array(args[${dimensionCount}]).fill(0).map(element => ${arrayCreationCode})`;
    }

    return eval(arrayCreationCode);
}

const MODULUS_VALUE = 998244353;

function multiplyMod(factorA, factorB) {
    const highPartA = factorA >> 16;
    const lowPartA = factorA & 65535;

    const term1 = (highPartA * factorB) % MODULUS_VALUE * 65536;
    const term2 = lowPartA * factorB;

    return (term1 + term2) % MODULUS_VALUE;
}

function powerMod(base, exponent) {
    let result = 1;
    let currentBase = base;

    while (exponent > 0) {
        if (exponent & 1) {
            result = multiplyMod(currentBase, result);
        }
        currentBase = multiplyMod(currentBase, currentBase);
        exponent >>= 1;
    }
    return result;
}

console.log(calculateResult());

function calculateResult() {
    const inputN = inputProcessor.readNumberFromLineEnd();

    let finalAnswer = powerMod(3, inputN);
    let currentFactorialTerm = 2;
    const halfN = inputN / 2;

    const modularInverses = new Array(Math.floor(halfN) + 2);
    modularInverses[0] = 1;
    modularInverses[1] = 1;

    let loopIterationCounter = 0;
    while (loopIterationCounter < halfN) {
        finalAnswer -= currentFactorialTerm;

        const termNumeratorPart = (inputN - loopIterationCounter) * 2;
        const nextFactorialTerm = multiplyMod(multiplyMod(currentFactorialTerm, termNumeratorPart), modularInverses[++loopIterationCounter]);
        currentFactorialTerm = nextFactorialTerm;

        const divisorForInverse = loopIterationCounter + 1;
        const modRemainder = MODULUS_VALUE % divisorForInverse;
        const modQuotient = Math.floor(MODULUS_VALUE / divisorForInverse);
        
        const inverseCalculationPart = multiplyMod(modularInverses[modRemainder], modQuotient);
        modularInverses[divisorForInverse] = MODULUS_VALUE - inverseCalculationPart;
    }

    finalAnswer %= MODULUS_VALUE;
    if (finalAnswer < 0) {
        finalAnswer += MODULUS_VALUE;
    }
    return finalAnswer;
}
