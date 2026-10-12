// Read input from standard input, decode as UTF-8, and split into lines.
const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

// Extract the first line, split by space, to get N and K.
const firstLineParts = inputLines.shift().split(' ');

// Parse N (total elements) and K (target unique count).
const totalElements = firstLineParts[0];
const targetUniqueCount = firstLineParts[1];

// Extract the second line, split by space, to get the array of element strings.
const elementStrings = inputLines.shift().split(' ');

// Initialize a frequency map (array where index is element value, value is frequency).
const elementFrequencies = [];
// Initialize an object to track unique elements encountered.
const uniqueElementTracker = {};

// Iterate through the input elements to count frequencies and identify unique ones.
for (let idx = 0; idx < totalElements; idx++) {
    // Increment the frequency for the current element.
    // Use logical OR to initialize to 0 if undefined.
    elementFrequencies[elementStrings[idx]] = (elementFrequencies[elementStrings[idx]] || 0) + 1;
    // Mark the element as seen in the unique tracker.
    uniqueElementTracker[elementStrings[idx]] = 1;
}

// Get an array of distinct element values (keys from the unique tracker).
const distinctValues = Object.keys(uniqueElementTracker);

// Calculate how many unique elements need to be removed to reach targetUniqueCount.
// This is the current number of unique elements minus the desired number.
let elementsToRemove = distinctValues.length - targetUniqueCount;

// If there are more unique elements than desired, we need to remove some.
if (elementsToRemove > 0) {
    // Sort the frequency counts in ascending order.
    // The `elementFrequencies` array, when sorted, will contain only the actual counts,
    // effectively becoming a dense array of frequencies.
    elementFrequencies.sort((valA, valB) => valA - valB);

    // Initialize a variable to sum the frequencies of elements to be removed.
    let removedCountSum = 0;

    // Iterate through the sorted frequencies (smallest first).
    for (const currentFrequency of elementFrequencies) {
        // Add the current smallest frequency to the sum.
        removedCountSum += currentFrequency;
        // Decrement the count of elements still needing removal.
        elementsToRemove--;
        // If we have removed enough unique elements, break the loop.
        if (elementsToRemove === 0) {
            break;
        }
    }
    // Output the total count of elements removed.
    console.log(removedCountSum);
} else {
    // If the number of unique elements is already K or less, no removals are needed.
    console.log(0);
}
