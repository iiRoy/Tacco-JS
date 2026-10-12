function processInput(rawData) {
  const lines = rawData.split("\n");

  const firstLineParts = lines[0].split(" ");
  const initialCount = parseInt(firstLineParts[0], 10);
  const modifierCount = parseInt(firstLineParts[1], 10);

  const dataItems = [];

  const initialValuesLineParts = lines[1].split(" ");
  for (let idx = 0; idx < initialCount; ++idx) {
    const itemValue = parseInt(initialValuesLineParts[idx], 10);
    dataItems.push([1, itemValue]);
  }

  for (let idx = 0; idx < modifierCount; ++idx) {
    const modifierLineParts = lines[idx + 2].split(" ");
    const modifierQuantity = parseInt(modifierLineParts[0], 10);
    const modifierValue = parseInt(modifierLineParts[1], 10);
    dataItems.push([modifierQuantity, modifierValue]);
  }

  dataItems.sort((itemA, itemB) => itemB[1] - itemA[1]);

  let totalSum = 0;
  let processedCount = 0;

  for (let idx = 0; idx < initialCount; ++idx) {
    if (processedCount >= initialCount) {
      break;
    }

    const currentItem = dataItems[idx];
    const currentItemQuantity = currentItem[0];
    const currentItemValue = currentItem[1];

    const remainingCapacity = initialCount - processedCount;

    if (currentItemQuantity <= remainingCapacity) {
      totalSum += currentItemValue * currentItemQuantity;
      processedCount += currentItemQuantity;
    } else if (remainingCapacity > 0) {
      totalSum += currentItemValue * remainingCapacity;
      processedCount = initialCount;
    } else {
      break;
    }
  }

  console.log(String(totalSum));
  return totalSum;
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
