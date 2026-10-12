"use strict";

const processInput = (rawInputData) => {
  // Process the incoming string data
  rawInputData = rawInputData.trim().split("\n");

  // Extract the main numeric value from the first line
  const primaryNumber = parseInt(rawInputData[0].split(" ")[0]);

  // Calculate the integer quotient when divided by eleven
  let divisionResult = Math.floor(primaryNumber / 11);

  // Determine the remainder after division by eleven
  let moduloResult = primaryNumber % 11;

  // Output the final computed value based on the algorithm
  console.log(divisionResult * 2 + Math.ceil(moduloResult / 6));
};

// Read input from standard input and pass it to the processing function
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
