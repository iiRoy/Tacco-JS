const processInputNumbersAndCalc = (fullStringInput) => {
    const spacePosition = fullStringInput.indexOf(' ');
    const initialPart = fullStringInput.substring(0, spacePosition);
    const subsequentPart = fullStringInput.substring(spacePosition + 1);

    const convertToNumeric = (strVal) => {
        let runningSum = 0;
        let powerOfTen = 1;
        for (let i = strVal.length - 1; i >= 0; --i) {
            const digit = strVal.charCodeAt(i) - '0'.charCodeAt(0);
            runningSum += digit * powerOfTen;
            powerOfTen *= 10;
        }
        return runningSum;
    };

    const firstNumValue = convertToNumeric(initialPart);
    const secondNumValue = convertToNumeric(subsequentPart);

    const calculatedArea = (firstNumValue / 2) * secondNumValue;

    return calculatedArea;
};

const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
const computedFinalValue = processInputNumbersAndCalc(sourceData);

process.stdout.write(computedFinalValue.toString() + '\n');