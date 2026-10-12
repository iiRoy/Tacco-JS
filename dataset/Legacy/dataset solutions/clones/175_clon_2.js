function CombinatorialGenerator() {
  // This object will store precomputed valid combinations as keys.
  // The value 'true' is arbitrary, just indicating presence.
  let lookupMap = {};

  // First set of three-digit string segments
  const segmentGroupOne = "012,123,234,345,456,567,678".split(",");
  // Second set of three-digit string segments
  const segmentGroupTwo = "000,111,222,333,444,555,666,777,888".split(",");

  // Combine both sets of segments
  const combinedSegments = segmentGroupOne.concat(segmentGroupTwo);

  // Set of two-digit string segments
  const singleDigits = "00,11,22,33,44,55,66,77,88".split(",");

  // Nested loops to generate all possible combinations
  // The first four loops iterate through 'combinedSegments' (length 16)
  for (let idxA = 0; idxA < 16; idxA++) {
    for (let idxB = 0; idxB < 16; idxB++) {
      for (let idxC = 0; idxC < 16; idxC++) {
        for (let idxD = 0; idxD < 16; idxD++) {
          // The innermost loop iterates through 'singleDigits' (length 9)
          for (let idxE = 0; idxE < 9; idxE++) {
            // Concatenate segments to form a long string
            let currentKeyString =
              combinedSegments[idxA] +
              combinedSegments[idxB] +
              combinedSegments[idxC] +
              combinedSegments[idxD] +
              singleDigits[idxE];

            // Transform the string:
            // 1. Split into individual characters
            // 2. Convert each character to a number
            // 3. Sort the numbers in ascending order
            // 4. Join them back into a string
            currentKeyString = currentKeyString
              .split("")
              .map(Number)
              .sort(function (valX, valY) {
                return valX - valY;
              })
              .join("");

            // Store the sorted string as a key in the lookup map
            lookupMap[currentKeyString] = true;
          }
        }
      }
    }
  }
  // Return the populated lookup map
  return lookupMap;
}

// Precompute the set of valid combinations
const precomputedSet = CombinatorialGenerator();

// Read all input from stdin, assuming UTF-8 encoding
const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");

// Process the input: trim whitespace and split into an array of lines
let inputLines = rawInputData.trim().split("\n");

// Loop indefinitely until all input lines are processed
while (true) {
  // If there are no more lines, exit the loop
  if (inputLines.length === 0) {
    break;
  }

  // Get the next line from the input array
  const currentLineText = inputLines.shift();

  // Array to store the valid completions for the current line
  let possibleCompletions = [];

  // Iterate through possible digit candidates (0 to 8)
  for (let digitCandidate = 0; digitCandidate < 9; digitCandidate++) {
    // Convert the current line string into an array of numbers
    let numericSequence = currentLineText.split("").map(Number);

    // Decrement each number in the sequence by 1
    numericSequence = numericSequence.map(function (originalValue) {
      return originalValue - 1;
    });

    // Add the current digit candidate to the sequence
    numericSequence.push(digitCandidate);

    // Sort the sequence in ascending order
    numericSequence.sort(function (valX, valY) {
      return valX - valY;
    });

    // Initialize a frequency counter array for digits 0-8
    let frequencyCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0];

    // Populate the frequency counter
    numericSequence.forEach(function (elementValue) {
      frequencyCounts[elementValue]++;
    });

    // Find the maximum frequency of any digit
    const maximumFrequency = Math.max.apply(null, frequencyCounts);

    // If any digit appears 5 or more times, this combination is invalid; skip it
    if (maximumFrequency >= 5) {
      continue;
    }

    // Check if the sorted numeric sequence (joined as a string) exists in our precomputed set
    if (precomputedSet.hasOwnProperty(numericSequence.join(""))) {
      // If it exists, add the original digit candidate (plus 1) to our list of possible completions
      possibleCompletions.push(digitCandidate + 1);
    }
  }

  // Print the results for the current line:
  // If no completions were found, print "0".
  // Otherwise, print the completions joined by spaces.
  console.log(possibleCompletions.length === 0 ? "0" : possibleCompletions.join(" "));
}
