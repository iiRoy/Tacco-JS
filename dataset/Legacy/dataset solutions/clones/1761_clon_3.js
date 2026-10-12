"use strict";
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenStream = rawData.split(/ |\n/), tokenIndex = 0;

function readInt() { return +tokenStream[tokenIndex++]; }
function readString() { return tokenStream[tokenIndex++]; }
function readBigInt() { return BigInt(tokenStream[tokenIndex++]); }

function readInts(count, asStrings) {
    const values = tokenStream.slice(tokenIndex, tokenIndex + count);
    tokenIndex += count;
    return asStrings ? values : values.map(val => +val);
}

function readMatrix(height, width, asStrings) {
    const matrix = [];
    for (let i = 0; i < height; i++) {
        const row = tokenStream.slice(tokenIndex, tokenIndex + width);
        tokenIndex += width;
        matrix.push(asStrings ? row : row.map(val => +val));
    }
    return matrix;
}

// Type III: Replaced eval-based xArray with a recursive function for multi-dimensional array creation.
function createMultiDimArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }

    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);
    const newArray = new Array(currentDimensionSize);

    for (let i = 0; i < currentDimensionSize; i++) {
        newArray[i] = createMultiDimArray(initialValue, ...remainingDimensions);
    }
    return newArray;
}

var primeModulus = 998244353;

// Type III: Rewritten for clarity while preserving the original's overflow-prevention logic.
function modMultiply() {
    let currentProduct = arguments[0];
    for (let i = 1; i < arguments.length; i++) {
        const factor = arguments[i];
        // This specific modular multiplication technique prevents overflow
        // when currentProduct * factor might exceed JavaScript's Number.MAX_SAFE_INTEGER (2^53 - 1)
        // before the modulo operation, by splitting currentProduct into 16-bit parts.
        const highPart = Math.floor(currentProduct / 65536); // Equivalent to currentProduct >> 16
        const lowPart = currentProduct & 65535;             // Equivalent to currentProduct % 65536

        let termHigh = (highPart * factor) % primeModulus;
        termHigh = (termHigh * 65536) % primeModulus; // Multiply by 2^16

        let termLow = (lowPart * factor) % primeModulus;

        currentProduct = (termHigh + termLow) % primeModulus;
    }
    return currentProduct;
}

// Type III: Removed unused modular arithmetic utility functions (fset, inv, pow, ncr, npr)
// and unused arrays (fac, finv, invs, pow2) as they are not essential for the main logic's observable behavior.

function normalizeMod(value) {
    return (value % primeModulus + primeModulus) % primeModulus;
}

var programResult = executeProgram();
if (programResult !== undefined) console.log(programResult);

function executeProgram() {
    const [startRow, startCol, endRow, endCol] = readInts(4);

    // Type III: Using the new createMultiDimArray function.
    const dynamicProgTable = createMultiDimArray(0, endRow + 1, endCol + 1);

    // Initialize the base case for the DP table.
    dynamicProgTable[startRow][startCol] = 1;

    // Iterate through the DP table to fill it.
    for (let currentRow = startRow; currentRow <= endRow; currentRow++) {
        for (let currentCol = startCol; currentCol <= endCol; currentCol++) {
            // Type III: Skip the initial cell as it's already set and its calculation
            // would involve invalid (currentRow-1) or (currentCol-1) indices if startRow/startCol is 0.
            // The original code implicitly handles this by dp[<invalid>] being 0.
            if (currentRow === startRow && currentCol === startCol) {
                continue;
            }

            let currentCellValue = 0;

            // Type III: Split the complex DP update into multiple steps with intermediate variables
            // and explicit boundary checks for clarity.
            // Contribution from the cell directly above (currentRow-1, currentCol)
            if (currentRow > 0) {
                const valueFromAbove = dynamicProgTable[currentRow - 1][currentCol];
                const termFromAbove = modMultiply(valueFromAbove, currentCol);
                currentCellValue = normalizeMod(currentCellValue + termFromAbove);
            }

            // Contribution from the cell directly to the left (currentRow, currentCol-1)
            if (currentCol > 0) {
                const valueFromLeft = dynamicProgTable[currentRow][currentCol - 1];
                const termFromLeft = modMultiply(valueFromLeft, currentRow);
                currentCellValue = normalizeMod(currentCellValue + termFromLeft);
            }

            // Subtraction for the overlap from the diagonal cell (currentRow-1, currentCol-1)
            // This term is subtracted because it's counted twice (once from above, once from left).
            if (currentRow > 0 && currentCol > 0) {
                const valueFromDiagonal = dynamicProgTable[currentRow - 1][currentCol - 1];
                const termToSubtract = modMultiply(valueFromDiagonal, currentRow - 1, currentCol - 1);
                currentCellValue = normalizeMod(currentCellValue - termToSubtract);
            }
            
            dynamicProgTable[currentRow][currentCol] = currentCellValue;
        }
    }
    return normalizeMod(dynamicProgTable[endRow][endCol]);
}
