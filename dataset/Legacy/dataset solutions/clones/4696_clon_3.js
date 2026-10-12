'use strict';

const fileSystemModule = require('fs');

const standardInputFilePath = '/dev/stdin';

const rawInputContent = fileSystemModule.readFileSync(standardInputFilePath, 'utf8');

const processedInputLines = rawInputContent.trim().split('\n');

//　最初の行の数値を獲得
const numericalInput = Number.parseInt(processedInputLines[0], 10);

let currentFactorialResult = 1;

const modulusBase = 10;
const modulusExponent = 9;
const modulusAddition = 7;
const modulusValue = Math.pow(modulusBase, modulusExponent) + modulusAddition;

const performModularMultiplication = (accumulator, factor, mod) => {
    return (accumulator * factor) % mod;
};

for (let iterationCounter = 1; iterationCounter <= numericalInput; iterationCounter++) {
    currentFactorialResult = performModularMultiplication(currentFactorialResult, iterationCounter, modulusValue);
}

console.log(currentFactorialResult);
