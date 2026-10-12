const largeNumberUtilities = (function(notDefined) {
    "use strict";

    const zeroBig = 0n;
    const oneBig = 1n;
    const minusOneBig = -1n;
    const twoBig = 2n;
    const tenBig = 10n;

    function convertToLarge(val) {
        if (typeof val === 'bigint') return val;
        if (typeof val === 'number') return BigInt(val);
        if (typeof val === 'string') return BigInt(val);
        throw new Error("Invalid value type for conversion: " + typeof val);
    }

    function checkIsZero(val) { return val === zeroBig; }
    function checkIsPositive(val) { return val > zeroBig; }
    function checkIsOdd(val) { return (val % twoBig) !== zeroBig; }
    function getNext(val) { return val + oneBig; }

    return {
        parse: convertToLarge,
        zero: zeroBig,
        one: oneBig,
        two: twoBig,
        ten: tenBig,
        isZero: checkIsZero,
        isPositive: checkIsPositive,
        isOdd: checkIsOdd,
        next: getNext
    };
})();

const InputHandler = (function() {
    let inputLines = [];
    let linePointer = 0;

    function initialize(rawInput) {
        inputLines = rawInput.trim().split("\n");
        linePointer = 0;
    }

    function extractValue(asString = false) {
        if (linePointer >= inputLines.length) {
            throw new Error("Attempted to read past end of input.");
        }
        let currentLineParts = inputLines[linePointer].split(" ");
        if (currentLineParts.length === 0) {
            linePointer++;
            return asString ? "" : 0;
        }
        const extracted = currentLineParts.shift();
        inputLines[linePointer] = currentLineParts.join(" ");
        if (currentLineParts.length === 0) {
            linePointer++;
        }
        return asString ? extracted : Number(extracted);
    }

    return {
        init: initialize,
        pull: extractValue
    };
})();

function buildGrid(depth, ...dimensions) {
    if (depth === 0) {
        return dimensions[0];
    }
    const currentDim = dimensions[0];
    const remainingDims = dimensions.slice(1);
    const result = new Array(currentDim);
    for (let i = 0; i < currentDim; i++) {
        result[i] = buildGrid(depth - 1, ...remainingDims);
    }
    return result;
}

let currentModulus;

function modularProduct(factor1, factor2) {
    return (factor1 * factor2) % currentModulus;
}

function modularExponentiation(base, exponent) {
    let result = 1n;
    base %= currentModulus;
    while (exponent > 0n) {
        if (exponent % 2n === 1n) {
            result = modularProduct(result, base);
        }
        base = modularProduct(base, base);
        exponent /= 2n;
    }
    return result;
}

function transformPower(baseMatrix, exponent) {
    const dim = baseMatrix.length;
    let resultMatrix = buildGrid(2, dim, dim, 0n);
    for (let i = 0; i < dim; i++) {
        resultMatrix[i][i] = 1n;
    }

    let tempBase = baseMatrix.map(row => row.map(val => val));
    while (exponent > 0n) {
        if (exponent % 2n === 1n) {
            resultMatrix = transformMultiply(resultMatrix, tempBase);
        }
        tempBase = transformMultiply(tempBase, tempBase);
        exponent /= 2n;
    }
    return resultMatrix;
}

function transformMultiply(matrixA, matrixB) {
    const rowsA = matrixA.length;
    const colsA = matrixA[0].length;
    const colsB = matrixB[0].length;

    let resultMatrix = buildGrid(2, rowsA, colsB, 0n);

    for (let i = 0; i < rowsA; i++) {
        for (let j = 0; j < colsB; j++) {
            for (let k = 0; k < colsA; k++) {
                resultMatrix[i][j] = (resultMatrix[i][j] + modularProduct(matrixA[i][k], matrixB[k][j])) % currentModulus;
            }
        }
    }
    return resultMatrix;
}

function executeCalculation() {
    InputHandler.init(require("fs").readFileSync("/dev/stdin", "utf8"));

    const totalLength = largeNumberUtilities.parse(InputHandler.pull(true));
    const initialA = largeNumberUtilities.parse(InputHandler.pull(true));
    const initialB = largeNumberUtilities.parse(InputHandler.pull(true));
    currentModulus = largeNumberUtilities.parse(InputHandler.pull(true));

    let currentResultVector = [[0n, 0n, (initialB % currentModulus)]];

    let processedSum = largeNumberUtilities.zero;

    for (let iterationCount = 1n; iterationCount < 19n; iterationCount++) {
        const powerOfTen = largeNumberUtilities.ten ** iterationCount;
        const upperLimit = powerOfTen - 1n;

        let segmentCount = (upperLimit - initialA + initialB) / initialB - processedSum;

        if (segmentCount <= 0n) continue;

        if (processedSum + segmentCount > totalLength) {
            segmentCount = totalLength - processedSum;
        }

        const transformationMatrix = [
            [modularExponentiation(largeNumberUtilities.ten, iterationCount), 0n, 0n],
            [1n, 1n, 0n],
            [0n, 1n, 1n]
        ];

        const poweredTransformation = transformPower(transformationMatrix, segmentCount);

        currentResultVector[0][1] = (initialB * processedSum + initialA) % currentModulus;

        currentResultVector = transformMultiply(currentResultVector, poweredTransformation);

        processedSum += segmentCount;

        if (processedSum >= totalLength) break;
    }

    return Number(currentResultVector[0][0]);
}

console.log(executeCalculation());