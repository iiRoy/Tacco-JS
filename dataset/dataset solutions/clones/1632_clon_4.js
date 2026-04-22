const fileSystemModule = require('fs');

const entireStandardInput = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const inputLines = entireStandardInput.trim().split('\n');
const segmentLength = parseInt(inputLines[0], 10);
const characterString = inputLines[1];

const characterArray = Array.from(characterString.substring(0, segmentLength));

let redCharacterCount = 0;
for (let idx = 0; idx < characterArray.length; idx++) {
    if (characterArray[idx] === 'R') {
        redCharacterCount++;
    }
}

let swapOperations = 0;
for (let pos = 0; pos < redCharacterCount; pos++) {
    if (characterArray[pos] === 'W') {
        swapOperations++;
    }
}

process.stdout.write(swapOperations.toString() + '\n');