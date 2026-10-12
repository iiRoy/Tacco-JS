"use strict";

// Function to compute the greatest common divisor (GCD) of all numbers in a given list.
const calculateCommonDivisorForList = (numberList) => {
  let listLength; // Variable to store the length of the input array.
  let currentDivisor; // Accumulator for the GCD.
  let nextNumber; // Current number being processed from the array.

  listLength = numberList.length; // Get the total number of elements.
  currentDivisor = numberList[0]; // Initialize GCD with the first element.

  // Iterate through the rest of the array elements.
  for (let idx = 1; idx < listLength; idx++) {
    nextNumber = numberList[idx]; // Get the next number.
    currentDivisor = findGreatestCommonDivisor(currentDivisor, nextNumber); // Update the GCD.
  }

  return currentDivisor; // Return the final GCD of all elements.
};

// Recursive function to find the greatest common divisor of two integers using the Euclidean algorithm.
const findGreatestCommonDivisor = (val1, val2) => {
  // Base case: if val1 is 0, then val2 is the GCD.
  return val1 ? findGreatestCommonDivisor(val2 % val1, val1) : val2;
};

// Main execution function for the program.
const executeProgram = (inputString) => {
  // Process the raw input string.
  inputString = inputString.trim().split("\n");

  // Parse N and K from the first line of input.
  const countElements = parseInt(inputString[0].split(" ")[0]); // N: number of elements (not directly used after this line).
  const targetValue = parseInt(inputString[0].split(" ")[1]); // K: the target value.

  // Parse the array A from the second line, convert to numbers, and sort in descending order.
  let dataArray = inputString[1]
    .split(" ")
    .map((numStr) => parseInt(numStr))
    .sort((valA, valB) => valB - valA);

  // Determine the maximum element in the array (which is the first element after sorting).
  const maximumElement = dataArray[0];

  // Calculate the GCD of all elements in the array.
  let overallGcd = calculateCommonDivisorForList(dataArray);

  // Check if the maximum element is less than the target value K.
  if (maximumElement < targetValue) {
    console.log("IMPOSSIBLE"); // If so, it's impossible.
    return; // Exit the function.
  }

  // Check if K is a multiple of the overall GCD.
  // If K % overallGcd is 0, it's POSSIBLE; otherwise, it's IMPOSSIBLE.
  console.log(targetValue % overallGcd === 0 ? "POSSIBLE" : "IMPOSSIBLE");
};

// Read input from standard input and execute the main program.
executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
