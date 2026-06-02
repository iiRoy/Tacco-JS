'use strict';

const fsModule = require('fs');
const INPUT_FILE_PATH = '/dev/stdin';
const MODULO_VALUE = 1e9 + 7;

const fileContentBuffer = fsModule.readFileSync(INPUT_FILE_PATH, 'utf8');
const trimmedContent = fileContentBuffer.trim();
const rawData = trimmedContent.split('\n');

const limitValString = rawData[0];
const limitVal = parseInt(limitValString, 10);

let productAccumulator = 1;
let currentFactor = 1;

while (currentFactor <= limitVal) {
    let tempProduct = productAccumulator * currentFactor;
    productAccumulator = tempProduct % MODULO_VALUE;
    currentFactor++;
}

console.log(productAccumulator);
