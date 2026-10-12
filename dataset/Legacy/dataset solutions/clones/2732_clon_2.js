'use strict';

// This function processes the given raw data
function processInput(rawData) {
  // Split the input string into an array of tokens
  const tokenArray = rawData.trim().split(' ');

  // Convert the first token to a number
  const valA = Number(tokenArray[0]);
  // Convert the second token to a number
  const valB = Number(tokenArray[1]);
  
  // Calculate and print the ceiling of a / (b * 2)
  console.log(Math.ceil(valA / (valB * 2)));
}

// Read input from standard input and pass it to the processing function
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
