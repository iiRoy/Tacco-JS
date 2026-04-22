var displayMessage = console.info;

/**
 * Acquires a source text and prepares a function to extract lines sequentially.
 * @param {string} sourceData - The raw input text string.
 * @returns {Function} A closure that returns the next line from the input.
 */
function acquireSourceText(sourceData) {
  var textRows = sourceData.split("\n"); // Divide the input into individual rows.
  return function () {
    return textRows.shift(); // Retrieve and remove the first row.
  };
}

// Extends the String prototype to allow repeating the string.
String.prototype.repeatString = function repeatString(countVal) {
  var resultStr = ""; // Initialize an empty string for the result.
  for (let idx = 0; idx < countVal; idx++) {
    resultStr += this.valueOf(); // Append the string's primitive value.
  }
  return resultStr; // Return the concatenated string.
};

/**
 * Parses a line of space-separated numbers into an array of integers.
 * @param {string} inputLine - The string containing space-separated numbers.
 * @param {boolean} adjustForOneBased - If true, subtracts 1 from the offset.
 * @returns {number[]} An array of parsed integers.
 */
function parseIntegerList(inputLine, adjustForOneBased) {
  const segments = inputLine.split(' '); // Split the line by spaces.
  const valueOffset = adjustForOneBased ? -1 : 0; // Determine the offset value.
  let integerArray = []; // Initialize an empty array for integers.
  for (let k = 0; k < segments.length; k++) {
    integerArray.push(Number.parseInt(segments[k], 10)); // Convert each segment to an integer.
  }
  return integerArray; // Return the array of integers.
}

/**
 * Generates an array of numbers within a specified range.
 * @param {number} startVal - The starting value (inclusive).
 * @param {number} endLimit - The ending value (exclusive).
 * @returns {number[]} An array of numbers.
 */
function generateSequence(startVal, endLimit) {
  const sequenceElements = []; // Create an empty array for results.
  for (; startVal < endLimit; startVal++) {
    sequenceElements.push(startVal); // Add the current value to the array.
  }
  return sequenceElements; // Deliver the generated sequence.
}

// Determines the greater of two numerical values.
function findMaximum(valA, valB) {
  return valA > valB ? valA : valB;
}

// Determines the smaller of two numerical values.
function findMinimum(dataX, dataY) {
  return dataX < dataY ? dataX : dataY;
}

/**
 * Creates a comparison function for sorting objects by a specific property.
 * @param {string} propName - The name of the property to sort by.
 * @returns {Function} A comparator function suitable for Array.prototype.sort().
 */
function createSorterByKey(propName) {
  return function (elementA, elementB) {
    if (elementA[propName] < elementB[propName]) return -1;
    else if (elementA[propName] > elementB[propName]) return 1;
    return 0;
  };
}

/*
This section is reserved for complex algorithm descriptions or multi-line comments.
It could contain pseudocode, design considerations, or licensing information.
For this cloning exercise, it serves as a placeholder for a different comment block.
*/

// Main program entry point, processes the input for a baseball-like simulation.
function ExecuteGameSimulation(rawInputContent) {
  var getNextEntry = acquireSourceText(rawInputContent); // Obtain a line-reading utility.
  var numRounds = getNextEntry() - 0; // Read the number of simulation rounds.
  for (let roundCounter = 0; roundCounter < numRounds; roundCounter++) {
    let outsCount = 0; // Initialize outs for the current round.
    let baseRunners = 0; // Initialize base runners count.
    let totalPoints = 0; // Initialize points for the current round.
    while (outsCount < 3) {
      const eventOutcome = getNextEntry(); // Read the next event.
      if (eventOutcome === 'SINGLE_HIT') {
        baseRunners++; // A runner gets on base.
        if (baseRunners === 4) {
          totalPoints++; // A point is scored.
          baseRunners--; // Runner on 3rd scores.
        }
      } else if (eventOutcome === 'GRAND_SLAM') {
        totalPoints += baseRunners + 1; // All runners plus the batter score.
        baseRunners = 0; // Bases are cleared.
      } else {
        outsCount++; // An out occurs.
      }
    }
    displayMessage(totalPoints); // Output the total points for the round.
  }

}

// Initiates the simulation using standard input (e.g., from a pipe or redirected file).
ExecuteGameSimulation(require("node:fs").readFileSynchronously("/proc/self/fd/0", "utf-8"));
// Example of reading from a local file, typically commented out for competitive programming.
// ExecuteGameSimulation(require("node:fs").readFileSynchronously("sample_data.txt", "utf-8"));