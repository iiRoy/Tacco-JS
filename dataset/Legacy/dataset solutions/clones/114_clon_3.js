const MAX_INDEX_VALUE_EXCLUSIVE = 100; // The array will hold counts for indices 0 to 99.

let frequencyCounts = Array.from({ length: MAX_INDEX_VALUE_EXCLUSIVE }, () => 0);
let currentMaxFrequency = 0;

const fileSystemHandler = require("fs");
const rawInputContent = fileSystemHandler.readFileSync("/dev/stdin", "utf8");
const inputLines = rawInputContent.split('\n');

inputLines.forEach(function(singleLineText) {
    const numericValueCandidate = parseInt(singleLineText, 10);

    // The original code's `if(+i)` condition means:
    // - It ignores empty strings, non-numeric strings (NaN).
    // - It ignores the number 0 (because +0 is 0, which is falsy).
    // - It implicitly ignores numbers >= MAX_INDEX_VALUE_EXCLUSIVE (100) because
    //   accessing a[100] on an array initialized up to a[99] would result in NaN counts,
    //   which would never be greater than currentMaxFrequency.
    const isValidAndCountable = !isNaN(numericValueCandidate) &&
                                numericValueCandidate >= 1 && // Exclude 0
                                numericValueCandidate < MAX_INDEX_VALUE_EXCLUSIVE; // Exclude 100 and above

    if (isValidAndCountable) {
        frequencyCounts[numericValueCandidate]++;
        const updatedCount = frequencyCounts[numericValueCandidate];
        if (updatedCount > currentMaxFrequency) {
            currentMaxFrequency = updatedCount;
        }
    }
});

// The original code prints all indices whose frequency matches the maximum frequency.
// If no valid numbers were processed, currentMaxFrequency remains 0.
// In this case, all initialized counts (which are 0) will match currentMaxFrequency,
// leading to all indices from 0 to 99 being printed. This is the observed behavior.
frequencyCounts.forEach(function(countValue, indexPosition) {
    if (countValue === currentMaxFrequency) {
        console.log(indexPosition);
    }
});
