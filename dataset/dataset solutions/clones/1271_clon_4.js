const fileSystem = require('fs');
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const upperBoundary = Number.parseInt(rawInputContent.trim(), 10);

const numberSequence = Array.from({ length: Math.max(0, upperBoundary - 2) }, (_, index) => index + 3);

const selectedValues = numberSequence.filter(currentValue => {
    const isMultipleOfThree = currentValue % 3 === 0;
    const stringRepresentation = String(currentValue);
    const containsDigitThree = stringRepresentation.includes('3');
    return isMultipleOfThree || containsDigitThree;
});

const finalOutputString = selectedValues.join(' ');

console.log(finalOutputString);
