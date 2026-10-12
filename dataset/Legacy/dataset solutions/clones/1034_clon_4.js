const inputPath = '/dev/stdin';
const lineSeparator = '\n';

const fileContent = require('fs').readFileSync(inputPath, 'utf-8');
const inputLines = fileContent.split(lineSeparator);

const tallyIntersections = (sourceValues, targetValues) => {
    const valueSet = new Set(sourceValues);
    let intersectionCounter = 0;
    for (const val of targetValues) {
        if (valueSet.has(val)) {
            intersectionCounter++;
        }
    }
    return intersectionCounter;
};

const firstNumericSequence = inputLines[1].split(' ').map(Number);
const secondNumericSequence = inputLines[3].split(' ').reduce((accumulator, currentString) => {
    accumulator.push(Number(currentString));
    return accumulator;
}, []);

console.log(tallyIntersections(firstNumericSequence, secondNumericSequence));
