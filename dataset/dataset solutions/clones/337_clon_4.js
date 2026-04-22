const rawInputContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');

const transformedRecords = rawInputContent.trim()
  .split('\n')
  .filter(singleLine => singleLine.trim().length > 0)
  .map(singleLine => {
    const constituentParts = singleLine.split(' ');
    return {
      categoryIdentifier: constituentParts[0],
      numericValue: parseInt(constituentParts[1], 10)
    };
  });

const orderedSet = transformedRecords.sort((firstElement, secondElement) => {
  const categoryComparison = firstElement.categoryIdentifier.localeCompare(secondElement.categoryIdentifier);
  if (categoryComparison !== 0) {
    return categoryComparison;
  }
  return firstElement.numericValue - secondElement.numericValue;
});

const groupedDataMap = orderedSet.reduce((collector, currentItem) => {
  const primaryKey = currentItem.categoryIdentifier;
  if (!collector.has(primaryKey)) {
    collector.set(primaryKey, []);
  }
  collector.get(primaryKey).push(currentItem.numericValue);
  return collector;
}, new Map());

const outputAssembly = [];
for (const [keyLabel, associatedValues] of groupedDataMap.entries()) {
  outputAssembly.push(keyLabel);
  outputAssembly.push(associatedValues.join(' '));
}

console.log(outputAssembly.join('\n'));