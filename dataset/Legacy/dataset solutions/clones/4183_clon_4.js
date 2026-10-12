const inputSource = require('fs').readFileSync(0, 'utf8');
const [firstConfigLine, itemDataLine] = inputSource.trim().split('\n');

const [totalItems, maxAllowedTypes] = firstConfigLine.split(' ').map(Number);
const itemIdentifiers = itemDataLine.split(' ');

const typeFrequencyMap = new Map();

for (const identifier of itemIdentifiers) {
  typeFrequencyMap.set(identifier, (typeFrequencyMap.get(identifier) || 0) + 1);
}

const currentDistinctTypes = typeFrequencyMap.size;
const excessTypesCount = currentDistinctTypes - maxAllowedTypes;

if (excessTypesCount <= 0) {
  console.log(0);
} else {
  const allFrequencies = Array.from(typeFrequencyMap.values());
  allFrequencies.sort((valA, valB) => valA - valB);

  const removalCost = allFrequencies
    .slice(0, excessTypesCount)
    .reduce((accumulator, currentFrequency) => accumulator + currentFrequency, 0);

  console.log(removalCost);
}
