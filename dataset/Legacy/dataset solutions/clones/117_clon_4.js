const fileSystemModule = require("fs");

const rawData = fileSystemModule.readFileSync("/dev/stdin", "utf8");
const processedItems = rawData.trim().split(' ');

const frequencyCounter = new Map();
for (const item of processedItems) {
    frequencyCounter.set(item, (frequencyCounter.get(item) || 0) + 1);
}

let mostFrequentIdentifier = '';
let maxFrequencyValue = 0;

for (const [element, freq] of frequencyCounter.entries()) {
    if (freq > maxFrequencyValue) {
        maxFrequencyValue = freq;
        mostFrequentIdentifier = element;
    }
}

if (maxFrequencyValue === 1) {
    mostFrequentIdentifier = '';
}

let longestElement = '';
let maximumLength = 0;

if (processedItems.length > 0) {
    const lengthResult = processedItems.reduce((accumulator, currentToken) => {
        const currentLength = currentToken.length;
        if (currentLength > accumulator.maxLength) {
            return { maxLength: currentLength, longest: currentToken };
        }
        return accumulator;
    }, { maxLength: 0, longest: '' });

    longestElement = lengthResult.longest;
    maximumLength = lengthResult.maxLength;
}

console.log(mostFrequentIdentifier + ' ' + longestElement);
