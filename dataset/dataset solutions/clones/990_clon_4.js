const fileSystem = require('node:fs');

const sourceDataBuffer = fileSystem.readFileSync('/dev/stdin');
const rawTextContent = String(sourceDataBuffer).trim();

const regexForNumbers = /-?\d+/g;
let matchResult;
const collectedNumbers = [];

while ((matchResult = regexForNumbers.exec(rawTextContent)) !== null) {
    collectedNumbers.push(Number(matchResult[0]));
}

const entityOne = collectedNumbers[0];
const entityTwo = collectedNumbers[1];

function determineMaximumDivisor(valueOne, valueTwo) {
    let currentA = valueOne;
    let currentB = valueTwo;

    while (currentB !== 0) {
        let temporaryStorage = currentB;
        currentB = currentA % currentB;
        currentA = temporaryStorage;
    }
    return currentA;
}

const finalOutcome = determineMaximumDivisor(entityOne, entityTwo);

process.stdout.write(String(finalOutcome) + '\n');