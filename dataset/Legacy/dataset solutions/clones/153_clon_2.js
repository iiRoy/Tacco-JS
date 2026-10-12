(function(rawData) {
  // Process the raw input string into an array of individual lines.
  // Remove any trailing newline character from the input.
  var processedLines = rawData.replace(/\n$/, '').split('\n');

  // Determine the total number of input lines to process.
  var lineCount = processedLines.length;

  // Iterate through each line of the input data.
  for (var lineIndex = 0; lineIndex < lineCount; lineIndex++) {
    // Extract the current line, split it by commas, and convert each part to a number.
    // The 'shift()' method removes the first element from the array and returns it,
    // effectively processing lines one by one from the front of the array.
    var currentNumbers = processedLines.shift().split(',').map(Number);

    // Initialize an object to store the frequency of each number in the current line.
    var numberFrequencies = {};

    // Count the occurrences of each number.
    for (var numIndex = 0; numIndex < currentNumbers.length; numIndex++) {
      var currentNum = currentNumbers[numIndex];
      if (currentNum in numberFrequencies) {
        // If the number is already a key, increment its count.
        numberFrequencies[currentNum]++;
      } else {
        // Otherwise, initialize its count to 1.
        numberFrequencies[currentNum] = 1;
      }
    }

    // Initialize an array to group numbers by their frequency.
    // The index of this array will represent the frequency count,
    // and the value will be an array of numbers that have that frequency.
    var groupedByFrequency = [];

    // Populate the groupedByFrequency array.
    for (var freqKey in numberFrequencies) {
      var count = numberFrequencies[freqKey];
      if (groupedByFrequency[count]) {
        // If an array already exists for this frequency, push the number into it.
        groupedByFrequency[count].push(freqKey);
      } else {
        // Otherwise, create a new array for this frequency and add the number.
        groupedByFrequency[count] = [freqKey];
      }
    }

    // Evaluate the hand based on the grouped frequencies and print the result.
    console.log(evaluateHand(groupedByFrequency));
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read input from standard input.

/**
 * Evaluates a hand of cards based on their frequency groupings.
 * @param {Array<Array<string>>} frequencyGroups - An array where index `i` contains
 *   an array of card values that appear `i` times.
 * @returns {string} The name of the hand (e.g., 'four card', 'straight', 'null').
 */
function evaluateHand(frequencyGroups) {
  // Check for 'four card' (four cards of the same rank).
  if (frequencyGroups[4]) {
    return 'four card';
  }

  // Check for 'full house' (three of a kind and a pair).
  if (frequencyGroups[3] && frequencyGroups[2]) {
    return 'full house';
  }

  // Check for 'straight' (five unique cards in sequence).
  // This condition also covers cases that might be 'null' if not a straight.
  if (frequencyGroups[1] && frequencyGroups[1].length === 5) {
    // Get the unique cards and convert them to numbers, then sort them.
    var uniqueCards = frequencyGroups[1];
    uniqueCards = uniqueCards.map(Number).sort(function (valA, valB) {
      return valA - valB; // Sort in ascending order.
    });

    // Specific check for a high-card 'null' condition, as per original logic.
    // This might be for cases like 10, J, Q, K, A where A is treated as 1.
    // If the lowest card is greater than 9, it's not a standard straight.
    if (uniqueCards[0] > 9) {
      return 'null';
    }

    // Check for a specific 'straight' pattern (e.g., 10, J, Q, K, A).
    // Assuming A can be 1 or 14, this check specifically looks for 10 as the second card.
    if (uniqueCards[1] === 10) {
      return 'straight';
    }

    // General straight check: ensure each card is one greater than the previous.
    if (uniqueCards[1] === uniqueCards[0] + 1 &&
      uniqueCards[2] === uniqueCards[1] + 1 &&
      uniqueCards[3] === uniqueCards[2] + 1 &&
      uniqueCards[4] === uniqueCards[3] + 1
    ) {
      return 'straight';
    }
  }

  // Check for 'three card' (three cards of the same rank).
  if (frequencyGroups[3]) {
    return 'three card';
  }

  // Check for 'two pair' (two distinct pairs).
  if (frequencyGroups[2] && frequencyGroups[2].length === 2) {
    return 'two pair';
  }

  // Check for 'one pair' (a single pair).
  if (frequencyGroups[2]) {
    return 'one pair';
  }

  // If none of the above conditions are met, the hand is 'null'.
  return 'null';
}
