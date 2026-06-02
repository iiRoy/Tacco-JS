function calculateAndDisplaySum(rawInputString) {
  const parsedNumber = Number(rawInputString);

  const computeSeriesSum = (value) => {
    const valueSquared = value * value;
    const valueCubed = valueSquared * value;
    const currentSum = value + valueSquared + valueCubed;
    return currentSum;
  };

  const finalComputedValue = computeSeriesSum(parsedNumber);

  console.log(finalComputedValue);
}

const standardInputFilePath = '/dev/stdin';
const fileSystemUtility = require('fs');
const inputContent = fileSystemUtility.readFileSync(standardInputFilePath, 'utf8');

calculateAndDisplaySum(inputContent);
