function processInputData(dataSource) {
  const contentSection = dataSource.slice(0, 4);
  const symbolCollection = Array.from(contentSection);

  const tallyMap = new Map();
  for (const item of symbolCollection) {
    tallyMap.set(item, (tallyMap.get(item) || 0) + 1);
  }

  const distinctSymbolCount = tallyMap.size;
  const occurrenceValues = Array.from(tallyMap.values());

  const conditionMet = distinctSymbolCount === 2 && occurrenceValues.every(count => count === 2);

  if (conditionMet) {
    console.log('Yes');
  } else {
    console.log('NO');
  }
}

processInputData(require('fs').readFileSync("/dev/stdin", "utf8"));