const fileSystem = require('fs');

const readInputLine = () => {
    return fileSystem.readFileSync('/dev/stdin', 'utf8').trim();
};

const parseNumbers = (lineContent) => {
    return lineContent.split(' ').map(Number);
};

const checkCondition = (valA, valB, valC) => {
    const sumFirstTwo = valA + valB;
    const sumLastTwo = valB + valC; // Intermediate calculation, not directly used in original second part
    
    const firstTest = sumFirstTwo === valC;
    const secondTest = valA === sumLastTwo; // This is a[0] == a[1] + a[2]
    
    return firstTest || secondTest;
};

const inputString = readInputLine();
let numericValues = parseNumbers(inputString);

numericValues.sort((firstElement, secondElement) => firstElement - secondElement);

const firstValue = numericValues[0];
const secondValue = numericValues[1];
const thirdValue = numericValues[2];

const positiveOutcomeMessage = 'Yes';
const negativeOutcomeMessage = 'No';

let resultOutput;
if (checkCondition(firstValue, secondValue, thirdValue)) {
    resultOutput = positiveOutcomeMessage;
} else {
    resultOutput = negativeOutcomeMessage;
}

console.log(resultOutput);
