"use strict";

// This script processes a string of numbers to calculate a specific value.
const processInput = (inputString) => {
  // Split the input string by spaces and convert each part to a number.
  let numericValues = inputString.split(" ").map((item) => Number(item));

  // Extract individual numeric components from the parsed array.
  let firstValue = numericValues[0]; // Represents the 'member' count
  let secondValue = numericValues[1]; // Represents the 'train' cost per member
  let thirdValue = numericValues[2]; // Represents the 'taxi' flat fare

  // Calculate the minimum cost between taking the train or a taxi.
  // The cost for the train is (firstValue * secondValue).
  // The cost for the taxi is (thirdValue).
  let finalResult =
    firstValue * secondValue > thirdValue ? thirdValue : firstValue * secondValue;

  // Output the computed minimum cost to the console.
  console.log(finalResult);
};

// Read the input from standard input and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
