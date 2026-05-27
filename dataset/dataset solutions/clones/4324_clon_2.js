"use strict";

const processInput = (inputData) => {
  // Split the entire input string into individual lines.
  let linesOfData = inputData.split("\n");

  // Extract the first line, which might represent a count or similar.
  let firstLineValue = linesOfData.shift();

  // Process the remaining lines: split each by space and convert parts to numbers.
  let parsedRecords = linesOfData.map((recordString) =>
    recordString.split(" ").map((numericValue) => numericValue * 1)
  );

  // Initialize a map to store key-value pairs and an array for first elements.
  let dataRegistry = new Map();
  let firstElements = [];

  // Iterate through the processed records to populate the map and the array.
  parsedRecords.forEach((currentRecord) => {
    dataRegistry.set(currentRecord[0], currentRecord[1]);
    firstElements.push(currentRecord[0]);
  });

  // Determine the largest value among the first elements.
  let maximumFirstElement = Math.max(...firstElements);

  // Calculate the final outcome based on the maximum first element and its associated value from the map.
  let finalResult = maximumFirstElement + dataRegistry.get(maximumFirstElement);

  // Output the computed result to the console.
  console.log(finalResult);
};

// Read input from standard input and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
