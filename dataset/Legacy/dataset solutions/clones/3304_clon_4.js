const fileSystem = require('fs');
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

const processedLines = rawInputContent.trim().split('\n');

const initialParameters = processedLines[0].split(' ').map(Number);
const totalItems = initialParameters[0];
const knapsackCapacity = initialParameters[1];

const itemSpecifications = processedLines.slice(1).map(entry => entry.split(' ').map(Number));

const maximumValues = Array(knapsackCapacity + 1).fill(0);

function computeOptimalValue() {
  for (let currentItemIndex = 0; currentItemIndex < totalItems; currentItemIndex++) {
    const itemWeight = itemSpecifications[currentItemIndex][0];
    const itemValue = itemSpecifications[currentItemIndex][1];

    for (let currentCapacity = knapsackCapacity; currentCapacity >= itemWeight; currentCapacity--) {
      const valueIfIncluded = maximumValues[currentCapacity - itemWeight] + itemValue;
      const valueIfExcluded = maximumValues[currentCapacity];
      maximumValues[currentCapacity] = Math.max(valueIfIncluded, valueIfExcluded);
    }
  }
  return maximumValues[knapsackCapacity];
}

console.log(computeOptimalValue());
