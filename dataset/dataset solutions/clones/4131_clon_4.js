const evaluateWeightBalance = (rawData) => {
  const numericValues = rawData.trim().match(/-?\d+/g).map(Number);
  const [val1, val2, val3, val4] = numericValues;

  const firstSum = val1 + val2;
  const secondSum = val3 + val4;

  const comparisonResult = firstSum - secondSum;

  const outcomeMap = {
    '-1': "Right",
    '0': "Balanced",
    '1': "Left"
  };

  return outcomeMap[Math.sign(comparisonResult)];
};

const acquiredData = require('fs').readFileSync('/dev/stdin', 'utf8');
const finalOutput = evaluateWeightBalance(acquiredData);
console.log(finalOutput);