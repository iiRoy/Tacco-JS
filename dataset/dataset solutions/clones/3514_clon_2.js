/*
 * This script processes input data to determine a specific count
 * based on element frequencies in two interleaved sequences.
 */
const fileContentSource = require("fs").readFileSync("/dev/stdin", "utf8");

// Separate the entire content into individual textual rows
const dataRows = fileContentSource.split('\n');

// Extract the total number of items from the first row, converting it to a numeric type
let totalItemCount = Number(dataRows[0].trim());

// Process the second row: remove whitespace, split by spaces, and convert each part to a number
let numericSequence = dataRows[1].trim().split(' ').map(val => Number(val));

// Initialize objects to store frequencies for elements at odd and even positions
const oddPositionValueFrequencies = {}; // Frequencies for elements at indices 0, 2, 4...
const evenPositionValueFrequencies = {}; // Frequencies for elements at indices 1, 3, 5...

/*
 * Iterate through the numeric sequence, incrementing by two
 * to populate the frequency maps for odd and even positions.
 */
for ( let currentIdx = 0; currentIdx < totalItemCount; currentIdx += 2 )
{
  // For odd positions (0, 2, 4...), update frequency in the first map
  oddPositionValueFrequencies[numericSequence[currentIdx]] = (oddPositionValueFrequencies[numericSequence[currentIdx]] || 0) + 1;

  // For even positions (1, 3, 5...), update frequency in the second map
  evenPositionValueFrequencies[numericSequence[currentIdx + 1]] = (evenPositionValueFrequencies[numericSequence[currentIdx + 1]] || 0) + 1;
}

// Create a list of [value, frequency] pairs for odd-positioned elements
const firstFrequencyPairList = [];
for ( let keyIdentifier in oddPositionValueFrequencies )
{
  firstFrequencyPairList.push( [keyIdentifier, oddPositionValueFrequencies[keyIdentifier]] );
}

// Create a list of [value, frequency] pairs for even-positioned elements
const secondFrequencyPairList = [];
for ( let keyIdentifier2 in evenPositionValueFrequencies )
{
  secondFrequencyPairList.push( [keyIdentifier2, evenPositionValueFrequencies[keyIdentifier2]] );
}

// Sort the first frequency list in descending order based on frequency
firstFrequencyPairList.sort( (pairA, pairB) => pairB[1] - pairA[1] );

// Sort the second frequency list in descending order based on frequency
secondFrequencyPairList.sort( (pairX, pairY) => pairY[1] - pairX[1] );

// Variable to store the maximum achievable sum of frequencies
let optimalSum = 0;

/*
 * Determine the optimal sum of frequencies based on the most frequent elements.
 * If the most frequent elements from both lists are different, sum their frequencies.
 * If they are the same, consider the second most frequent element from one list
 * to avoid using the same value twice.
 */
if ( firstFrequencyPairList[0][0] !== secondFrequencyPairList[0][0] )
{
  // The most frequent elements are distinct, so we can simply sum their frequencies
  optimalSum = firstFrequencyPairList[0][1] + secondFrequencyPairList[0][1];
}
else
{
  // The most frequent elements are identical, we must choose carefully.
  // We compare two scenarios:
  // 1. Most frequent from first list + second most frequent from second list (if available)
  // 2. Second most frequent from first list (if available) + most frequent from second list
  optimalSum = Math.max(
    firstFrequencyPairList[0][1] + (secondFrequencyPairList[1] ? secondFrequencyPairList[1][1] : 0),
    (firstFrequencyPairList[1] ? firstFrequencyPairList[1][1] : 0) + secondFrequencyPairList[0][1]
  );
}

// Output the result: total items minus the optimal sum of frequencies
console.log(totalItemCount - optimalSum);