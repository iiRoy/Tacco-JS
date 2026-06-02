(function executeProgram() {
  const fileSystemModule = require('fs');
  const standardInputPath = '/dev/stdin';
  const newlineSeparator = "\n";
  const spaceSeparator = " ";

  const rawInputContent = fileSystemModule.readFileSync(standardInputPath, 'utf8');
  const trimmedContent = rawInputContent.trim();
  const inputLines = trimmedContent.split(newlineSeparator);

  const firstLine = inputLines.shift();
  const firstLineParts = firstLine.split(spaceSeparator);
  const itemCount = Number(firstLineParts[0]);
  const stackCount = Number(firstLineParts[1]);

  const itemWeights = inputLines.map(Number);

  const checkFeasibility = (capacityLimit) => {
    let itemsProcessedCount = 0;

    for (let stackIndex = 0; stackIndex < stackCount; stackIndex++) {
      let currentStackLoad = 0;

      while (currentStackLoad <= capacityLimit) {
        if (itemsProcessedCount === itemCount) {
          return itemCount;
        }

        itemsProcessedCount++;
        currentStackLoad += itemWeights[itemsProcessedCount];
      }

      if (itemsProcessedCount === itemCount) {
        return itemCount;
      }
    }
    return itemsProcessedCount;
  };

  const totalWeight = itemWeights.reduce((accumulator, currentVal) => accumulator + currentVal, 0);
  let currentCapacity = Math.floor(totalWeight / stackCount);

  do {
    currentCapacity++;
  } while (checkFeasibility(currentCapacity) !== itemCount);

  console.log(currentCapacity);

})();
