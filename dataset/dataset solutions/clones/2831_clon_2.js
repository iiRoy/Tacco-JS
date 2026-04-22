function PrimaryProcessor(rawData) {
  // Split the raw input string by newline characters
  rawData = rawData.split("\n");

  /*
   * Parse the first line to extract the dimensions.
   * firstSize represents the length of the first sequence.
   */
  var firstSize = parseInt(rawData[0].split(" ")[0]);

  // secondSize represents the length of the second sequence.
  var secondSize = parseInt(rawData[0].split(" ")[1]);

  // Convert the second line into an array of integers for the first sequence.
  var firstSequence = rawData[1].split(" ").map(elementVal => parseInt(elementVal));

  // Convert the third line into an array of integers for the second sequence.
  var secondSequence = rawData[2].split(" ").map(itemNum => parseInt(itemNum));

  // Define a modulus constant for calculations, typically 10^9 + 7.
  var divisorConstant = Math.pow(10, 9) + 7;

  // Initialize a 2D array for dynamic programming, sized (firstSize+1) x (secondSize+1).
  var dynamicTable = new Array(firstSize + 1).fill(0);

  // This array is declared but not utilized in the provided logic; it is kept for structural consistency.
  var cumulativeSums = new Array(firstSize + 1).fill(0);

  // Initialize each row of the dynamic programming table as an array filled with zeros.
  for (var rowIdx = 0; rowIdx < firstSize + 1; rowIdx++) {
    var tempRow = new Array(secondSize + 1).fill(0);
    dynamicTable[rowIdx] = tempRow;
  }

  // Iterate through both sequences to populate the dynamic programming table.
  for (var currentR = 0; currentR < firstSize; currentR++) {
    for (var currentC = 0; currentC < secondSize; currentC++) {
      // If elements at current indices match, update the DP table.
      if (firstSequence[currentR] == secondSequence[currentC]) {
        dynamicTable[currentR + 1][currentC + 1] = (dynamicTable[currentR][currentC + 1] + dynamicTable[currentR + 1][currentC] + 1) % divisorConstant;
      }
      // If elements do not match, calculate based on previous states, adjusting for modulus.
      else {
        dynamicTable[currentR + 1][currentC + 1] = (dynamicTable[currentR][currentC + 1] + dynamicTable[currentR + 1][currentC] + (divisorConstant - dynamicTable[currentR][currentC])) % divisorConstant;
      }
    }
  }

  // The final result is derived from the last cell of the DP table, plus one.
  var finalResult = dynamicTable[firstSize][secondSize] + 1;

  // Output the computed answer to the console.
  console.log('%s', finalResult);

  // Return the calculated final result.
  return finalResult;
}


// Function for local debugging or testing purposes within a web environment.
function validateExecution(testCaseId) {
  // Retrieve the input value from a DOM element identified by 'input' + testCaseId.
  var testInput = document.getElementById("input" + testCaseId).value;

  // Process the input using the main algorithm.
  var calculatedAnswer = PrimaryProcessor(testInput);

  // Initialize the outcome status as "Wrong Answer".
  var outcomeStatus = "WA";

  // Compare the calculated answer with the expected output from a DOM element.
  if (calculatedAnswer == document.getElementById("output" + testCaseId).value.split("\n")[0]) {
    // If they match, set the outcome status to "Accepted".
    outcomeStatus = "AC";
  }

  // Display the outcome status in a designated result element.
  document.getElementById("result" + testCaseId).innerHTML = outcomeStatus;
}


// Execute the primary processing function with input read from standard input in Node.js environment.
PrimaryProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));