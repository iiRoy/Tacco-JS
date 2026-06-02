const fileSystem = require('fs');

const readInputFile = (filePath) => fileSystem.readFileSync(filePath, 'utf8');

const parseNumericLine = (lineString) => lineString.split(' ').map(Number);

const rawInputContent = readInputFile('/dev/stdin');
const processedInputLines = rawInputContent.trim().split('\n');

const firstLineParameters = parseNumericLine(processedInputLines[0]);
const totalItemCount = firstLineParameters[0];
const knapsackCapacity = firstLineParameters[1];

const itemSpecifications = processedInputLines.slice(1).map(parseNumericLine);

const dynamicProgrammingTable = Array.from({ length: totalItemCount + 1 }, () => Array(knapsackCapacity + 1).fill(0));

function calculateMaximumValue() {
  for (let itemIndex = 0; itemIndex < totalItemCount; itemIndex++) {
    const currentItemData = itemSpecifications[itemIndex];
    const currentItemWeight = currentItemData[0];
    const currentItemValue = currentItemData[1];

    for (let currentWeightLimit = 0; currentWeightLimit <= knapsackCapacity; currentWeightLimit++) {
      let valueIfItemIncluded = 0;
      const valueIfItemExcluded = dynamicProgrammingTable[itemIndex][currentWeightLimit];

      if (currentItemWeight <= currentWeightLimit) {
        const remainingCapacityAfterInclusion = currentWeightLimit - currentItemWeight;
        valueIfItemIncluded = dynamicProgrammingTable[itemIndex][remainingCapacityAfterInclusion] + currentItemValue;
      }

      dynamicProgrammingTable[itemIndex + 1][currentWeightLimit] = Math.max(valueIfItemIncluded, valueIfItemExcluded);
    }
  }
  return dynamicProgrammingTable[totalItemCount][knapsackCapacity];
}

console.log(calculateMaximumValue());
