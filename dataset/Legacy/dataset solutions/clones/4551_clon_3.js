const parseInputData = (rawDataString) => {
  const dataLines = rawDataString.trim().split('\n');
  const [firstLineContent, ...heightLines] = dataLines;

  const [numItems, valA, valB] = firstLineContent.split(' ').map(Number);
  const itemValues = heightLines.map(line => Number(line.split(' ')[0]));

  return { numItems, valA, valB, itemValues };
};

const calculateOptimalValue = (inputContent) => {
  const { numItems, valA, valB, itemValues } = parseInputData(inputContent);

  const MAX_INITIAL_HEIGHT_CONSTANT = 1e9;
  const ATTACK_POWER_DIFFERENCE = valA - valB;

  let searchHighBoundary = Math.ceil(MAX_INITIAL_HEIGHT_CONSTANT / valB);
  let searchLowBoundary = 0;

  while (searchHighBoundary > searchLowBoundary + 1) {
    const currentMidPoint = (searchHighBoundary + searchLowBoundary) >> 1;
    let remainingCapacity = currentMidPoint;

    for (let itemIndex = 0; itemIndex < numItems; itemIndex++) {
      const currentItemHeight = itemValues[itemIndex];
      const effectiveRemainingHeight = currentItemHeight - currentMidPoint * valB;

      if (effectiveRemainingHeight <= 0) {
        continue;
      }

      const requiredAttacks = Math.ceil(effectiveRemainingHeight / ATTACK_POWER_DIFFERENCE);
      remainingCapacity -= requiredAttacks;
    }

    if (remainingCapacity >= 0) {
      searchHighBoundary = currentMidPoint;
    } else {
      searchLowBoundary = currentMidPoint;
    }
  }

  return `${searchHighBoundary}`;
};

console.log(calculateOptimalValue(require('fs').readFileSync('/dev/stdin', 'utf8')));
