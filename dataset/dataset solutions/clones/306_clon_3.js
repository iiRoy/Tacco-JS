const fileSystemModule = require('fs');

const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const processedInputString = rawInputContent.trim();
const numericSegments = processedInputString.split(/\s/);

const primaryFactor = parseFloat(numericSegments[0]);
const secondaryFactor = parseFloat(numericSegments[1]);

const calculationDivisorA = 0.000003305785;
const calculationDivisorB = 1000000;

const productOfFactors = primaryFactor * secondaryFactor;
const intermediateQuotient = productOfFactors / calculationDivisorA;
const integerPart = Math.floor(intermediateQuotient);
const finalScaledValue = integerPart / calculationDivisorB;

console.log(finalScaledValue);
