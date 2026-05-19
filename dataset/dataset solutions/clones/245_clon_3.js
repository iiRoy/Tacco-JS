let rawData = require('fs').readFileSync('/dev/stdin', 'utf-8');
let parsedNumbersMatrix = (rawData.trim()).split('\n').map(str => str.split("").map(n => Number(n)));

function computeNextRow(currentRow) {
    let intermediateSums = [];
    const loopLimit = currentRow.length - 1;
    for (let i = 0; i < loopLimit; i++) {
        intermediateSums.push(currentRow[i] + currentRow[i+1]);
    }
    const applyModuloTen = (sumVal) => sumVal % 10;
    return intermediateSums.map(applyModuloTen);
}

function reduceToSingleDigit (currentSequence) {
    if (currentSequence.length === 1) {
        return currentSequence[0];
    } else {
        const nextSequence = computeNextRow(currentSequence);
        return reduceToSingleDigit(nextSequence);
    }
}

const inputFilePath = '/dev/stdin';
const fileContent = require('fs').readFileSync(inputFilePath, 'utf-8');
const trimmedContent = fileContent.trim();
const lineStrings = trimmedContent.split('\n');

const parseLineToNumbers = (lineStr) => lineStr.split("").map(char => Number(char));

const initialNumberSequences = lineStrings.map(parseLineToNumbers);

let finalReducedDigits = initialNumberSequences.map(sequenceToProcess => reduceToSingleDigit(sequenceToProcess));
console.log(finalReducedDigits);
