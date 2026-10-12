function GenerateCombinations() {
  // This object will store unique sorted digit combinations as keys.
  // The value 'true' is arbitrary, just indicating presence.
  let combinationSet = {};

  // First set of number strings for combinations.
  const firstDigitGroups = "123,234,345,456,567,678,789,111,222,333,444,555,666,777,888,999".split(",");

  // Second set of number strings for combinations.
  const secondDigitGroups = "11,22,33,44,55,66,77,88,99".split(",");

  // Iterate through all possible combinations of these groups.
  // There are 16 options for each of the first four parts, and 9 for the last.
  for (let idx1 = 0; idx1 < 16; idx1++) {
    for (let idx2 = 0; idx2 < 16; idx2++) {
      for (let idx3 = 0; idx3 < 16; idx3++) {
        for (let idx4 = 0; idx4 < 16; idx4++) {
          for (let idx5 = 0; idx5 < 9; idx5++) {
            // Concatenate the selected number strings.
            let currentCombinationString = firstDigitGroups[idx1] + firstDigitGroups[idx2] + firstDigitGroups[idx3] + firstDigitGroups[idx4] + secondDigitGroups[idx5];

            // Convert the combined string into an array of numbers, sort them,
            // and then join them back into a sorted string.
            currentCombinationString = currentCombinationString
              .split("")
              .map(Number)
              .sort(function(valA, valB) {
                return valA - valB;
              })
              .join("");

            // Add the sorted string to our set of combinations.
            combinationSet[currentCombinationString] = true;
          }
        }
      }
    }
  }
  // Return the object containing all unique sorted combinations.
  return combinationSet;
}

// Precompute the set of valid patterns.
const precomputedPatterns = GenerateCombinations();

// Read all input from standard input.
const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the input into an array of lines, removing any leading/trailing whitespace from the whole input.
let inputLines = rawInputData.trim().split("\n");

// Process each line of input until there are no more lines.
while (true) {
  // If the input array is empty, break the loop.
  if (inputLines.length === 0) {
    break;
  }

  // Get the next line from the input.
  const currentLine = inputLines.shift();

  // This array will store the digits that satisfy the conditions for the current line.
  let possibleDigits = [];

  // Iterate through possible digits from 0 to 8.
  for (let digitCandidate = 0; digitCandidate < 9; digitCandidate++) {
    // Convert the current input line string into an array of numbers.
    let processedDigits = currentLine.split("").map(Number);

    // Add the current candidate digit to the array.
    processedDigits.push(digitCandidate);

    // Sort the array of digits in ascending order.
    processedDigits.sort(function(num1, num2) {
      return num1 - num2;
    });

    // Initialize an array to count the frequency of each digit (0-8).
    let digitCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0];

    // Count occurrences of each digit.
    processedDigits.forEach(function(currentDigit) {
      digitCounts[currentDigit]++;
    });

    // Find the maximum frequency of any digit.
    const maxFrequency = Math.max.apply(null, digitCounts);

    // If any digit appears 5 or more times, this combination is invalid; skip to the next candidate.
    if (maxFrequency >= 5) {
      continue;
    }

    // Check if the sorted digit combination (as a string) exists in our precomputed set.
    if (precomputedPatterns.hasOwnProperty(processedDigits.join(""))) {
      // If it exists, add the candidate digit to our list of possible digits.
      possibleDigits.push(digitCandidate);
    }
  }

  // Output the results. If no possible digits were found, print "0".
  // Otherwise, print the possible digits separated by spaces.
  console.log((possibleDigits.length === 0) ? "0" : possibleDigits.join(" "));
}
