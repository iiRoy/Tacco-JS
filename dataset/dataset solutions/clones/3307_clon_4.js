function processInputAndSolve(rawInputContent) {
  const inputLines = rawInputContent.split("\n");

  const convertToNumber = (strValue) => Number.parseInt(strValue, 10);

  const [totalItems, maxWeightCapacity] = inputLines[0].split(' ').map(convertToNumber);

  const itemDetails = [];
  for (let itemIndex = 0; itemIndex < totalItems; itemIndex++) {
    itemDetails.push(inputLines[itemIndex + 1].split(' ').map(convertToNumber));
  }

  console.log(calculateMaxKnapsackValue(totalItems, maxWeightCapacity, itemDetails));
}

function calculateMaxKnapsackValue(numItems, capacityLimit, itemsArray) {
  const maxValuesForWeight = Array(capacityLimit + 1).fill(0);

  for (let currentItemIdx = 0; currentItemIdx < numItems; currentItemIdx++) {
    const itemWeight = itemsArray[currentItemIdx][0];
    const itemValue = itemsArray[currentItemIdx][1];

    for (let currentWeight = capacityLimit; currentWeight >= itemWeight; currentWeight--) {
      maxValuesForWeight[currentWeight] = Math.max(
        maxValuesForWeight[currentWeight],
        maxValuesForWeight[currentWeight - itemWeight] + itemValue
      );
    }
  }

  return maxValuesForWeight[capacityLimit];
}

processInputAndSolve(require("fs").readFileSync("/dev/stdin", "utf8"));
