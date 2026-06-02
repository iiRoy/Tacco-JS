"use strict";

// This function processes the entire input data.
function ProcessInput(rawData) {
  // Split the raw input string by spaces to get individual values.
  let dataParts = rawData.split(" ");

  // Parse the first three parts as integers.
  let firstNum = parseInt(dataParts[0]);
  let secondNum = parseInt(dataParts[1]);
  let targetRemainder = parseInt(dataParts[2]);

  // Calculate the initial remainder of the first number when divided by the second.
  firstNum = firstNum % secondNum;

  // Initialize a boolean variable to track if a match is found.
  let foundMatch = false;

  // Iterate from 0 up to (but not including) the second number.
  for (let loopIndex = 0; loopIndex < secondNum; loopIndex++) {
    // Check if the product of the current firstNum and loopIndex,
    // when divided by secondNum, yields the targetRemainder.
    if ((firstNum * loopIndex) % secondNum === targetRemainder) {
      // If a match is found, set the flag and exit the loop.
      foundMatch = true;
      break;
    }
  }

  // Output "YES" if a match was found, otherwise "NO".
  if (foundMatch) {
    console.log("YES");
  } else {
    console.log("NO");
  }
}

// Do not modify the code below this line (it handles reading from standard input and calling the main function).
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
