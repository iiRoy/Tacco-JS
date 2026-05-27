const fileSystem = require('fs');

const getNumberFrequencyMap = (numberStringSegment) => {
    const frequencyCounter = {};
    // The original code's `map(Number)` would convert empty strings (from multiple spaces) to 0.
    // We replicate this behavior by not filtering out empty strings before mapping to Number.
    const parsedNumbers = numberStringSegment.split(' ').map(Number);

    for (const currentNumber of parsedNumbers) {
        // Increment count for the number, initializing to 0 if not present.
        frequencyCounter[currentNumber] = (frequencyCounter[currentNumber] || 0) + 1;
    }
    return frequencyCounter;
};

const processInputAndCompareFrequencies = () => {
    // Read the entire standard input as a UTF-8 string.
    const fullInputContent = fileSystem.readFileSync("/dev/stdin", "UTF-8");

    // Split the content into an array of lines.
    const inputContentLines = fullInputContent.split('\n');

    // The first line contains an integer, which is read but not used in the logic.
    const _discardedFirstValue = Number(inputContentLines[0]);

    // The second line contains space-separated numbers for the first collection.
    const firstCollectionString = inputContentLines[1];
    const countsOfFirstCollection = getNumberFrequencyMap(firstCollectionString);

    // The third line contains another integer, also read but not used.
    const _discardedSecondValue = Number(inputContentLines[2]);

    // The fourth line contains space-separated numbers for the second collection.
    const secondCollectionString = inputContentLines[3];
    const countsOfSecondCollection = getNumberFrequencyMap(secondCollectionString);

    // Iterate through each unique number found in the second collection.
    const uniqueNumbersInSecondCollection = Object.keys(countsOfSecondCollection);

    for (const numberKey of uniqueNumbersInSecondCollection) {
        const numericValue = Number(numberKey); // Convert key back to number for comparison.

        // Get the count of the current number in the first collection.
        // If the number is not present, its count is effectively 0.
        const countInFirst = countsOfFirstCollection[numericValue] || 0;

        // Get the count of the current number in the second collection.
        const countInSecond = countsOfSecondCollection[numericValue];

        // If the count of any number in the second collection exceeds its count
        // in the first collection, the condition is not met.
        if (countInSecond > countInFirst) {
            console.log("NO");
            return; // Exit immediately upon finding a mismatch.
        }
    }

    // If the loop completes without returning, all numbers in the second collection
    // satisfy the count condition relative to the first collection.
    console.log("YES");
};

// The original code was a webpack-like bundle where the outer `module.exports`
// ended up being an empty object `{}` because the entry module (module 0)
// did not explicitly export anything.
// We replicate this by setting `module.exports` to an empty object.
module.exports = {};

// The original bundle immediately executed its main logic.
// We also immediately invoke our main logic function.
processInputAndCompareFrequencies();
