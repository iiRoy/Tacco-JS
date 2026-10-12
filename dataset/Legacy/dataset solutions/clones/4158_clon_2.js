"use strict"; // Enforce strict mode for the entire script.

// This function serves as the primary entry point for processing input data.
const processInput = (inputData) => {
  // First, clean up the input string by removing leading/trailing whitespace,
  // then split it into an array of strings based on newline characters.
  inputData = inputData.trim().split("\n");

  // The first line of input is parsed as an integer, representing the total count of items.
  const itemCount = parseInt(inputData[0], 10); // Using radix 10 for clarity.

  // The second line contains space-separated numbers. These are split into an array of strings,
  // and then each string is converted into an integer.
  const dataArray = inputData[1].split(" ").map((numericString) => parseInt(numericString, 10));

  // A Set is utilized to efficiently extract all unique elements from the 'dataArray'.
  const uniqueElementsSet = new Set(dataArray);
  // The unique elements are then spread into a new array for easier iteration.
  const distinctValues = [...uniqueElementsSet];

  // Initialize a variable to accumulate the final computed result.
  let finalResult = 0;

  // Create a frequency map (an array) to store counts of numbers.
  // It's pre-filled with zeros and sized to accommodate numbers up to 100000.
  const frequencyMap = [...Array(100001)].fill(0);

  // Iterate through each element in the original 'dataArray'.
  for (let currentIdx = 0; currentIdx < itemCount; currentIdx++) {
    // If an element's value exceeds the maximum index of our frequency map,
    // it's counted directly towards the final result.
    if (dataArray[currentIdx] > 100000) {
      finalResult++;
    } else {
      // Otherwise, increment the count for that specific number in the frequency map.
      frequencyMap[dataArray[currentIdx]]++;
    }
  }

  // Iterate through the array of distinct values.
  // Note: Using 'for...in' for array iteration is generally not recommended for numeric indices,
  // but it mirrors the original code's structure.
  for (let distinctIdx in distinctValues) {
    // Retrieve the frequency count for the current distinct value from the map.
    let currentCount = frequencyMap[distinctValues[distinctIdx]];

    // This conditional statement is logically redundant because 'currentCount'
    // is always equal to 'frequencyMap[distinctValues[distinctIdx]]'.
    // Therefore, the condition 'currentCount < frequencyMap[distinctValues[distinctIdx]]'
    // will always evaluate to false, and the 'else' block will always execute.
    if (currentCount < frequencyMap[distinctValues[distinctIdx]]) {
      finalResult += currentCount; // This line of code is never reached.
    } else {
      // This block always executes, effectively adding zero to 'finalResult'
      // because 'currentCount - frequencyMap[distinctValues[distinctIdx]]' is always zero.
      finalResult += currentCount - frequencyMap[distinctValues[distinctIdx]];
    }
  }

  // Print the final calculated result to the standard output.
  console.log(finalResult);
};

// Read the entire content of standard input as a UTF-8 string,
// then pass it to the 'processInput' function for execution.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
