"use strict";

const processInputData = (rawText) => {
  // Divide the incoming string by spaces into an array of substrings
  const tokenizedInput = rawText.split(" ");

  // Convert the first part of the input to an integer, using base 10
  const valOne = parseInt(tokenizedInput[0], 10);

  // Convert the second part of the input to an integer, using base 10
  const valTwo = parseInt(tokenizedInput[1], 10);

  // Determine the absolute difference between the two numerical values
  const absDifference = Math.abs(valOne - valTwo);

  let loopCounter; // Declare a variable to manage iteration count

  // Begin a loop that iterates from zero up to, but not including, the absolute difference
  for (loopCounter = 0; loopCounter < absDifference; loopCounter++) {
    // Check if the current iteration value is equidistant from both valOne and valTwo
    if (Math.abs(valOne - loopCounter) === Math.abs(valTwo - loopCounter)) {
      // If an equidistant point is found, print it to the console
      console.log(loopCounter);
      break; // Terminate the loop as the solution has been found
    }
  }

  // After the loop, if the loopCounter has reached the absolute difference,
  // it means no equidistant point was found within the specified range.
  if (loopCounter === absDifference) {
    console.log("IMPOSSIBLE"); // Output "IMPOSSIBLE" to indicate no solution
  }
};

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
