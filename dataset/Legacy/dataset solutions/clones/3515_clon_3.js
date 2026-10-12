const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const inputLines = fileContent.split("\n");

const totalElementsCount = parseInt(inputLines[0], 10);
const elementsArray = inputLines[1].split(" ");

const originalOddsMap = {}; // Stores frequencies for elements at EVEN indices (corresponds to original 'odds' variable)
const originalEvenMap = {}; // Stores frequencies for elements at ODD indices (corresponds to original 'even' variable)

for (let currentIndex = 0; currentIndex < elementsArray.length; currentIndex++) {
    const elementValue = elementsArray[currentIndex];
    let currentFrequencyMap;

    // The original code uses `1&i ? even : odds`.
    // If `i` is odd, `1&i` is truthy, so `even` map is used.
    // If `i` is even, `1&i` is falsy, so `odds` map is used.
    if (currentIndex % 2 !== 0) { // Odd index
        currentFrequencyMap = originalEvenMap;
    } else { // Even index
        currentFrequencyMap = originalOddsMap;
    }

    currentFrequencyMap[elementValue] = (currentFrequencyMap[elementValue] || 0) + 1;
}

const convertAndSortFrequencies = (frequencyMap) => {
    const frequencyList = [];
    for (const valueKey in frequencyMap) {
        frequencyList.push({ value: valueKey, count: frequencyMap[valueKey] });
    }
    frequencyList.sort((itemA, itemB) => itemB.count - itemA.count);
    return frequencyList;
};

const sortedOriginalOdds = convertAndSortFrequencies(originalOddsMap); // Corresponds to original 'a'
const sortedOriginalEvens = convertAndSortFrequencies(originalEvenMap); // Corresponds to original 'b'

let maxCombinedCount = 0;

const mostFrequentA = sortedOriginalOdds[0];
const secondMostFrequentA = sortedOriginalOdds[1];
const mostFrequentB = sortedOriginalEvens[0];
const secondMostFrequentB = sortedOriginalEvens[1];

// The original code implicitly assumes `mostFrequentA` and `mostFrequentB` exist.
// If they are undefined (e.g., for `totalElementsCount = 1`), accessing `.value` will throw a TypeError,
// which this structure preserves for exact behavioral equivalence.
if (mostFrequentA.value !== mostFrequentB.value) {
    // Case 1: The most frequent value from the 'A' group is different from the most frequent value from the 'B' group.
    // We can use both of these most frequent values.
    maxCombinedCount = mostFrequentA.count + mostFrequentB.count;
} else {
    // Case 2: The most frequent value from the 'A' group is the same as the most frequent value from the 'B' group.
    // We cannot use both as they must be different. We must replace one of them with its second most frequent alternative.

    // Option A: Keep the most frequent 'A' value, and use the second most frequent 'B' value (if available, else 0).
    const optionA_sum = mostFrequentA.count + (secondMostFrequentB ? secondMostFrequentB.count : 0);

    // Option B: Keep the most frequent 'B' value, and use the second most frequent 'A' value (if available, else 0).
    const optionB_sum = (secondMostFrequentA ? secondMostFrequentA.count : 0) + mostFrequentB.count;

    // We choose the option that results in a higher combined count (meaning fewer changes).
    maxCombinedCount = Math.max(optionA_sum, optionB_sum);
}

const minimumChanges = totalElementsCount - maxCombinedCount;

console.log(minimumChanges);
