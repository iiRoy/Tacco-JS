"use strict"

const inputStringContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');

const inputLines = inputStringContent.split('\n');

const initialSequence = inputLines[0];
const repeatFactor = parseInt(inputLines[1], 10);

let charArray = initialSequence.split('');

let finalCount = 0;

let isHomogeneous = true;
let currentCharacter = '';

for (let index = 1; index <= charArray.length; index++) {
    if (currentCharacter === charArray[index]) {

    } else if (currentCharacter) {
        isHomogeneous = false;
        break;
    } else {
        currentCharacter = charArray[index];
    }
}

if (!isHomogeneous) {
    for (let index = 1; index <= charArray.length; index++) {
        let charA = charArray[index - 1];
        let charB = charArray[index];
        if (charA === charB) {
            charArray[index] = '^';
            finalCount++;
        }
    }
}

finalCount *= repeatFactor;

if (charArray[0] === charArray[charArray.length - 1] && isHomogeneous) {
    const totalLengthRepeated = charArray.length * repeatFactor;
    finalCount += (totalLengthRepeated % 2 === 0) ? (totalLengthRepeated / 2) : ((totalLengthRepeated - 1) / 2);
} else if (charArray[0] === charArray[charArray.length - 1]) {
    finalCount += repeatFactor - 1;
}

console.log(finalCount);