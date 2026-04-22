const fileSystemInterface = require('node:fs');

const rawInputBuffer = fileSystemInterface.readFileSync(0);
const stringRepresentation = rawInputBuffer.toString('utf8');
const normalizedString = stringRepresentation.trim();
const stringParts = normalizedString.split(/\s+/);

const numericalArguments = stringParts.reduce((accumulator, currentString) => {
    accumulator.push(parseFloat(currentString));
    return accumulator;
}, []);

const divisorCandidate = numericalArguments[0];
const maximumLimit = numericalArguments[1];

function determineFactorialSteps(currentBase, ceilingValue) {
    if (ceilingValue < currentBase) {
        return 0;
    } else {
        const ratioOfValues = ceilingValue / currentBase;
        const logOfRatio = Math.log2(ratioOfValues);
        const integerLogPart = Math.floor(logOfRatio);
        return integerLogPart + 1;
    }
}

const finalResult = determineFactorialSteps(divisorCandidate, maximumLimit);

process.stdout.write(finalResult.toString() + '\n');