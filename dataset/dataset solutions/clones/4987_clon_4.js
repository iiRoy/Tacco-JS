const { readFileSync: obtainData } = require('node:fs');
const sourceContent = obtainData('/dev/stdin', 'utf8');

const relevantLine = sourceContent.split(/\r?\n/).find(entry => entry.trim().length > 0) || '';

const numeralPattern = /-?\d+/g;
const extractedStrings = [...relevantLine.matchAll(numeralPattern)].map(matchItem => matchItem[0]);

const primaryVal = BigInt(extractedStrings[0]);
const secondaryVal = BigInt(extractedStrings[1]);
const tertiaryVal = BigInt(extractedStrings[2]);

const anyValueEven = (primaryVal & 1n) === 0n ||
                     (secondaryVal & 1n) === 0n ||
                     (tertiaryVal & 1n) === 0n;

let outcomeValue;

if (anyValueEven) {
    outcomeValue = 0n;
} else {
    const productOneTwo = primaryVal * secondaryVal;
    const productTwoThree = secondaryVal * tertiaryVal;
    const productOneThree = primaryVal * tertiaryVal;

    const ascertainSmallest = (firstOperand, secondOperand, thirdOperand) => {
        const intermediateSmallest = (firstOperand < secondOperand) ? firstOperand : secondOperand;
        return (intermediateSmallest < thirdOperand) ? intermediateSmallest : thirdOperand;
    };

    outcomeValue = ascertainSmallest(productOneTwo, productTwoThree, productOneThree);
}

process.stdout.write(outcomeValue.toString() + '\n');