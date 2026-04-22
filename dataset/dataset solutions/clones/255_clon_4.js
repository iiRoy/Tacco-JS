((sourceData) => {
  const processedItems = sourceData
    .split(/,\d+\n{0,}/)
    .slice(0, -1)
    .map(Number);

  const frequencyLedger = processedItems.reduce((tally, itemValue) => {
    tally.set(itemValue, (tally.get(itemValue) || 0) + 1);
    return tally;
  }, new Map());

  const outputBuffer = [...frequencyLedger.entries()]
    .filter(([, count]) => count > 1)
    .map(([value, count]) => `${value} ${count}\n`)
    .join('');

  console.log(outputBuffer);
})(input);