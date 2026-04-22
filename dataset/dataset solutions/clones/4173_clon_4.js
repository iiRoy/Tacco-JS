function processInputData(rawData) {
  const allSegments = rawData.trim().split('\n');
  const configurationData = allSegments[0].split(' ').map(Number);
  const permittedDistinctGroups = configurationData[1]; // Corresponds to K

  const numericSequence = allSegments[1].split(' ').map(Number); // Corresponds to A

  const frequencyMapping = new Map();
  for (const element of numericSequence) {
    frequencyMapping.set(element, (frequencyMapping.get(element) || 0) + 1);
  }

  const groupSizes = Array.from(frequencyMapping.values()).sort((valA, valB) => valA - valB); // Corresponds to size_sorted_A

  const totalDistinctGroups = groupSizes.length;
  let accumulatedRemovalCount = 0;

  if (totalDistinctGroups <= permittedDistinctGroups) {
    console.log(0);
    return;
  }

  const groupsToEliminate = totalDistinctGroups - permittedDistinctGroups;

  accumulatedRemovalCount = groupSizes
    .slice(0, groupsToEliminate)
    .reduce((sum, currentSize) => sum + currentSize, 0);

  console.log(accumulatedRemovalCount);
}

const acquiredTextContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');
processInputData(acquiredTextContent);