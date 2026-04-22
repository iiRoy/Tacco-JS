/*
 * This module provides functions for processing input data
 * and performing dynamic programming calculations.
 */

function ProcessInput ( rawData ) {
  // Split the entire input string by newline characters
  rawData = rawData.split ( "\n" );

  // Parse the first line to get the total quantity of items
  var  quantity  =  Number.parseInt ( rawData[0] ) ;

  // Get the string representation of heights, split by space
  var heightsStr = rawData[1].split ( " " );

  // Get the string representation of amounts, split by space
  var amountsStr = rawData[2].split(" ");

  // Initialize a dynamic programming table (array) with zeros
  // The size is quantity + 1 to accommodate 0-based or 1-based indexing
  var memoTable = new Array(quantity + 1).fill(0);

  var finalResult = 0; // Stores the maximum value found

  // Iterate through each item using a loop counter
  for ( let idx = 0 ; idx < quantity ; idx++ ) {
    // Parse the current item's amount value from its string representation
    var currentAmount = Number.parseInt(amountsStr[idx]);
    // Parse the current item's height value from its string representation
    var currentHeight = Number.parseInt(heightsStr[idx]);

    var tempMaxVal = 0; // This variable is declared but not used, mirroring the original's structure.

    // Calculate an intermediate sum for comparison and potential update
    let calculatedSum = currentAmount + memoTable[currentHeight];

    // Propagate the calculated sum through the DP table from the current height
    for ( let colIdx = currentHeight ; colIdx < quantity + 1 ; colIdx++ ) {
      // If the newly calculated sum is greater than the existing value in the table, update it
      if ( calculatedSum > memoTable[colIdx] ) {
        memoTable[colIdx] = calculatedSum;
      }
      else {
        // If the new sum is not greater, we can stop propagating for this item
        break;
      }
    }
    // Update the overall maximum result based on the current height's DP value
    finalResult = Math.max(finalResult, memoTable[currentHeight]);
  }

  // Output the final computed result to the console for user visibility
  console.log( "%s" , finalResult );
  return finalResult; // Return the final result of the computation
}


// This helper function is designed for testing solutions in a web environment.
function TestSolution (testCaseId) {
  // Retrieve input data for the specific test case from a designated HTML element
  var currentInputText = document.getElementById("input" + testCaseId).value;
  // Call the primary data processing function with the retrieved input
  var computedAnswer = ProcessInput(currentInputText);

  // Initialize the verification status, assuming a "Wrong Answer" by default
  var verificationStatus = "WA";

  // Compare the function's computed answer with the expected output from another HTML element
  if (computedAnswer == document.getElementById("output" + testCaseId).value.split("\n")[0]) {
    verificationStatus = "AC"; // If they match, set status to "Accepted"
  }

  // Display the final verification status in the corresponding result display element
  document.getElementById("result" + testCaseId).innerHTML = verificationStatus;
}

// Immediately execute the main processing function with data read from standard input.
// This is typical for competitive programming environments.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));