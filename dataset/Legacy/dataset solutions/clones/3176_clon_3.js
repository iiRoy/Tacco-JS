const MERGE_COST_PER_ITEM = 10;

const getAbsoluteDifference = (val1, val2) => Math.abs(val1 - val2);

function calculateMinPenalty(currentDepth, totalItems, targetLengths, currentLengths, itemLengths) {
  if (currentDepth === totalItems) {
    const diffA = getAbsoluteDifference(targetLengths[0], currentLengths[0]);
    const diffB = getAbsoluteDifference(targetLengths[1], currentLengths[1]);
    const diffC = getAbsoluteDifference(targetLengths[2], currentLengths[2]);
    return diffA + diffB + diffC;
  }

  const currentItemLength = itemLengths[currentDepth];

  const penaltyNoUse = calculateMinPenalty(currentDepth + 1, totalItems, targetLengths, currentLengths, itemLengths);

  const nextLengthsA = [currentLengths[0] + currentItemLength, currentLengths[1], currentLengths[2]];
  const penaltyUseA = calculateMinPenalty(currentDepth + 1, totalItems, targetLengths, nextLengthsA, itemLengths) + MERGE_COST_PER_ITEM;

  const nextLengthsB = [currentLengths[0], currentLengths[1] + currentItemLength, currentLengths[2]];
  const penaltyUseB = calculateMinPenalty(currentDepth + 1, totalItems, targetLengths, nextLengthsB, itemLengths) + MERGE_COST_PER_ITEM;

  const nextLengthsC = [currentLengths[0], currentLengths[1], currentLengths[2] + currentItemLength];
  const penaltyUseC = calculateMinPenalty(currentDepth + 1, totalItems, targetLengths, nextLengthsC, itemLengths) + MERGE_COST_PER_ITEM;

  const allPenalties = [penaltyNoUse, penaltyUseA, penaltyUseB, penaltyUseC];
  return Math.min(...allPenalties);
}

function parseInitialParameters(firstLine) {
  const parts = firstLine.split(' ').map(x => parseInt(x, 10));
  return {
    totalItems: parts[0],
    targetA: parts[1],
    targetB: parts[2],
    targetC: parts[3],
  };
}

function processInputAndCalculate(inputData) {
  const inputLines = inputData.split('\n');

  const { totalItems, targetA, targetB, targetC } = parseInitialParameters(inputLines[0]);

  const availableLengths = inputLines.slice(1).map(x => parseInt(x, 10)).filter(x => !isNaN(x));

  const initialCurrentLengths = [0, 0, 0];
  const initialTargetLengths = [targetA, targetB, targetC];

  const calculatedPenalty = calculateMinPenalty(
    0,
    totalItems,
    initialTargetLengths,
    initialCurrentLengths,
    availableLengths
  );

  const INITIAL_PENALTY_ADJUSTMENT = 30;
  console.log(calculatedPenalty - INITIAL_PENALTY_ADJUSTMENT);
}

processInputAndCalculate(require('fs').readFileSync('/dev/stdin', 'utf8'));
