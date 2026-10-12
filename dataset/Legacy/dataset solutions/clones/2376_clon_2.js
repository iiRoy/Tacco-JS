/*
 * This module processes a given input string to find specific numeric sequences.
 * It identifies how many three-digit numbers (from 000 to 999) can be formed
 * by picking digits sequentially from a longer input digit string.
 */
function processInputData(rawData) {
  // Split the raw input string into individual lines.
  const parsedLines = rawData.split('\n');

  // The first line contains an integer, which is parsed but not used in the core logic.
  const firstNumber = parseInt(parsedLines[0], 10);

  // The second line is a string of digits, converted into an array of integers.
  const sequenceOfDigits = parsedLines[1].split('').map((digitChar) => parseInt(digitChar, 10));

  // Generate all possible three-digit combinations from 000 to 999.
  // Each combination is stored as an array of three integers.
  const potentialCombinations = [];
  for (let idx = 0; idx < 1000; idx++) {
    potentialCombinations.push(
      `00${idx}`.slice(-3).split('').map((numVal) => parseInt(numVal, 10))
    );
  }

  // Initialize a counter for successful matches.
  let matchCount = 0;

  // Iterate through each generated three-digit combination.
  potentialCombinations.forEach((currentCombination) => {
    let comboIndex = 0; // Tracks the current digit position in the combination (0, 1, or 2).

    // Iterate through the main sequence of digits.
    sequenceOfDigits.forEach((currentDigit) => {
      // If the current digit from the main sequence matches the expected digit
      // for the current position in the combination, advance the combination index.
      if (currentDigit === currentCombination[comboIndex]) {
        comboIndex += 1;
        // If all three digits of the combination have been found in sequence,
        // increment the match counter and stop checking this combination.
        if (comboIndex === 3) {
          matchCount += 1;
          return; // Exit the inner forEach for this combination.
        }
      }
    });
  });

  // Output the total number of times a three-digit combination was found.
  console.log(matchCount);
}

// Read input from standard input and pass it to the processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
