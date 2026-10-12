const updateMapMaxValue = (targetMap, keyIdentifier, newValue) => {
  if (targetMap[keyIdentifier] === undefined || newValue > targetMap[keyIdentifier]) {
    targetMap[keyIdentifier] = newValue;
  }
};

function parseInteger(inputString) {
  return parseInt(inputString, 10);
}

Array.prototype.sortNumbersAscending = function () {
  return this.sort((valA, valB) => (valA - valB));
};
Array.prototype.sortNumbersDescending = function () {
  return this.sort((valA, valB) => (valB - valA));
};
Array.prototype.sortStringsLexicographically = function () {
  return this.sort();
};
Array.prototype.sortStringsLexicographicallyReverse = function () {
  return this.sort().reverse();
};
Array.prototype.filterOutSpecificValue = function (valueToExclude) {
  return this.filter(element => element !== valueToExclude);
};

function processInputData(inputLines) {
  const firstLineParts = inputLines[0].split(' ');
  const totalItemCount = parseInteger(firstLineParts[0]);
  const knapsackMaxWeightCapacity = parseInteger(firstLineParts[1]);

  const itemDetails = inputLines.slice(1).map(line => {
    const parts = line.split(' ');
    return {
      weight: parseInteger(parts[0]),
      value: parseInteger(parts[1])
    };
  });

  let currentKnapsackStates = { 0: 0 }; // Maps weight -> maximum value for that weight

  for (let itemIdx = 0; itemIdx < totalItemCount; itemIdx++) {
    const currentItem = itemDetails[itemIdx];
    const itemWeight = currentItem.weight;
    const itemValue = currentItem.value;

    const nextKnapsackStates = {}; // Temporary map to build states for the next iteration

    Object.keys(currentKnapsackStates).forEach(weightKeyString => {
      const existingWeight = parseInteger(weightKeyString);
      const existingValue = currentKnapsackStates[weightKeyString];

      // Scenario 1: Do not include the current item. Preserve the existing state.
      updateMapMaxValue(nextKnapsackStates, existingWeight, existingValue);

      // Scenario 2: Attempt to include the current item.
      const potentialNewWeight = existingWeight + itemWeight;
      const potentialNewValue = existingValue + itemValue;

      // Only consider if the new weight does not exceed the knapsack's capacity
      if (potentialNewWeight <= knapsackMaxWeightCapacity) {
        updateMapMaxValue(nextKnapsackStates, potentialNewWeight, potentialNewValue);
      }
    });
    currentKnapsackStates = nextKnapsackStates; // Update states for the next item
  }

  let overallMaxValueAchieved = 0;
  Object.keys(currentKnapsackStates).forEach(finalWeightKey => {
    const valueAtThisWeight = currentKnapsackStates[finalWeightKey];
    if (valueAtThisWeight > overallMaxValueAchieved) {
      overallMaxValueAchieved = valueAtThisWeight;
    }
  });

  console.log(overallMaxValueAchieved);
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const trimmedLines = fileContent.split('\n').map(line => line.trim());
processInputData(trimmedLines);
