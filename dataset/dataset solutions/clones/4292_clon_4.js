const interfaceReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let collectedLines = [];

interfaceReader.on('line', (currentLine) => {
    collectedLines.push(currentLine);
});

interfaceReader.on('close', () => {
    if (collectedLines.length === 0) {
        performCalculation(''); // Handle empty input stream
    } else {
        performCalculation(collectedLines[0]);
    }
});

function obtainPalindromeCost(sourceSequence, leftPtr, rightPtr, totalAdjustments) {
    if (leftPtr >= rightPtr) {
        return totalAdjustments;
    }

    const leftCode = sourceSequence.charCodeAt(leftPtr);
    const rightCode = sourceSequence.charCodeAt(rightPtr);
    const xCode = 120; // ASCII for 'x'

    if (leftCode === rightCode) {
        return obtainPalindromeCost(sourceSequence, leftPtr + 1, rightPtr - 1, totalAdjustments);
    } else {
        if (leftCode === xCode) {
            return obtainPalindromeCost(sourceSequence, leftPtr + 1, rightPtr, totalAdjustments + 1);
        } else if (rightCode === xCode) {
            return obtainPalindromeCost(sourceSequence, leftPtr, rightPtr - 1, totalAdjustments + 1);
        } else {
            return -1; // Impossible to form a palindrome
        }
    }
}

function performCalculation(inputString) {
    const finalResult = obtainPalindromeCost(inputString, 0, inputString.length - 1, 0);
    console.log(finalResult);
}