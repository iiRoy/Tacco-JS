function parseIntegerString(inputString) {
  if (typeof inputString !== 'string') {
    return parseInt(inputString, 10);
  }
  return parseInt(inputString, 10);
}

function updateWeightValueMap(targetMap, weightKey, potentialValue) {
  const keyAsString = String(weightKey);
  if (targetMap[keyAsString] === undefined || potentialValue > targetMap[keyAsString]) {
    targetMap[keyAsString] = potentialValue;
  }
}

function solveKnapsackProblem(rawInputLines) {
  if (!rawInputLines || rawInputLines.length === 0) {
    console.error("Error: No input lines provided.");
    return;
  }

  const firstLineParts = rawInputLines[0].split(' ').map(parseIntegerString);
  const numberOfItems = firstLineParts[0];
  const maxTotalWeightCapacity = firstLineParts[1];

  const itemDetails = rawInputLines.slice(1)
    .filter(line => line.trim() !== '')
    .map(line => {
      const [itemWeight, itemValue] = line.split(' ').map(parseIntegerString);
      return { weight: itemWeight, value: itemValue };
    });

  let currentWeightToMaxValueMap = {
    '0': 0
  };

  for (let itemIndex = 0; itemIndex < numberOfItems; itemIndex++) {
    const currentItem = itemDetails[itemIndex];
    const currentItemWeight = currentItem.weight;
    const currentItemValue = currentItem.value;

    let nextWeightToMaxValueMap = {};

    for (const existingWeightStr in currentWeightToMaxValueMap) {
      if (currentWeightToMaxValueMap.hasOwnProperty(existingWeightStr)) {
        const existingWeightNum = parseIntegerString(existingWeightStr);
        const existingValue = currentWeightToMaxValueMap[existingWeightStr];

        updateWeightValueMap(nextWeightToMaxValueMap, existingWeightNum, existingValue);

        const newPotentialWeight = existingWeightNum + currentItemWeight;
        const newPotentialValue = existingValue + currentItemValue;

        if (newPotentialWeight <= maxTotalWeightCapacity) {
          updateWeightValueMap(nextWeightToMaxValueMap, newPotentialWeight, newPotentialValue);
        }
      }
    }
    currentWeightToMaxValueMap = nextWeightToMaxValueMap;
  }

  let maximumAchievableValue = 0;

  for (const finalWeightStr in currentWeightToMaxValueMap) {
    if (currentWeightToMaxValueMap.hasOwnProperty(finalWeightStr)) {
      const finalValue = currentWeightToMaxValueMap[finalWeightStr];
      maximumAchievableValue = Math.max(maximumAchievableValue, finalValue);
    }
  }

  console.log(maximumAchievableValue);
}

function readInputFromFile() {
  try {
    const fileSystem = require("fs");
    const fileContent = fileSystem.readFileSync("/dev/stdin", "utf8");
    return fileContent.split('\n').map(line => line.trim());
  } catch (error) {
    console.error("Failed to read input from /dev/stdin:", error.message);
    return [];
  }
}

solveKnapsackProblem(readInputFromFile());