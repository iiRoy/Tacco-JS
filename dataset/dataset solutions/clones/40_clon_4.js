const streamHandler = require('readline');

const accumulatedLines = [];

const lineInterpreter = streamHandler.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

lineInterpreter.on('line', (dataLine) => {
    accumulatedLines.push(parseInt(dataLine.trim(), 10));
});

lineInterpreter.on('close', () => {
    processAllEntries(accumulatedLines);
});

function checkIfPrime(numVal) {
    if (numVal < 2) return false;
    if (numVal === 2) return true;
    if (numVal % 2 === 0) return false;
    const boundary = Math.sqrt(numVal);
    for (let currentDivisor = 3; currentDivisor <= boundary; currentDivisor += 2) {
        if (numVal % currentDivisor === 0) {
            return false;
        }
    }
    return true;
}

function determinePrimeCount(inputVal) {
    if (inputVal === 1) {
        return 0;
    }
    if (inputVal === 2) {
        return 1;
    }
    
    let primeTally = 1;
    const upperLimit = Math.sqrt(inputVal);

    for (let iter = 3; iter < upperLimit; iter++) {
        if (checkIfPrime(iter)) {
            primeTally++;
        }
    }
    return primeTally;
}

function processAllEntries(numericEntries) {
    numericEntries.forEach(entry => {
        console.log(determinePrimeCount(entry));
    });
}