"use strict";

const processInput = (inputData) => {
  // Trim leading/trailing whitespace and split the input into lines.
  inputData = inputData.trim().split("\n");

  // Parse the total count of numbers from the first line.
  const elementCount = parseInt(inputData[0].split(" ")[0]);

  // Parse the numbers from the second line, convert to integers, and sort them in ascending order.
  let numberArray = inputData[1]
    .split(" ")
    .map((numVal) => parseInt(numVal))
    .sort((valA, valB) => valA - valB);

  // Initialize an index for iterating through the sorted array.
  let currentIndex = 0;

  // Loop through the array until the end is reached.
  while (currentIndex < elementCount) {
    // If the current number has already been marked for removal, skip it.
    if (numberArray[currentIndex] === -1) {
      currentIndex++;
      continue;
    }

    // Flags to track if a duplicate of the current number is found or if the next valid index is determined.
    let foundDuplicate = false;
    let nextIndexDetermined = false;
    let potentialNextIndex; // Stores the index of the next number to process if it's not a multiple.

    // Iterate through the rest of the array starting from the element after the current one.
    for (let subsequentIndex = currentIndex + 1; subsequentIndex < elementCount; subsequentIndex++) {
      // If the subsequent number is already marked for removal, skip it.
      if (numberArray[subsequentIndex] === -1) continue;

      // Check if the subsequent number is a duplicate of the current number.
      if (numberArray[subsequentIndex] === numberArray[currentIndex]) {
        foundDuplicate = true;
      }

      // Check if the subsequent number is a multiple of the current number.
      if (numberArray[subsequentIndex] % numberArray[currentIndex] === 0) {
        // If it's a multiple, mark it for removal.
        numberArray[subsequentIndex] = -1;
      } else if (!nextIndexDetermined) {
        // If it's not a multiple and we haven't found the next valid starting index yet,
        // set this as the potential next index.
        potentialNextIndex = subsequentIndex;
        nextIndexDetermined = true;
      }
    }

    // If a duplicate of the current number was found, mark the current number for removal as well.
    if (foundDuplicate) numberArray[currentIndex] = -1;

    // Determine the next index to process.
    if (potentialNextIndex) {
      // If a potential next index was found (a number not divisible by the current one),
      // start the next iteration from there.
      currentIndex = potentialNextIndex;
    } else {
      // Otherwise, move to the next sequential index.
      currentIndex++;
    }
  }

  // Filter out all numbers marked -1 and print the count of the remaining unique numbers.
  console.log(numberArray.filter((numVal) => numVal !== -1).length);
};

// Read input from standard input and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
