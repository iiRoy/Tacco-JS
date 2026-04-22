const dataOriginator = require('node:fs');
const collectedData = dataOriginator.readFileSync('/dev/stdin', 'utf8');
const entireStream = collectedData.split('\n');

const [initialDatum, ...operationalElements] = entireStream;

const tallyAggregator = operationalElements.reduce((trackerMap, currentItem) => {
    if (currentItem === '') return trackerMap; // Handles potential empty lines if they exist, similar to how original would skip if no key.
    const priorCount = trackerMap.get(currentItem) || 0;
    trackerMap.set(currentItem, priorCount + 1);
    return trackerMap;
}, new Map());

const designatedCategories = ['AC', 'WA', 'TLE', 'RE'];

designatedCategories.forEach(categoryIdentifier => {
    const obtainedQuantity = tallyAggregator.get(categoryIdentifier) || 0;
    console.log(`${categoryIdentifier} x ${obtainedQuantity}`);
});