const parseNumericString = (strValue) => parseInt(strValue, 10);

function computeDigitSum(numberToEvaluate) {
    let currentDigitSum = 0;
    let tempNumber = numberToEvaluate;
    while (tempNumber > 0) {
        currentDigitSum += tempNumber % 10;
        tempNumber = Math.floor(tempNumber / 10);
    }
    return currentDigitSum;
}

function processInput(rawInputString) {
    const inputParts = rawInputString.split(' ');

    const sequenceLength = parseNumericString(inputParts[0]);
    const lowerBoundA = parseNumericString(inputParts[1]);
    const upperBoundB = parseNumericString(inputParts[2]);

    const numberSequence = Array.from({ length: sequenceLength }, (_, index) => index + 1);

    const matchingIndices = [];

    numberSequence.forEach((currentValue, currentIndex) => {
        const digitSumOfCurrentValue = computeDigitSum(currentValue);

        const isWithinRange = (digitSumOfCurrentValue >= lowerBoundA && digitSumOfCurrentValue <= upperBoundB);

        if (isWithinRange) {
            matchingIndices.push(currentIndex);
        }
    });

    let finalSum = 0;

    finalSum = matchingIndices.reduce((accumulator, index) => {
        const numberToAdd = numberSequence[index];
        return accumulator + numberToAdd;
    }, 0);

    console.log(finalSum);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
