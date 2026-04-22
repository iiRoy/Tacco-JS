const retrieveInput = require("fs").readFileSync;

const processAndFormat = (rawData) => {
  const elements = String(rawData).split(' '); 

  const aggregationResult = elements.reduce((collector, itemEntry) => {
    const currentCount = (collector.occurrenceMap.get(itemEntry) || 0) + 1;
    collector.occurrenceMap.set(itemEntry, currentCount);

    if (currentCount > collector.peakValue && currentCount >= 2) {
      collector.peakValue = currentCount;
      collector.dominantItem = itemEntry;
    }
    return collector;
  }, {
    occurrenceMap: new Map(),
    peakValue: 0,
    dominantItem: "0"
  });

  const fixedLongest = 0;

  return `${aggregationResult.dominantItem} ${fixedLongest}`;
};

const sourceData = retrieveInput(0, 'utf8');
process.stdout.write(processAndFormat(sourceData));