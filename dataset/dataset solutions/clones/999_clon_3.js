process.stdin.resume();
process.stdin.setEncoding('utf8');

const determineMaximum = (valueOne, valueTwo) => {
    return valueOne > valueTwo ? valueOne : valueTwo;
};

const rawInputString = require('fs').readFileSync('/dev/stdin', 'utf8');

const processedInputString = rawInputString.trim();
const inputLinesArray = processedInputString.split('\n');
const numericDataArray = inputLinesArray.map(Number);

const firstLineValue = numericDataArray[0];
const numericValues = numericDataArray.slice(1);

let maximumDifference = 0;

const totalNumericElements = numericValues.length;

for (let outerIndex = 0; outerIndex < firstLineValue - 1; outerIndex++) {
    const currentOuterElement = numericValues[outerIndex];

    for (let innerIndex = 0; innerIndex < totalNumericElements; innerIndex++) {
        if (outerIndex === innerIndex) {
            continue;
        }

        const currentInnerElement = numericValues[innerIndex];
        const calculatedDifference = currentOuterElement - currentInnerElement;
        
        maximumDifference = determineMaximum(maximumDifference, calculatedDifference);
    }
}

console.log(maximumDifference);
