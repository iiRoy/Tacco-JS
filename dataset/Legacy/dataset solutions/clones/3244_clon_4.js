function processInputData(rawData) {
  const lineSegments = rawData.split('\n');
  const totalItemsCount = Number.parseInt(lineSegments[0], 10);

  const itemCollection = Array.from({ length: totalItemsCount }, (_, originalIdx) => {
    const numericParts = lineSegments[originalIdx + 1].split(' ');
    return {
      originalIdentifier: originalIdx,
      primaryValue: Number.parseInt(numericParts[0], 10),
      secondaryValue: Number.parseInt(numericParts[1], 10)
    };
  });

  const finalResult = calculateSequenceSum(itemCollection, totalItemsCount);

  console.log(finalResult);
}

function calculateSequenceSum(allAvailableItems, operationCount) {
  let resultAccumulator;

  const activeItemIdentifiers = new Set(allAvailableItems.map(item => item.originalIdentifier));

  for (let currentOperationIndex = 0; currentOperationIndex < operationCount; currentOperationIndex++) {
    let chosenOriginalIdentifier;

    if (currentOperationIndex % 2 === 0) {
      chosenOriginalIdentifier = findOptimalItemIdentifier(allAvailableItems, activeItemIdentifiers, true);
    } else {
      chosenOriginalIdentifier = findOptimalItemIdentifier(allAvailableItems, activeItemIdentifiers, false);
    }

    const selectedItem = allAvailableItems[chosenOriginalIdentifier];

    if (resultAccumulator === undefined) {
      if (currentOperationIndex % 2 === 0) {
        resultAccumulator = selectedItem.primaryValue;
      } else {
        resultAccumulator = -selectedItem.secondaryValue;
      }
    } else {
      if (currentOperationIndex % 2 === 0) {
        resultAccumulator += selectedItem.primaryValue;
      } else {
        resultAccumulator -= selectedItem.secondaryValue;
      }
    }

    activeItemIdentifiers.delete(chosenOriginalIdentifier);
  }

  return resultAccumulator;
}

function findOptimalItemIdentifier(allItems, currentActiveIdentifiers, prioritizePrimaryA) {
  let bestOriginalIdentifier = -1;
  let peakPrimaryValue = -Infinity;
  let peakSecondaryValue = -Infinity;

  for (const currentIdentifier of currentActiveIdentifiers) {
    const currentItem = allItems[currentIdentifier];

    const currentPrimary = prioritizePrimaryA ? currentItem.primaryValue : currentItem.secondaryValue;
    const currentSecondary = prioritizePrimaryA ? currentItem.secondaryValue : currentItem.primaryValue;

    if (currentPrimary > peakPrimaryValue) {
      peakPrimaryValue = currentPrimary;
      peakSecondaryValue = currentSecondary;
      bestOriginalIdentifier = currentIdentifier;
    } else if (currentPrimary === peakPrimaryValue) {
      if (currentSecondary >= peakSecondaryValue) {
        peakSecondaryValue = currentSecondary;
        bestOriginalIdentifier = currentIdentifier;
      }
    }
  }

  return bestOriginalIdentifier;
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
