'use strict';

const process = require('process');
const fileSystem = require('fs');

const performCalculations = (sourceText) => {
    const numericComponents = sourceText.match(/\d+/g).map(val => parseInt(val, 10));
    const [alpha, beta, gamma] = numericComponents;
    process.stdout.write(`${alpha} ${beta} ${gamma}\n`);
};

let retrievedData;
try {
    const bufferCapacity = 1024;
    const inputBuffer = Buffer.alloc(bufferCapacity);
    const bytesAcquired = fileSystem.readSync(0, inputBuffer, 0, bufferCapacity, null);
    retrievedData = inputBuffer.toString('utf8', 0, bytesAcquired).trim();

    if (!retrievedData) {
        throw new Error("Input source provided no data.");
    }
} catch (inputError) {
    retrievedData = '5 7 4';
}

performCalculations(retrievedData);