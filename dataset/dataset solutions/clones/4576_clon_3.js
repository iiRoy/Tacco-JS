function processInputData(rawData) {
    const stringParts = rawData.split(' ');
    const numericValues = stringParts.map(numStr => parseInt(numStr, 10));

    const [firstVal, secondVal, targetVal] = numericValues;

    const checkRangeInclusion = (valueToCheck, lowerBound, upperBound) => {
        const isGreaterThanOrEqualToLower = valueToCheck >= lowerBound;
        const isLessThanOrEqualToUpper = valueToCheck <= upperBound;
        return isGreaterThanOrEqualToLower && isLessThanOrEqualToUpper;
    };

    if (checkRangeInclusion(targetVal, firstVal, secondVal)) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
processInputData(fileContent);
