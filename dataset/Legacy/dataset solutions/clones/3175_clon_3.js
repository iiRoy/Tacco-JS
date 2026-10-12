function calculateBaseCost(target, current) {
  return Math.abs(target[0] - current[0]) +
         Math.abs(target[1] - current[1]) +
         Math.abs(target[2] - current[2]) - 30;
}

function updateLengthArray(original, index, value) {
  const newArr = [...original];
  newArr[index] += value;
  return newArr;
}

const IMPOSSIBLE_COST = Math.pow(1000 * 1000, 3);

function calculateMagicPoints(currentDepth, totalItems, targetLengths, currentLengths, itemLengths) {
  if (currentDepth === totalItems) {
    if (Math.min(...currentLengths) > 0) {
      return calculateBaseCost(targetLengths, currentLengths);
    }
    return IMPOSSIBLE_COST;
  }

  const COMBINE_COST_PER_ITEM = 10;

  const optionSkip = calculateMagicPoints(currentDepth + 1, totalItems, targetLengths, currentLengths, itemLengths);

  const currentItemLength = itemLengths[currentDepth];

  const optionA = calculateMagicPoints(
    currentDepth + 1,
    totalItems,
    targetLengths,
    updateLengthArray(currentLengths, 0, currentItemLength),
    itemLengths
  ) + COMBINE_COST_PER_ITEM;

  const optionB = calculateMagicPoints(
    currentDepth + 1,
    totalItems,
    targetLengths,
    updateLengthArray(currentLengths, 1, currentItemLength),
    itemLengths
  ) + COMBINE_COST_PER_ITEM;

  const optionC = calculateMagicPoints(
    currentDepth + 1,
    totalItems,
    targetLengths,
    updateLengthArray(currentLengths, 2, currentItemLength),
    itemLengths
  ) + COMBINE_COST_PER_ITEM;

  return Math.min(optionSkip, optionA, optionB, optionC);
}

function processInput(input) {
  const inputLines = input.split('\n');

  const [totalItems, targetA, targetB, targetC] = inputLines[0].split(' ').map(Number);

  const availableLengths = inputLines.slice(1).map(Number);

  const finalResult = calculateMagicPoints(0, totalItems, [targetA, targetB, targetC], [0, 0, 0], availableLengths);

  console.log(finalResult);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
