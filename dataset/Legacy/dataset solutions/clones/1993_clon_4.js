"use strict";
var dataSource = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenStream = dataSource.split(/ |\n/),
    tokenIndex = 0;

function readNum(asString) {
    return asString ? tokenStream[tokenIndex++] : +tokenStream[tokenIndex++];
}

function readNumArray(count, asString) {
    return asString ? tokenStream.slice(tokenIndex, tokenIndex += count) : tokenStream.slice(tokenIndex, tokenIndex += count).map(val => +val);
}

function readNumMatrix(height, width, asString) {
    var resultMatrix = [],
        rowIdx = 0;
    if (asString)
        for (; rowIdx < height; rowIdx++) resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += width));
    else
        for (; rowIdx < height; rowIdx++) resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += width).map(val => +val));
    return resultMatrix;
}

function createMultiDimArray(initialValue, ...dimensions) {
    const createRecursive = (dims, currentDimIdx) => {
        if (currentDimIdx === dims.length) {
            return initialValue;
        }
        const currentDimSize = dims[currentDimIdx];
        return Array.from({
            length: currentDimSize
        }, () => createRecursive(dims, currentDimIdx + 1));
    };
    return createRecursive(dimensions, 0);
}

var primeModulus = 1e9 + 7;

function modProduct(...factors) {
    return factors.reduce((accumulator, current) => {
        return Number((BigInt(accumulator) * BigInt(current)) % BigInt(primeModulus));
    }, 1);
}

function modPower(base, exponent) {
    base %= primeModulus;
    if (exponent === 0) return 1;
    if (exponent === 1) return base;
    const halfPower = modPower(base, Math.floor(exponent / 2));
    let res = modProduct(halfPower, halfPower);
    if (exponent % 2 === 1) {
        res = modProduct(res, base);
    }
    return res;
}

var finalResult = computeSolution();
if (finalResult !== undefined) console.log(finalResult);

function computeSolution() {
    var exponentVal = readNum();
    var upperBound = readNum();

    var countsArr = createMultiDimArray(0, upperBound + 1);
    for (let currentDivisor = 1; currentDivisor <= upperBound; currentDivisor++) {
        const quotient = Math.floor(upperBound / currentDivisor);
        countsArr[currentDivisor] = modPower(quotient, exponentVal);
    }

    let totalSum = 0;
    for (let currentDivisor = 1; currentDivisor <= upperBound; currentDivisor++) {
        totalSum = (totalSum + modProduct(countsArr[currentDivisor], currentDivisor)) % primeModulus;

        for (let multipleVal = currentDivisor * 2; multipleVal <= upperBound; multipleVal += currentDivisor) {
            countsArr[multipleVal] = (countsArr[multipleVal] - countsArr[currentDivisor] + primeModulus) % primeModulus;
        }
    }

    return totalSum;
}
