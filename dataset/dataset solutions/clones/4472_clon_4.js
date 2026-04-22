const sourceOfData = require('fs').readFileSync('/dev/stdin', 'utf8');

const calculateSumOfFirstTwoIntegers = (textualData) => {
    const extractedNumericStrings = textualData.match(/-?\d+/g);
    const firstNum = Number(extractedNumericStrings[0]);
    const secondNum = Number(extractedNumericStrings[1]);
    return firstNum + secondNum;
};

const determineDivisibilityOutcome = (totalValue) => {
    const outcomeMapping = ['Possible', 'Impossible', 'Impossible'];
    const remainderValue = totalValue % 3;
    const adjustedRemainder = (remainderValue % 3 + 3) % 3;
    return outcomeMapping[adjustedRemainder];
};

const finalVerdict = determineDivisibilityOutcome(calculateSumOfFirstTwoIntegers(sourceOfData));

console.log(finalVerdict);