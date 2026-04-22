const fileSystemAccess = require("fs");

function compileItemFrequencies(itemSequenceText) {
  return itemSequenceText.split(' ').reduce((itemCatalog, itemToken) => {
    const itemValue = Number(itemToken);
    itemCatalog.set(itemValue, (itemCatalog.get(itemValue) || 0) + 1);
    return itemCatalog;
  }, new Map());
}

function verifyInventoryAvailability(availableStock, requiredDemand) {
  return Array.from(requiredDemand.entries()).every(([desiredItem, neededAmount]) => {
    const currentStock = availableStock.get(desiredItem) || 0;
    return neededAmount <= currentStock;
  });
}

function handleOrderValidation(incomingDataStream) {
  const dataSegments = incomingDataStream.split('\n');

  // The first and third lines (indices 0 and 2) contain counts that are not utilized
  // in the core logic of determining availability, so they are effectively skipped.
  const primaryItemList = dataSegments[1];
  const secondaryItemList = dataSegments[3];

  const primaryInventoryMap = compileItemFrequencies(primaryItemList);
  const secondaryDemandMap = compileItemFrequencies(secondaryItemList);

  if (verifyInventoryAvailability(primaryInventoryMap, secondaryDemandMap)) {
    return "YES";
  } else {
    return "NO";
  }
}

const inputPath = "/dev/stdin";
const rawInput = fileSystemAccess.readFileSync(inputPath, "UTF-8");

console.log(handleOrderValidation(rawInput));