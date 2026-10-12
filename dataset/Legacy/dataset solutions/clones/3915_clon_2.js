"use strict";

const ProcessInput = (rawData) => {
  // Split the input string by spaces and convert each part to a number.
  const parsedNumbers = rawData.split(" ").map((currentElement) => {
    return Number(currentElement); // Explicitly convert to number
  });

  // Extract the three numerical parameters from the parsed array.
  const startRange = Number(parsedNumbers[0]);
  const endRange = Number(parsedNumbers[1]);
  const outputCount = Number(parsedNumbers[2]);

  // Initialize an array to store the numbers within the specified range.
  const sequenceList = [];

  // Populate the sequenceList with integers from startRange to endRange, inclusive.
  for (let currentNum = startRange; currentNum <= endRange; currentNum++) {
    sequenceList.push(currentNum);
  }

  // Calculate the last valid index of the generated sequence.
  const finalIndex = sequenceList.length - 1;

  // Iterate and print the first 'outputCount' elements of the sequence.
  for (let frontIterator = 0; frontIterator <= outputCount - 1; frontIterator++) {
    console.log(sequenceList[frontIterator]);
  }

  // Iterate and print the last 'outputCount' elements of the sequence.
  // The starting index for this loop is calculated to ensure 'outputCount' elements are printed from the end.
  for (let backIterator = finalIndex - outputCount + 1; backIterator <= finalIndex; backIterator++) {
    console.log(sequenceList[backIterator]);
  }
};

// Read the input from standard input and pass it to the processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
