"use strict";
process.stdin.resume();
process.stdin.setEncoding('utf8');

let receivedInputLines = [];
const lineProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

lineProcessor.on('line', (currentInputLine) => {
  receivedInputLines.push(currentInputLine);
});

lineProcessor.on('close', () => {
    const processInputBlock = (inputDataQueue) => {
        let currentDataLine = inputDataQueue.shift().trim();
        if (currentDataLine === "-") {
            return false;
        }

        const inputChars = currentDataLine.split('');
        const operationCount = Number(inputDataQueue.shift());

        const shiftOperations = Array.from({ length: operationCount }, () => {
            return Number(inputDataQueue.shift());
        });

        const finalSequence = applyCyclicShifts(inputChars, shiftOperations);
        console.log(finalSequence.join(''));
        return true;
    };

    while (true) {
        if (!processInputBlock(receivedInputLines)) {
            break;
        }
    }
});

function applyCyclicShifts(charSequence, shiftValues)
{
    const sequenceLength = charSequence.length;
    let currentSequenceState = [...charSequence];

    while (shiftValues.length > 0) {
        const currentShift = shiftValues.shift();

        const headSegment = currentSequenceState.slice(0, currentShift);
        const tailSegment = currentSequenceState.slice(currentShift, sequenceLength);

        currentSequenceState = tailSegment.concat(headSegment);
    }

    return currentSequenceState;
}
