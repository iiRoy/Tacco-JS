'use strict';

function processInputAndGenerateOutput(sourceText) {
  const contentLines = sourceText.split('\n').slice(1);

  const structuredEntries = contentLines.map((lineSegment, originalLineIdx) => {
    const parts = lineSegment.split(' ');
    return {
      categoryIdentifier: parts[0],
      numericValue: parseInt(parts[1], 10),
      initialSequence: originalLineIdx + 1,
    };
  });

  const categorizedCollection = structuredEntries.reduce((accumulator, currentEntry) => {
    const { categoryIdentifier } = currentEntry;
    if (!accumulator.has(categoryIdentifier)) {
      accumulator.set(categoryIdentifier, []);
    }
    accumulator.get(categoryIdentifier).push(currentEntry);
    return accumulator;
  }, new Map());

  const sortedCategorizedCollection = new Map(
    Array.from(categorizedCollection.entries()).map(([categoryKey, entriesList]) => [
      categoryKey,
      entriesList.sort((entryA, entryB) => entryB.numericValue - entryA.numericValue),
    ])
  );

  const orderedCategoryKeys = Array.from(sortedCategorizedCollection.keys()).sort();

  const finalSequence = orderedCategoryKeys.flatMap(key =>
    sortedCategorizedCollection.get(key).map(entry => entry.initialSequence)
  );

  console.log(finalSequence.join('\n'));
}

processInputAndGenerateOutput(require('fs').readFileSync('/dev/stdin', 'utf8'));
