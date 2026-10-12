const convertStringToInteger = (numericString) => {
  return parseInt(numericString, 10);
};

const parseLineOfNumbers = (lineString) => {
  return lineString.split(' ').map(convertStringToInteger);
};

function processKnapsackInput(rawInputData) {
  const inputLines = rawInputData.split("\n");

  const firstLineParsed = parseLineOfNumbers(inputLines[0]);
  const numItems = firstLineParsed[0];
  const maxAllowedWeight = firstLineParsed[1];

  const itemWeightValuePairs = [];
  let totalPossibleWeightSum = 0;
  let totalPossibleValueSum = 0;

  for (let itemLineIndex = 1; itemLineIndex <= numItems; itemLineIndex++) {
    const currentItemDetails = parseLineOfNumbers(inputLines[itemLineIndex]);
    itemWeightValuePairs.push(currentItemDetails);
    totalPossibleWeightSum += currentItemDetails[0];
    totalPossibleValueSum += currentItemDetails[1];
  }

  console.log(calculateMaxKnapsackValue(numItems, maxAllowedWeight, itemWeightValuePairs, totalPossibleWeightSum, totalPossibleValueSum));
}

processKnapsackInput(require("fs").readFileSync("/dev/stdin", "utf8"));

function calculateMaxKnapsackValue(numItems, maxAllowedWeight, itemWeightValuePairs, totalPossibleWeightSum, totalPossibleValueSum) {
  let finalMaxAchievedValue = 0;

  const dynamicProgrammingTable = Array(numItems + 1);

  // Initialize the first row (representing 0 items)
  dynamicProgrammingTable[0] = Array(totalPossibleValueSum + 1).fill(0);

  // Initialize subsequent rows (representing items from 1 to numItems)
  for (let rowIndex = 1; rowIndex <= numItems; rowIndex++) {
    const currentRow = Array(totalPossibleValueSum + 1).fill(totalPossibleWeightSum);
    currentRow[0] = 0; // Value 0 always requires 0 weight
    dynamicProgrammingTable[rowIndex] = currentRow;
  }

  // Fill the DP table using a bottom-up approach (iterating items from N down to 1)
  for (let itemIdx = numItems; itemIdx > 0; itemIdx--) {
    const currentItemWeight = itemWeightValuePairs[itemIdx - 1][0];
    const currentItemValue = itemWeightValuePairs[itemIdx - 1][1];

    for (let currentValueCapacity = totalPossibleValueSum; currentValueCapacity > 0; currentValueCapacity--) {
      const weightIfSkipped = dynamicProgrammingTable[itemIdx][currentValueCapacity];

      if (currentValueCapacity >= currentItemValue) {
        const weightIfIncluded = dynamicProgrammingTable[itemIdx][currentValueCapacity - currentItemValue] + currentItemWeight;
        dynamicProgrammingTable[itemIdx - 1][currentValueCapacity] = Math.min(weightIfIncluded, weightIfSkipped);
      } else {
        dynamicProgrammingTable[itemIdx - 1][currentValueCapacity] = weightIfSkipped;
      }
    }
  }

  // Determine the maximum value that can be achieved within the maxAllowedWeight
  // The original code iterates through all rows from 0 to N-1 for this check.
  for (let currentItemRowIndex = 0; currentItemRowIndex < numItems; currentItemRowIndex++) {
    for (let currentValue = 0; currentValue <= totalPossibleValueSum; currentValue++) {
      const weightRequiredForCurrentValue = dynamicProgrammingTable[currentItemRowIndex][currentValue];
      if (weightRequiredForCurrentValue <= maxAllowedWeight) {
        finalMaxAchievedValue = Math.max(currentValue, finalMaxAchievedValue);
      }
    }
  }

  return finalMaxAchievedValue;
}
