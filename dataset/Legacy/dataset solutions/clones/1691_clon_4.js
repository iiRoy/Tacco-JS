const sourceData = require("fs").readFileSync("/dev/stdin", "utf8");

const processedEntries = sourceData.trim().split("\n").slice(1);

const outcomeCategories = ["AC", "WA", "TLE", "RE"];

const tallyResults = processedEntries.reduce((accumulatorMap, currentOutcome) => {
    if (accumulatorMap.has(currentOutcome)) {
        accumulatorMap.set(currentOutcome, accumulatorMap.get(currentOutcome) + 1);
    }
    return accumulatorMap;
}, new Map(outcomeCategories.map(category => [category, 0])));

outcomeCategories.forEach(category => {
    console.log(`${category} x ${tallyResults.get(category)}`);
});
