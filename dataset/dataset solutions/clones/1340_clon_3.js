const fileSystem = require('fs');
const standardInputPath = '/dev/stdin';
const encodingType = 'utf8';

const rawInputContent = fileSystem.readFileSync(standardInputPath, encodingType).trim();

const parsedNumberValue = parseInt(rawInputContent);
const originalValue = parsedNumberValue;
let currentValue = parsedNumberValue;

const foundFactors = [];

let potentialDivisor = 2;
while (potentialDivisor * potentialDivisor <= currentValue) {
    if (currentValue % potentialDivisor === 0) {
        while (currentValue % potentialDivisor === 0) {
            foundFactors.push(potentialDivisor);
            currentValue /= potentialDivisor;
        }
    }
    potentialDivisor++;
}

if (currentValue > 1) {
    foundFactors.push(currentValue);
}

console.log(originalValue + ': ' + foundFactors.join(' '));
