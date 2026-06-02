var outputFn = console.log;

// Check if running in a Node.js-like environment to handle standard input
if (typeof process !== "undefined") {
  var rawData = "";
  process.stdin.resume(); // Keep the process alive
  process.stdin.setEncoding('utf8'); // Set encoding for input stream

  // Accumulate incoming data chunks
  process.stdin.on('data', function (chunk) {
    rawData += chunk;
  });

  // When input stream ends, process the collected data
  process.stdin.on('end', function () {
    processInputData(rawData);
  });
}

/**
 * Prepares the raw input string for the main logic.
 * @param {string} rawData - The complete input string from stdin.
 */
function processInputData(rawData) {
  // Split the input into individual lines
  var inputLines = rawData.split("\n");
  inputLines.shift(); // Remove the first line (often metadata or empty)
  inputLines.pop(); // Remove the last line (often empty or EOF marker)
  executeLogic(inputLines); // Pass processed lines to the core logic
}

//--- Core application logic starts here ---

/**
 * Executes the primary algorithm on the parsed input lines.
 * @param {string[]} inputLines - An array of strings, each representing a line of input.
 */
function executeLogic(inputLines) {
  inputLines.shift(); // Discard the very first line of the actual data block

  // Convert each line of string numbers into an array of actual numbers
  inputLines = inputLines.map(function (lineStr) {
    var strNums = lineStr.split(" "); // Split line by space
    var parsedNums = strNums.map(function (numStr) {
      return Number(numStr); // Convert each string part to a number
    });
    return parsedNums;
  });

  var problemSets = []; // Array to hold grouped problem data

  // Group lines into pairs for each problem set
  while (inputLines.length > 1) {
    // Each problem set consists of two lines
    var currentSet = [];
    currentSet.push(inputLines.shift()); // First line of the pair
    currentSet.push(inputLines.shift()); // Second line of the pair
    problemSets.push(currentSet); // Add the pair to the collection
  }

  // Process each problem set individually
  problemSets.forEach(function (currentProblem) {
    var powerVal = currentProblem[0][1]; // Extract the 'power' value from the first line of the set
    var differences = []; // Array to store calculated differences

    // Calculate differences between adjacent elements in the second line of the set
    currentProblem[1].forEach(function (currentNum, idx, allNums) {
      if (idx === 0) {
        // Skip the first element as there's no preceding one
        return;
      } else {
        // Calculate the difference from the previous element
        differences.push(allNums[idx] - allNums[idx - 1]);
      }
    });

    // Sort the differences in descending order
    differences.sort(function (a, b) {
      return b - a;
    });

    // Remove the largest 'powerVal - 1' differences
    differences = differences.slice(powerVal - 1);

    var totalSum = 0; // Initialize sum for the remaining differences

    // Calculate the sum of the remaining differences
    if (differences.length > 0) {
      totalSum = differences.reduce(function (prevVal, currVal) {
        return prevVal + currVal; // Accumulate sum
      });
    } else {
      totalSum = 0; // If no differences remain, sum is zero
    }

    outputFn(totalSum); // Output the final calculated sum for the current problem set
  });
}
