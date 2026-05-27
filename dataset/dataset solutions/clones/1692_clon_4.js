const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const allInputLines = fileContent.split('\n');
const dataLines = allInputLines.slice(1); // Discard the first line (n), keep the rest (ss)

const occurrenceMap = dataLines.reduce((accumulator, currentEntry) => {
    if (currentEntry.length > 0) { // Only process non-empty strings
        accumulator.set(currentEntry, (accumulator.get(currentEntry) || 0) + 1);
    }
    return accumulator;
}, new Map());

const statusCategories = ['AC', 'WA', 'TLE', 'RE'];

const formattedOutputSegments = statusCategories.map(categoryIdentifier => {
    const categoryCount = occurrenceMap.get(categoryIdentifier); // Will be undefined if not present
    return `${categoryIdentifier} x ${categoryCount}`;
});

console.log(formattedOutputSegments.join('\n'));
