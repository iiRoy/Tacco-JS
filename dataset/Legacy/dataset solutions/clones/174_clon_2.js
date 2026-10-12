function GenerateCombinations() {
  // This function pre-computes a map of sorted digit combinations.
  // The map stores unique sorted digit sequences as keys, with a boolean value indicating their presence.
  let combinationMap = {};

  // Define the first collection of number strings.
  const firstSet = "123,234,345,456,567,678,789,111,222,333,444,555,666,777,888,999".split(",");
  // Define the second collection of number strings.
  const secondSet = "11,22,33,44,55,66,77,88,99".split(",");

  // Iterate through all possible combinations from the two defined sets.
  // This involves five nested loops to select elements from the sets.
  for (let idx1 = 0; idx1 < 16; idx1++) {
    for (let idx2 = 0; idx2 < 16; idx2++) {
      for (let idx3 = 0; idx3 < 16; idx3++) {
        for (let idx4 = 0; idx4 < 16; idx4++) {
          for (let idx5 = 0; idx5 < 9; idx5++) {
            // Concatenate the selected strings to form a single long string.
            let currentCombinationString = firstSet[idx1] + firstSet[idx2] + firstSet[idx3] + firstSet[idx4] + secondSet[idx5];

            // Process the combined string:
            // 1. Split it into individual digit characters.
            // 2. Convert each character to its numeric representation.
            // 3. Sort the array of numbers in ascending order.
            // 4. Join the sorted numbers back into a single string.
            currentCombinationString = currentCombinationString
              .split("")
              .map(Number)
              .sort(function(valA, valB) {
                return valA - valB;
              })
              .join("");

            // Store the resulting sorted combination string as a key in the map.
            // The value 'true' simply signifies that this combination is valid/generated.
            combinationMap[currentCombinationString] = true;
          }
        }
      }
    }
  }
  return combinationMap; // Return the fully populated map of valid combinations.
}

// Pre-compute the map of valid combinations once at the start.
const precomputedMap = GenerateCombinations();

// Read all input data from standard input, decode as UTF-8.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim whitespace and split into an array of lines.
let inputLines = rawData.trim().split("\n");

// Loop through each line of input until the inputLines array is empty.
while (true) {
  // If there are no more lines to process, break out of the loop.
  if (inputLines.length === 0) {
    break;
  }

  // Retrieve and remove the first line from the input array for processing.
  const currentInputLine = inputLines.shift();

  // Initialize an array to store digits (1-9) that, when added to the current input line,
  // result in a valid combination according to the precomputed map.
  let possibleDigits = [];

  // Iterate through each possible digit from 1 to 9.
  for (let digitCandidate = 1; digitCandidate <= 9; digitCandidate++) {
    // Convert the current input line string into an array of numbers.
    let numericArray = currentInputLine.split("").map(Number);

    // Add the current candidate digit to this numeric array.
    numericArray.push(digitCandidate);

    // Sort the combined array of numbers in ascending order.
    numericArray.sort(function(valA, valB) {
      return valA - valB;
    });

    // Initialize an array to count occurrences of each digit (index 0 for digit 0, etc.).
    let digitCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    // Populate the digitCounts array by iterating through the sorted numeric array.
    numericArray.forEach(function(value) {
      digitCounts[value]++;
    });

    // Find the maximum count of any single digit in the current combination.
    const maxCount = Math.max.apply(null, digitCounts);

    // If any digit appears 5 or more times, this combination is invalid.
    // Skip to the next digit candidate without further processing.
    if (maxCount >= 5) {
      continue;
    }

    // Check if the sorted combination (joined back into a string) exists as a key
    // in the precomputed map.
    if (precomputedMap.hasOwnProperty(numericArray.join(""))) {
      // If it exists, the current digitCandidate is a valid addition.
      possibleDigits.push(digitCandidate);
    }
  }

  // Output the results for the current input line.
  // If no possible digits were found, print "0". Otherwise, print the found digits
  // separated by spaces.
  console.log((possibleDigits.length === 0) ? "0" : possibleDigits.join(" "));
}
