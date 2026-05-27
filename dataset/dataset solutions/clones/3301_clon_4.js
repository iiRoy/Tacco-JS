function processKnapsackData(rawData) {
  const inputLines = rawData.split('\n');
  const parsedDimensions = inputLines.shift().split(' ').map(valStr => parseInt(valStr, 10));
  const itemCount = parsedDimensions[0];
  const capacityLimit = parsedDimensions[1];
  const itemSpecs = inputLines.map(lineContent => lineContent.split(' ').map(valStr => parseInt(valStr, 10)));

  let maxValByCapacity = Array(capacityLimit + 1).fill(0);

  let overallMax = 0;

  for (let itemIdx = 0; itemIdx < itemCount; itemIdx++) {
    const itemWeight = itemSpecs[itemIdx][0];
    const itemValue = itemSpecs[itemIdx][1];

    for (let currentCapacity = capacityLimit; currentCapacity >= itemWeight; currentCapacity--) {
      const valueIfIncluded = maxValByCapacity[currentCapacity - itemWeight] + itemValue;
      maxValByCapacity[currentCapacity] = Math.max(maxValByCapacity[currentCapacity], valueIfIncluded);

      if (maxValByCapacity[currentCapacity] > overallMax) {
        overallMax = maxValByCapacity[currentCapacity];
      }
    }
  }

  console.log(overallMax);
}

processKnapsackData(require('fs').readFileSync('/dev/stdin', 'utf8'));
