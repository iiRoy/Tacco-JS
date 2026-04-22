const checkPrimality = (val) => {
    if (val <= 1) return false;
    if (val === 2) return true;
    if (val % 2 === 0) return false;

    const limit = Math.floor(Math.sqrt(val));
    for (let currentDivisor = 3; currentDivisor <= limit; currentDivisor += 2) {
        if (val % currentDivisor === 0) {
            return false;
        }
    }
    return true;
};

const inputReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const collectedNumbers = [];
let firstLineSkipped = false;

inputReader.on('line', (currentLine) => {
    if (!firstLineSkipped) {
        firstLineSkipped = true;
        return;
    }
    const parsedNumber = parseInt(currentLine.trim(), 10);
    if (!isNaN(parsedNumber)) {
        collectedNumbers.push(parsedNumber);
    }
});

inputReader.on('close', () => {
    let primeTally = 0;
    for (const entry of collectedNumbers) {
        if (checkPrimality(entry)) {
            primeTally++;
        }
    }
    console.log(primeTally);
});