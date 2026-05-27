"use strict";
process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputLines = [];
var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputReader.on('line', (lineContent) => {
  inputLines.push(lineContent);
});

inputReader.on('close', () => {
    let currentInputIndex = 0;
    while (currentInputIndex < inputLines.length) {
        const currentInputSegment = inputLines[currentInputIndex].trim();
        if (currentInputSegment === "-") {
            break;
        }

        const initialCharacterArray = currentInputSegment.split('');
        currentInputIndex++;

        const numOperations = Number(inputLines[currentInputIndex]);
        currentInputIndex++;

        const rotationAmounts = [];
        for (let k = 0; k < numOperations; k++) {
            rotationAmounts.push(Number(inputLines[currentInputIndex]));
            currentInputIndex++;
        }
        console.log(performCyclicShift(initialCharacterArray, rotationAmounts).join(''));
    }
});

function performCyclicShift(initialCharacterArray, rotationAmounts)
{
    const sequenceLength = initialCharacterArray.length;
    
    const totalShiftMagnitude = rotationAmounts.reduce((accumulator, currentShift) => {
        return accumulator + currentShift;
    }, 0);

    const effectiveShift = totalShiftMagnitude % sequenceLength;

    const shiftedPart = initialCharacterArray.slice(effectiveShift);
    const remainingPart = initialCharacterArray.slice(0, effectiveShift);

    return shiftedPart.concat(remainingPart);
}
