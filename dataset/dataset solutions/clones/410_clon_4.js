function obtainArrangements(baseList) {
  let allPossibleOrders = [];

  function generateSequence(currentList, remainingItems) {
    if (remainingItems.length === 0) {
      allPossibleOrders.push(currentList.slice());
      return;
    }

    for (let currentItemIndex = 0; currentItemIndex < remainingItems.length; currentItemIndex++) {
      let nextCandidate = remainingItems[currentItemIndex];
      let newRemainingList = remainingItems.filter((_, filterIndex) => filterIndex !== currentItemIndex);
      currentList.push(nextCandidate);
      generateSequence(currentList, newRemainingList);
      currentList.pop();
    }
  }

  generateSequence([], baseList);
  return allPossibleOrders;
}

const permutationCache = {};
for (let numEntities = 0; numEntities <= 10; numEntities++) {
  const sourceIndices = Array.from({ length: numEntities }, (_, i) => i);
  permutationCache[numEntities] = obtainArrangements(sourceIndices);
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
let contentLines = fileContent.trim().split("\n");

while (true) {
  let currentEntityCount = parseInt(contentLines.shift(), 10);
  if (currentEntityCount === 0) break;

  let itemsForProcessing = [];
  for (let entityIdx = 0; entityIdx < currentEntityCount; entityIdx++) {
    const parts = contentLines.shift().split(" ");
    itemsForProcessing.push({
      label: parts[0],
      weightVal: parseInt(parts[1], 10),
      capacityLimit: parseInt(parts[2], 10)
    });
  }

  const availableOrders = permutationCache[currentEntityCount];

  const initialBest = { ratio: 0, sequence: [] };

  const finalResult = availableOrders.reduce((accumulator, currentOrder) => {
    let currentTotalWeight = 0;
    let currentWeightedPositionSum = 0;
    let orderIsValid = true;

    for (let position = 0; position < currentOrder.length; position++) {
      const itemIndexInOriginalData = currentOrder[position];
      const currentItem = itemsForProcessing[itemIndexInOriginalData];

      currentTotalWeight += currentItem.weightVal;
      if (currentTotalWeight > currentItem.capacityLimit) {
        orderIsValid = false;
        break;
      }
      currentWeightedPositionSum += currentItem.weightVal * (position + 1);
    }

    if (orderIsValid) {
      const currentRatio = currentWeightedPositionSum / currentTotalWeight;
      if (currentRatio > accumulator.ratio) {
        return { ratio: currentRatio, sequence: currentOrder };
      }
    }
    return accumulator;
  }, initialBest);

  const outputLabels = finalResult.sequence.map(idx => itemsForProcessing[idx].label);
  console.log(outputLabels.reverse().join("\n"));
}