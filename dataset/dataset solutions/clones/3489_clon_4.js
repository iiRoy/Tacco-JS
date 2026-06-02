const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
const allLines = sourceData.split('\n');

const [itemCountStr, timeLimitStr] = allLines.shift().split(' ');
const totalEntries = Number(itemCountStr);
const maxDuration = Number(timeLimitStr);

const processedEntries = allLines.slice(0, totalEntries).map(lineContent => {
    const [costValueStr, durationValueStr] = lineContent.split(' ');
    return {
        pricePoint: Number(costValueStr),
        timeRequired: Number(durationValueStr)
    };
});

const viableOptions = processedEntries.filter(entry => entry.timeRequired <= maxDuration);

let finalResult;
if (viableOptions.length === 0) {
    finalResult = 'TLE';
} else {
    finalResult = viableOptions.reduce((currentMinPrice, currentEntry) => {
        return Math.min(currentMinPrice, currentEntry.pricePoint);
    }, Infinity);
}

console.log(finalResult);
