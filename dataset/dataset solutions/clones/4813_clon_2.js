function displayMessage(messageContent) {
  console.log(messageContent);
} // Outputs a given string to the console.

function ExecuteProgram(rawData) {
  rawData = rawData.trim();
  // This line was commented out in the original: rawData = rawData.trim().split(" ");
  rawData = rawData.trim().split('\n');
  // Another commented out line: rawData = rawData.trim().split(" ").map((elementValue) => Number(elementValue));
  // Yet another commented out line: rawData = rawData.trim().split("\n").map((elementValue) => Number(elementValue));

  var countElements = Number.parseInt(rawData[0]); // Parses the first line as the total number of elements.
  var numericSequence = rawData[1].split(' ').map((elementValue) => Number(elementValue)); // Parses the second line into an array of numbers.
  var frequencyMap = {}; // Stores counts of each number encountered.

  for (var idx = 0; idx < countElements; idx++) {
    // Iterate through the numeric sequence to build the frequency map.
    if (frequencyMap[numericSequence[idx]] == null) {
      frequencyMap[numericSequence[idx]] = 1; // First occurrence of this number.
    } else if (frequencyMap[numericSequence[idx]] == 1) {
      frequencyMap[numericSequence[idx]]++; // Second occurrence of this number.
    }
  }

  /* This section was originally for handling small input sizes,
   * but it has been commented out in the source.
   * if (countElements === 1) {
   *     displayMessage(1);
   *     return;
   * } else if (countElements === 2) {
   *     displayMessage(2);
   *     return;
   * }
   */

  // displayMessage(frequencyMap); // Debugging line, displaying the element counts.

  numericSequence.sort(); // Arrange the sequence in ascending order.
  numericSequence = numericSequence.filter(function (currentValue, idx, entireArray) {
    // Retain only unique elements from the sorted sequence.
    return entireArray.indexOf(currentValue) === idx;
  });

  var finalResult = 1; // Initialize the computed outcome.

  for (var idx = 0; idx < numericSequence.length; idx++) {
    // Main validation loop for the unique numeric sequence.
    if (countElements % 2 === 1 && numericSequence[idx] === 0) {
      // Special condition check: if total elements count is odd and current element is zero.
      if (frequencyMap[numericSequence[idx]] !== 1) {
        // If zero does not appear exactly once, it's an invalid state.
        displayMessage("0");
        return; // Terminate early.
      }
      continue; // Move to the next element as zero has been handled.
    }

    // For all other elements, they must appear exactly twice.
    if (frequencyMap[numericSequence[idx]] !== 2) {
      displayMessage("0");
      return; // Terminate early.
    }
  }

  if (countElements % 2 === 1) {
    // If the initial count was odd, remove the first element (which should be zero after sorting and filtering).
    numericSequence.shift();
  }

  for (var idx = 0; idx < numericSequence.length; idx++) {
    // Multiply the result by 2, applying modulo to prevent overflow.
    finalResult = (finalResult * 2) % 1000000007;
  }

  displayMessage(finalResult); // Output the final calculated result.
}

ExecuteProgram(require('node:fs').readFileSync('/dev/stdin', 'utf8')); // Read input from standard input and process.