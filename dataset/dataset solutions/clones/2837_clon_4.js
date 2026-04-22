const fls = require('node:fs');

const bufferSize = 1024;
const inputBuffer = Buffer.alloc(bufferSize);
const bytesRead = fls.readSync(0, inputBuffer, 0, bufferSize, 0);

const inStreamContent = inputBuffer.toString('utf8', 0, bytesRead).trim();

let separatorIndex = -1;
for (let pos = 0; pos < inStreamContent.length; ++pos) {
    if (inStreamContent[pos] === ' ') {
        separatorIndex = pos;
        break;
    }
}

let firstValue = Number.parseInt(inStreamContent.substring(0, separatorIndex), 10);
let secondValue = Number.parseInt(inStreamContent.substring(separatorIndex + 1), 10);

let calculatedDifference = firstValue - secondValue;
let conditionMultiplier = +(secondValue !== 1);

let finalOutcome = calculatedDifference * conditionMultiplier;

process.stdout.write(finalOutcome.toString() + '\n');