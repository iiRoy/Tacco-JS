const fileSystemInterface = require('fs');

const dataStream = fileSystemInterface.readFileSync('/dev/stdin', 'utf8');

const extractNumericValue = (sourceString) => {
    const trimmedAndSplit = sourceString.trim().split(/\s+/);
    return Number(trimmedAndSplit[0]);
};

const computeTransformedValue = (originalInteger) => {
    const leastSignificantBit = originalInteger & 1;
    if (leastSignificantBit === 0) { // Even number
        return originalInteger;
    } else { // Odd number
        return originalInteger << 1; // Equivalent to originalInteger * 2
    }
};

const acquiredNumber = extractNumericValue(dataStream);
const finalCalculation = computeTransformedValue(acquiredNumber);

console.log(finalCalculation);