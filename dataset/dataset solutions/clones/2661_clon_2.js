'use strict';

// This function orchestrates the primary data processing flow.
function processInput(rawData) {
  // Split the raw input string into an array of individual lines.
  const inputLines = rawData.split('\n');

  // Remove the last element, which is typically an empty string due to the final newline.
  inputLines.pop();

  // Extract the first line, which might represent a count (though unused in this specific logic).
  const lineCount = inputLines.shift();

  // Pass the remaining lines to the core analysis function.
  analyzeCombinations(inputLines);
}

// This function performs the main logic to find combinations of anagrams.
function analyzeCombinations(dataEntries) {
  // Initialize an object to store the frequency of canonical forms of strings.
  const frequencyMap = {};

  // Iterate over each entry in the provided array of data entries.
  dataEntries.forEach(currentEntry => {
    // Convert the current string to its canonical form by sorting its characters.
    const canonicalForm = currentEntry.split('').sort().join('');

    // Check if this canonical form has been encountered before.
    if (!!frequencyMap[canonicalForm]) {
      // If yes, increment its count.
      frequencyMap[canonicalForm] += 1;
    } else {
      // If no, initialize its count to one.
      frequencyMap[canonicalForm] = 1;
    }
  });

  // Initialize a variable to accumulate the total number of pairs.
  let totalPairs = 0;

  // Iterate over the keys (canonical forms) in the frequency map.
  Object.keys(frequencyMap).forEach(keyForm => {
    // If a canonical form appears two or more times, it can form pairs.
    if (frequencyMap[keyForm] >= 2) {
      // Calculate the number of pairs using the combination formula (n * (n-1) / 2),
      // which is equivalent to factorial(n) / (factorial(2) * factorial(n-2)).
      // Here, it's simplified to factorial(n) / 2 for n >= 2.
      totalPairs = totalPairs + (calculateFactorial(frequencyMap[keyForm]) / 2);
    }
  });

  // Output the final calculated total number of pairs to the console.
  console.log(totalPairs);
}

// A recursive helper function to compute the factorial of a given number.
function calculateFactorial(value) {
  // Base case: factorial of 1 is 1.
  if (value === 1) {
    return 1;
  } else {
    // Recursive step: value multiplied by factorial of (value - 1).
    return value * calculateFactorial(value - 1);
  }
}

// Execute the main processing function by reading input from standard input.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
