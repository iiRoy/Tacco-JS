const fileSystemInterface = require('fs');

const rawInputContent = fileSystemInterface.readFileSync('/dev/stdin', 'utf8');

const processedTokens = rawInputContent.trim().match(/\S+/g);

const [firstValue, secondValue] = processedTokens.slice(0, 2).map(Number);

const initialDivisor = 0.000003305785;
const finalScalingFactor = 1000000;

const productResult = firstValue * secondValue;

const preFloorCalculation = productResult / initialDivisor;

const integerPart = Math.round(preFloorCalculation - 0.5);

const finalOutput = integerPart / finalScalingFactor;

console.log(finalOutput);
