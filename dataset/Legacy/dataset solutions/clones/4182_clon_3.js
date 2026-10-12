const parseNumericString = (strValue) => Number(strValue);

const rawInputLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

const initialParams = rawInputLines.shift().split(' ');
const totalItemsCount = parseNumericString(initialParams[0]);
const desiredUniqueLimit = parseNumericString(initialParams[1]);

const itemIdentifiers = rawInputLines.shift().split(' ');

const itemFrequencyMap = new Map();

for (let itemIndex = 0; itemIndex < totalItemsCount; itemIndex++) {
    const currentItem = parseNumericString(itemIdentifiers[itemIndex]);
    itemFrequencyMap.set(currentItem, (itemFrequencyMap.get(currentItem) || 0) + 1);
}

const allFrequenciesList = Array.from(itemFrequencyMap.values());

const distinctItemCount = itemFrequencyMap.size;
const itemsToReduceBy = distinctItemCount - desiredUniqueLimit;

let accumulatedCost = 0;

if (itemsToReduceBy > 0) {
    allFrequenciesList.sort((freqA, freqB) => freqA - freqB);

    for (let i = 0; i < itemsToReduceBy; i++) {
        accumulatedCost += allFrequenciesList[i];
    }
    console.log(accumulatedCost);
} else {
    console.log(0);
}
