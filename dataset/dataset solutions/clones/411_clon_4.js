function generatePermutationsFunctional(elements) {
  if (elements.length === 0) {
    return [
      []
    ];
  }
  return elements.flatMap((firstElement, index) => {
    const remainingElements = elements.filter((_, i) => i !== index);
    return generatePermutationsFunctional(remainingElements).map(
      (subPermutation) => [firstElement, ...subPermutation]
    );
  });
}

var rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = rawInput.trim().split("\n");

while (true) {
  var problemCount = inputLines.shift() - 0;
  if (problemCount === 0) break;

  var operationSet = Array.from({
    length: problemCount
  }, () => {
    var parts = inputLines.shift().split(" ");
    return {
      description: parts[0],
      amount: +parts[1],
      threshold: +parts[2]
    };
  });

  var sequenceIndices = Array.from({
    length: problemCount
  }, (_, i) => i);
  var allPossibleSequences = generatePermutationsFunctional(sequenceIndices);

  var initialAccumulator = {
    highestScore: -1,
    chosenSequence: []
  };

  var finalResult = allPossibleSequences.reduce((acc, currentSequence) => {
    var evaluation = currentSequence.reduce((itemAcc, itemIndex, itemPos) => {
      if (!itemAcc.feasible) {
        return itemAcc;
      }
      var op = operationSet[itemIndex];
      var nextCumulativeAmount = itemAcc.currentAmount + op.amount;
      var currentItemFeasible = nextCumulativeAmount <= op.threshold;

      return {
        currentAmount: nextCumulativeAmount,
        weightedSum: itemAcc.weightedSum + op.amount * (itemPos + 1),
        feasible: itemAcc.feasible && currentItemFeasible
      };
    }, {
      currentAmount: 0,
      weightedSum: 0,
      feasible: true
    });

    if (evaluation.feasible) {
      var currentScore = evaluation.weightedSum / evaluation.currentAmount;
      if (currentScore > acc.highestScore) {
        return {
          highestScore: currentScore,
          chosenSequence: currentSequence
        };
      }
    }
    return acc;
  }, initialAccumulator);

  var displayOrder = finalResult.chosenSequence
    .map(idx => operationSet[idx].description)
    .reverse()
    .join("\n");

  console.log(displayOrder);
}