const fileSystemModule = require('fs');

const computeAdjustedValue = (baseValue, adjustmentRate) =>
  Math.floor(baseValue * (100 + adjustmentRate) / 100);

function* findQualifyingPairs(targetSum, firstRate) {
  const adjustFirst = (val) => computeAdjustedValue(val, firstRate);

  for (let firstItem = 1; firstItem < targetSum; firstItem++) {
    const adjustedFirstItem = adjustFirst(firstItem);

    for (let secondItem = 1; secondItem < targetSum; secondItem++) {
      const adjustedSecondItem = adjustFirst(secondItem);
      const currentTotalAdjusted = adjustedFirstItem + adjustedSecondItem;

      if (currentTotalAdjusted > targetSum) {
        break;
      }

      if (currentTotalAdjusted === targetSum) {
        yield { itemA: firstItem, itemB: secondItem };
        break;
      }
    }
  }
}

const processParameterSet = (params) => {
  const [paramX, paramY, paramS] = params;

  if (paramX === 0 && paramY === 0 && paramS === 0) {
    return null;
  }

  let highestValue = 0;

  for (const pair of findQualifyingPairs(paramS, paramX)) {
    const valueForY_A = computeAdjustedValue(pair.itemA, paramY);
    const valueForY_B = computeAdjustedValue(pair.itemB, paramY);
    const totalValueForY = valueForY_A + valueForY_B;

    highestValue = Math.max(highestValue, totalValueForY);
  }

  return highestValue;
};

const rawData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const dataLines = rawData.trim().split("\n");

const finalResults = dataLines.reduce((accumulator, currentLine) => {
  const numericParams = currentLine.split(" ").map(Number);
  const resultForSet = processParameterSet(numericParams);

  if (resultForSet !== null) {
    accumulator.push(resultForSet);
  }
  return accumulator;
}, []);

finalResults.forEach(outputValue => console.log(outputValue));
