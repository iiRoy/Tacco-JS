const fileSystem = require("fs");

const inputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
const dataLines = inputContent.split('\n');

const frequencyCounter = new Map();
let highestOccurrence = 0;

dataLines.forEach(lineEntry => {
    const numericValue = parseInt(lineEntry, 10);

    // Original code uses `if (+i)` which filters out 0, NaN, and non-numeric strings.
    // It also implicitly handles array bounds for numbers 0-99.
    // Numbers outside 0-99 are effectively ignored as `a[index]++` for `undefined` results in `NaN`,
    // and `NaN > c` is always false.
    // Thus, we only process positive integers from 1 to 99.
    if (!isNaN(numericValue) && numericValue > 0 && numericValue < 100) {
        const currentCount = (frequencyCounter.get(numericValue) || 0) + 1;
        frequencyCounter.set(numericValue, currentCount);
        highestOccurrence = Math.max(highestOccurrence, currentCount);
    }
});

const mostFrequentNumbers = [];

for (const [numberKey, countValue] of frequencyCounter.entries()) {
    if (countValue === highestOccurrence) {
        mostFrequentNumbers.push(numberKey);
    }
}

// The original code iterates through the array 'a' by index (0 to 99),
// which naturally prints numbers in ascending order if they share the max frequency.
// Sorting ensures this behavior is preserved for Map-based counting.
mostFrequentNumbers.sort((valA, valB) => valA - valB);

mostFrequentNumbers.forEach(outputNumber => {
    console.log(outputNumber);
});
