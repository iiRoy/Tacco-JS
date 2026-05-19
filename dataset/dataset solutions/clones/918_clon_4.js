const fsModule = require('fs');
const rawData = fsModule.readFileSync('/dev/stdin', 'utf8');
const numericValues = rawData.trim().split(' ').map(val => Number(val));

const [firstOperand, secondOperand, thirdOperand, fourthOperand] = numericValues;

const productResult = firstOperand * secondOperand;
const sumResult = thirdOperand + fourthOperand;

const isProductEven = (productResult & 1) === 0;
const isSumEven = (sumResult & 1) === 0;

const determineOutcome = (prodEven, sumEven) => {
    return (prodEven || sumEven) ? "Yes" : "No";
};

console.log(determineOutcome(isProductEven, isSumEven));
