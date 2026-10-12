var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = fileContent.trim().split("\n");

// Constants for clarity and potential reuse
const LARGE_NUMBER_BASE = 1000000000;
const MAX_LOOKUP_ARRAY_SIZE = 1000000;
const NINE_DIGITS = 9; // For splitting large number strings into high/low parts

// Helper function to find the largest index <= startValue with a non-sentinel value
function findValidLookupIndex(startValue, lookupTable) {
    let currentSearchValue = startValue;
    while (currentSearchValue >= 0 && lookupTable[currentSearchValue] === -1) {
        currentSearchValue--;
    }
    return currentSearchValue;
}

// Helper function for comparing two-part large numbers
function isQueryValueLessThanOrEqualToSum(queryValueParts, sumValueParts) {
    if (queryValueParts[0] < sumValueParts[0]) {
        return true;
    }
    if (queryValueParts[0] === sumValueParts[0] && queryValueParts[1] <= sumValueParts[1]) {
        return true;
    }
    return false;
}

// Process input lines
inputLines.shift(); // Discard the first line (N)

var sortedNumbers = inputLines.shift().split(" ").map(Number);
sortedNumbers.sort(function(numA, numB) { return numA - numB; }); // Sort the array 'a'

inputLines.shift(); // Discard the third line (M)

var queryNumbers = inputLines.shift().split(" ").map(Number); // Array 'b'
var queryStrings = inputLines.shift().split(" "); // Array 'c'

// Initialize cumulative sum lookup table
var cumulativeSumLookup = new Array(MAX_LOOKUP_ARRAY_SIZE).fill(-1);
cumulativeSumLookup[0] = [0, 0]; // Base case: sum for 0 is [0, 0]

var currentCumulativeSum = [0, 0]; // Stores [high_part, low_part] of the running sum

// Calculate prefix sums for sortedNumbers and populate the lookup table
sortedNumbers.forEach(function(numVal) {
    currentCumulativeSum[1] += numVal;
    if (currentCumulativeSum[1] >= LARGE_NUMBER_BASE) {
        currentCumulativeSum[0]++;
        currentCumulativeSum[1] -= LARGE_NUMBER_BASE;
    }
    // Store a copy of the current sum pair at the index corresponding to numVal
    cumulativeSumLookup[numVal] = currentCumulativeSum.slice();
});

// Process each query number
queryNumbers.forEach(function(targetVal, queryIndex) {
    // Find the effective target value for lookup using the helper function
    const effectiveLookupIndex = findValidLookupIndex(targetVal, cumulativeSumLookup);

    // Retrieve the corresponding cumulative sum from the lookup table
    const sumAtEffectiveIndex = cumulativeSumLookup[effectiveLookupIndex];

    // Parse the query string into a two-part large number
    const queryNumString = queryStrings[queryIndex];
    const highPartEndIndex = queryNumString.length - NINE_DIGITS;
    const queryHighPart = parseInt(queryNumString.substring(0, highPartEndIndex), 10);
    const queryLowPart = parseInt(queryNumString.substring(highPartEndIndex), 10);
    const parsedQueryBigInt = [queryHighPart, queryLowPart];

    // Compare the parsed query number with the cumulative sum using the helper function
    const isLessOrEqual = isQueryValueLessThanOrEqualToSum(parsedQueryBigInt, sumAtEffectiveIndex);
    const comparisonResult = isLessOrEqual ? "Yes" : "No";
    
    console.log(comparisonResult);
});
