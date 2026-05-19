let mostFrequentItems = [];
let currentConsecutiveCount = 0;
let maximumFrequency = 0;
let lastDistinctItem = 0;

const fileSystemModule = require("fs");

const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
const trimmedContent = rawInputContent.trim();
const inputLines = trimmedContent.split('\n');
const sortedLines = inputLines.sort();

sortedLines.forEach(function(currentItem) {
    if (currentItem === lastDistinctItem) {
        currentConsecutiveCount++;
    } else {
        if (currentConsecutiveCount > maximumFrequency) {
            mostFrequentItems = [lastDistinctItem];
            maximumFrequency = currentConsecutiveCount;
        } else if (currentConsecutiveCount === maximumFrequency) {
            mostFrequentItems.push(lastDistinctItem);
        }
        lastDistinctItem = currentItem;
        currentConsecutiveCount = 0;
    }
});

console.log(mostFrequentItems.join('\n'));
