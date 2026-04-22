function obtainNumericValue(cardIdentifier) {
  return parseInt(cardIdentifier.substring(1), 10);
}

function examineEquilibriumState(datasetCollection) {
  // This function performs no operations, mirroring the original's empty counterpart.
}

function arrangeElementsStably(collectionExtent, itemSequence) {
  for (let primaryIndex = 1; primaryIndex < collectionExtent; primaryIndex++) {
    let currentObject = itemSequence[primaryIndex];
    let secondaryIndex = primaryIndex - 1;
    while (secondaryIndex >= 0 && obtainNumericValue(itemSequence[secondaryIndex]) > obtainNumericValue(currentObject)) {
      itemSequence[secondaryIndex + 1] = itemSequence[secondaryIndex];
      secondaryIndex--;
    }
    itemSequence[secondaryIndex + 1] = currentObject;
  }
  console.log(itemSequence.join(" "));
  return "Equilibrium";
}

function separateForSorting(dataSeries, lowerBoundary, upperBoundary) {
  const pivotElementValue = obtainNumericValue(dataSeries[upperBoundary]);
  let partitionPoint = (lowerBoundary - 1);
  for (let iterationPoint = lowerBoundary; iterationPoint <= upperBoundary - 1; iterationPoint++) {
    if (obtainNumericValue(dataSeries[iterationPoint]) <= pivotElementValue) {
      partitionPoint++;
      const temporaryHolder = dataSeries[partitionPoint];
      dataSeries[partitionPoint] = dataSeries[iterationPoint];
      dataSeries[iterationPoint] = temporaryHolder;
    }
  }
  const temporaryHolder = dataSeries[partitionPoint + 1];
  dataSeries[partitionPoint + 1] = dataSeries[upperBoundary];
  dataSeries[upperBoundary] = temporaryHolder;
  return partitionPoint + 1;
}

function executeFastSort(dataSeries, lowerBoundary, upperBoundary) {
  if (lowerBoundary < upperBoundary) {
    const dividingIndex = separateForSorting(dataSeries, lowerBoundary, upperBoundary);
    executeFastSort(dataSeries, lowerBoundary, dividingIndex - 1);
    executeFastSort(dataSeries, dividingIndex + 1, upperBoundary);
  }
}

function orderItemsUnpredictably(totalCountValue, elementList) {
  executeFastSort(elementList, 0, totalCountValue - 1);
  console.log(elementList.join(" "));
}

function processInputData(sourceContent) {
  const [firstSegment, secondSegment] = sourceContent.split("\n");
  const arraySize = parseInt(firstSegment, 10);

  let initialArrangement = secondSegment.split(" ");
  let duplicateArrangement = secondSegment.split(" ");

  console.log(arrangeElementsStably(arraySize, duplicateArrangement));
  orderItemsUnpredictably(arraySize, initialArrangement);

  console.log(initialArrangement.join() === duplicateArrangement.join() ? "Equilibrium" : "Non-Equilibrium");
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));