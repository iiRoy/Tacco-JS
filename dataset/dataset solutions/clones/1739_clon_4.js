const fileOps = require('fs');
const systemOps = require('process');

let collectedInput = '';
const chunkBuffer = Buffer.alloc(4096);
let currentReadBytes = 0;

try {
    while ((currentReadBytes = fileOps.readSync(systemOps.stdin.fd, chunkBuffer, 0, chunkBuffer.length, null)) !== 0) {
        collectedInput += chunkBuffer.toString('utf8', 0, currentReadBytes);
    }
} catch (errorReading) {
    collectedInput = '';
}

let hasCapitalLetter = false;
let characterPointer = 0;

while (characterPointer < collectedInput.length) {
    const characterCode = collectedInput.charCodeAt(characterPointer);
    if (characterCode >= 65 && characterCode <= 90) {
        hasCapitalLetter = true;
        break;
    }
    characterPointer++;
}

const responseOptions = {
    'true': 'A',
    'false': 'a'
};

systemOps.stdout.write(responseOptions[String(hasCapitalLetter)] + '\n');