"use strict";

const createInputHandler = (() => {
    class InputSource {
        constructor(rawContent) {
            this._sourceLines = rawContent.trim().split('\n');
            this._lineCursor = 0;
        }

        // Mimics original g.prototype.a - reads tokens right-to-left from current line
        extractValue(returnAsString = false) {
            if (this._lineCursor >= this._sourceLines.length) {
                throw new Error("Input exhausted: Attempted to extract value beyond available lines.");
            }

            let currentLineData = this._sourceLines[this._lineCursor];

            // If current line is still a string, convert it to a reversed array of tokens in place
            if (typeof currentLineData === 'string') {
                this._sourceLines[this._lineCursor] = currentLineData.split(' ').reverse();
                currentLineData = this._sourceLines[this._lineCursor];
            }

            if (!Array.isArray(currentLineData) || currentLineData.length === 0) {
                throw new Error("Input error: Line content invalid or already empty for token extraction.");
            }

            const extracted = currentLineData.pop();

            // If the current line is now empty, advance to the next line
            if (currentLineData.length === 0) {
                this._lineCursor++;
            }

            return returnAsString ? extracted : Number(extracted);
        }

        // Mimics original g.prototype.l - reads a full line and advances
        readFullLine(returnAsStrings = false) {
            if (this._lineCursor >= this._sourceLines.length) {
                throw new Error("Input exhausted: Attempted to read full line beyond available lines.");
            }
            const lineContent = this._sourceLines[this._lineCursor];
            this._lineCursor++; // Always advance line cursor

            // The original `l` method reads `_s[this._y++]`. If `_s[this._y]` was modified by `a` to be an array,
            // then `_s[this._y].split(" ")` would fail. This implies `extractValue` and `readFullLine`
            // are not meant to be interleaved on the same line index.
            // Given `calculateResult` only uses `extractValue`, this specific conflict is avoided.
            const tokens = typeof lineContent === 'string' ? lineContent.split(' ') : lineContent;
            return returnAsStrings ? tokens : tokens.map(Number);
        }

        // Mimics original g.prototype.m - reads N lines as a matrix
        readMatrix(numRows, returnAsStrings = false) {
            return Array.from({ length: numRows }, () => this.readFullLine(returnAsStrings));
        }

        // Mimics original g.prototype.r - reads N lines, each as a single value
        readColumn(numRows, returnAsStrings = false) {
            return Array.from({ length: numRows }, () => {
                const line = this.readFullLine(returnAsStrings);
                if (line.length !== 1) {
                    throw new Error("Input error: Expected single token per line for column read.");
                }
                return line[0];
            });
        }
    }
    return (inputString) => new InputSource(inputString);
})();

const inputData = createInputHandler(require("fs").readFileSync("/dev/stdin", "utf8"));

const constructMultiDimensionalArray = (dimensions, fillValue) => {
    const buildRecursive = (dims) => {
        if (dims.length === 0) {
            return fillValue;
        }
        const currentDimSize = dims[0];
        const remainingDims = dims.slice(1);
        return Array.from({ length: currentDimSize }, () => buildRecursive(remainingDims));
    };
    return buildRecursive(dimensions);
};

const MOD_CONSTANT = 998244353;

const modularMultiply = (factorA, factorB) => {
    return (factorA * factorB) % MOD_CONSTANT;
};

const modularInverse = (num) => {
    let [currentNum, modulus] = [num, MOD_CONSTANT];
    let [x0, x1] = [1, 0];
    let [y0, y1] = [0, 1];

    while (modulus !== 0) {
        const quotient = Math.floor(currentNum / modulus);
        [currentNum, modulus] = [modulus, currentNum % modulus];
        [x0, x1] = [x1, x0 - quotient * x1];
        [y0, y1] = [y1, y0 - quotient * y1];
    }
    return (x0 % MOD_CONSTANT + MOD_CONSTANT) % MOD_CONSTANT;
};

const modularPower = (base, exponent) => {
    let resultAccumulator = 1;
    let currentBase = base;
    let currentExponent = exponent;

    while (currentExponent > 0) {
        if (currentExponent % 2 === 1) {
            resultAccumulator = modularMultiply(resultAccumulator, currentBase);
        }
        currentBase = modularMultiply(currentBase, currentBase);
        currentExponent = Math.floor(currentExponent / 2);
    }
    return resultAccumulator;
};

console.log(calculateResult());

function calculateResult() {
    const N_VALUE = inputData.extractValue();
    let finalAnswer = modularPower(3, N_VALUE);

    const halfN = N_VALUE >> 1;

    const { accumulatedSubtraction } = Array.from({ length: halfN }).reduce(
        ({ currentBinomialCoefficient, currentPowerOfTwo, totalSubtraction }, _, iterationIndex) => {
            // In original loop: `i` is `iterationIndex`
            // `p2` becomes `2^(iterationIndex+1)`
            const nextPowerOfTwo = modularMultiply(currentPowerOfTwo, 2);

            // Term to subtract: `C(N_VALUE, iterationIndex) * 2^(iterationIndex+1)`
            const termForThisIteration = modularMultiply(currentBinomialCoefficient, nextPowerOfTwo);

            // Update `C(N_VALUE, iterationIndex)` to `C(N_VALUE, iterationIndex+1)` for next iteration
            const nextBinomialCoefficient = modularMultiply(
                modularMultiply(currentBinomialCoefficient, N_VALUE - iterationIndex),
                modularInverse(iterationIndex + 1)
            );

            return {
                currentBinomialCoefficient: nextBinomialCoefficient,
                currentPowerOfTwo: nextPowerOfTwo,
                accumulatedSubtraction: (totalSubtraction + termForThisIteration) % MOD_CONSTANT,
            };
        },
        {
            currentBinomialCoefficient: 1, // Represents C(N_VALUE, 0)
            currentPowerOfTwo: 1,         // Represents 2^0
            accumulatedSubtraction: 0,
        }
    );

    finalAnswer = (finalAnswer - accumulatedSubtraction + MOD_CONSTANT) % MOD_CONSTANT;
    return finalAnswer;
}
