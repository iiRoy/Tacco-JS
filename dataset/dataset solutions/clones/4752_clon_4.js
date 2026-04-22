const fileSystemModule = require('fs');
const sourceText = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const textLines = sourceText.split(/\r?\n/).filter(line => line.trim() !== '');
textLines.shift(); // Discard the first line (count 'n')

const numberPairs = [];
for (let i = 0; i < textLines.length; ++i) {
    const parts = textLines[i].split(' ').map(val => parseInt(val, 10));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        numberPairs.push(parts);
    }
}

let runningTotalOffset = 0;

// Process the pairs from the last one to the first one
for (let j = numberPairs.length - 1; j >= 0; --j) {
    const currentPair = numberPairs[j];
    const initialValue = currentPair[0];
    const divisorValue = currentPair[1];

    // Calculate the value that needs to be adjusted to be a multiple of divisorValue
    const effectiveSum = initialValue + runningTotalOffset;

    // Determine the remainder when effectiveSum is divided by divisorValue
    const currentRemainder = effectiveSum % divisorValue;

    // Calculate the amount to add to runningTotalOffset to make (initialValue + runningTotalOffset)
    // a multiple of divisorValue. If currentRemainder is 0, this will be 0.
    const requiredIncrement = (divisorValue - currentRemainder) % divisorValue;
    
    runningTotalOffset += requiredIncrement;
}

console.log(runningTotalOffset);