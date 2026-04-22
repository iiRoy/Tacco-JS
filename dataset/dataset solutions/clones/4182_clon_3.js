// This script processes input data from standard input to determine the minimum cost
// required to reduce the number of distinct elements in a given list to a specified target.

// --- Stage 1: Input Acquisition and Initial Parameter Parsing ---

// Utilize Node.js's file system module to synchronously read all data
// from standard input, typically piped from another process or file.
const inputBuffer = require('fs').readFileSync('/dev/stdin', 'utf8');

// Normalize the input: remove any leading/trailing whitespace and split into individual lines.
const allInputLines = inputBuffer.trim().split('\n');

// The first line of input provides two critical parameters:
// 1. The total quantity of elements in the subsequent data array.
// 2. The maximum allowed number of unique element types after processing.
// These are parsed as numbers.
const primaryConfiguration = allInputLines.shift().split(' ').map(Number);
const totalElementQuantity = primaryConfiguration[0];
const desiredUniqueCount = primaryConfiguration[1];

// The second line contains the actual list of elements,
// which are also parsed as numbers.
const dataElementsArray = allInputLines.shift().split(' ').map(Number);


// --- Stage 2: Element Frequency Analysis and Uniqueness Tracking ---

// A Map is employed for efficient storage and retrieval of each element's occurrence count.
// Keys are the elements themselves, and values are their respective frequencies.
const elementOccurrenceMap = new Map();

// A Set is used to maintain a collection of all unique elements encountered,
// providing a direct count of distinct types.
const uniqueElementSet = new Set();

// Iterate through each element in the input array to build our frequency map and unique set.
for (const currentElementVal of dataElementsArray) {
    // Update the frequency count for the current element.
    // If the element hasn't been seen before, its count starts at 1; otherwise, it's incremented.
    elementOccurrenceMap.set(currentElementVal, (elementOccurrenceMap.get(currentElementVal) || 0) + 1);

    // Add the element to the set. Sets automatically handle uniqueness,
    // so adding an existing element has no effect.
    uniqueElementSet.add(currentElementVal);
}

// Capture the total number of distinct element types currently present.
const currentUniqueElementTotal = uniqueElementSet.size;


// --- Stage 3: Decision-Making and Minimum Cost Calculation ---

// Check if the current number of unique elements already meets or falls below the desired target.
// If so, no removal operations are necessary, and the cost is zero.
if (currentUniqueElementTotal <= desiredUniqueCount) {
    console.log(0);
} else {
    // If there are more unique elements than desired, we must eliminate some.
    // Calculate the exact number of distinct element types that need to be removed.
    const distinctTypesToEliminate = currentUniqueElementTotal - desiredUniqueCount;

    // To minimize the cost of removal, we should eliminate the element types
    // that appear least frequently. First, extract all frequency counts into a standard array.
    const allFrequencyValues = Array.from(elementOccurrenceMap.values());

    // Sort these frequencies in ascending order. This allows us to easily pick the smallest ones.
    allFrequencyValues.sort((freqOne, freqTwo) => freqOne - freqTwo);

    // Initialize a variable to accumulate the total cost of removing elements.
    let totalEliminationCost = 0;

    // Sum the frequencies of the 'distinctTypesToEliminate' least occurring element types.
    // This sum represents the minimum total count of elements that must be removed.
    for (let i = 0; i < distinctTypesToEliminate; ++i) {
        totalEliminationCost += allFrequencyValues[i];
    }

    // Output the final calculated minimum cost.
    console.log(totalEliminationCost);
}