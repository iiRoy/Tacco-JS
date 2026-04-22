const { readSync: obtainData } = require('node:fs');

const dataBuffer = Buffer.alloc(64);
const bytesReadCount = obtainData(0, dataBuffer, 0, dataBuffer.length, 0);
const incomingLine = dataBuffer.toString('utf8', 0, bytesReadCount).trim();

const numericElements = incomingLine.split(/\s+/).map(Number);

const valueB = numericElements[1];
const valueC = numericElements[2];

const combinedLastTwo = valueB * 10 + valueC;

const determinationMap = new Map([
    [true, 'YES'],
    [false, 'NO']
]);

process.stdout.write(determinationMap.get(combinedLastTwo % 4 === 0));