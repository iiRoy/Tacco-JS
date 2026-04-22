const fileSystemInterface = require('node:fs');

const extractNumericalOperands = () => {
    const rawDataBuffer = fileSystemInterface.readFileSync('/dev/stdin');
    const textContent = rawDataBuffer.toString('utf8');
    const trimmedContent = textContent.trim();
    const stringFragments = trimmedContent.split(/\s+/);
    return stringFragments.map(str => parseInt(str, 10));
};

const numericParameters = extractNumericalOperands();

const primaryValue = numericParameters[0];
const secondaryValue = numericParameters[1];

const primaryParityBit = primaryValue & 1;
const secondaryParityBit = secondaryValue & 1;

const parityMismatchIndicator = primaryParityBit ^ secondaryParityBit;

const responseCatalogue = ['Yes', 'No'];

console.log(responseCatalogue[parityMismatchIndicator]);