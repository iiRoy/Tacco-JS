const fileSystemHandler = require("node:fs");

const [firstLine, secondLine] = fileSystemHandler.readFileSync("/dev/stdin", "utf8").trim().split('\n');
const numericalBoundary = Number(firstLine);
const dataElements = secondLine.split(' ').map(Number);

const elementFrequencies = dataElements.reduce((accumulator, currentElement) => {
    accumulator.set(currentElement, (accumulator.get(currentElement) || 0) + 1);
    return accumulator;
}, new Map());

const combinationsOfTwo = (count) => count > 1 ? count * (count - 1) / 2 : 0;

let cumulativePairSum = 0;
for (const frequency of elementFrequencies.values()) {
    cumulativePairSum += combinationsOfTwo(frequency);
}

const resultantValues = dataElements.map(originalElement => {
    const currentElementCount = elementFrequencies.get(originalElement);
    return cumulativePairSum - (currentElementCount - 1);
});

console.log(resultantValues.join('\n'));