const fileSystemUtility = require('fs');

const maximumValueAsString = fileSystemUtility.readFileSync('/dev/stdin', 'ascii').trim();
const limitInteger = Number(maximumValueAsString);

const discernDigitThree = (numericEntity) => {
    let absoluteValue = Math.abs(numericEntity);
    if (absoluteValue === 0) return false;
    while (absoluteValue > 0) {
        if (absoluteValue % 10 === 3) {
            return true;
        }
        absoluteValue = Math.floor(absoluteValue / 10);
    }
    return false;
};

const isDivisibleByThree = (numericEntity) => {
    return (numericEntity % 3 === 0);
};

const processRange = (ceiling) => {
    return Array.from({ length: ceiling }, (_, index) => index + 1)
                .filter(value => isDivisibleByThree(value) || discernDigitThree(value));
};

const processedResults = processRange(limitInteger);

const finalOutputString = processedResults.reduce((accumulator, currentElement, currentIndex) => {
    if (currentIndex === 0) {
        return String(currentElement);
    } else {
        return accumulator + ' ' + String(currentElement);
    }
}, '');

process.stdout.write(finalOutputString + '\n');