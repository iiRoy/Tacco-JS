const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = fileContent.split('\n');

const configParameters = inputLines.shift().split(' ');
const totalItemCount = parseInt(configParameters[0], 10);
const targetUniqueItemCount = parseInt(configParameters[1], 10);

const itemLabels = inputLines.shift().split(' ');

const itemOccurrenceMap = new Map();

itemLabels.forEach(label => {
    itemOccurrenceMap.set(label, (itemOccurrenceMap.get(label) || 0) + 1);
});

const currentDistinctItemCount = itemOccurrenceMap.size;
const uniqueItemsToEliminate = currentDistinctItemCount - targetUniqueItemCount;

if (uniqueItemsToEliminate > 0) {
    const allOccurrences = Array.from(itemOccurrenceMap.values());
    allOccurrences.sort((valA, valB) => valA - valB);

    const minimumRemovalSum = allOccurrences
        .slice(0, uniqueItemsToEliminate)
        .reduce((accumulator, currentFrequency) => accumulator + currentFrequency, 0);

    console.log(minimumRemovalSum);
} else {
    console.log(0);
}
