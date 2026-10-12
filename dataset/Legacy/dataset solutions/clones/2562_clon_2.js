'use strict';

const processInput = rawData => {
  // Extracting the first two numbers from the initial line of input
  const numItems = parseInt(rawData[0].split(' ')[0], 10);
  const numOperations = parseInt(rawData[0].split(' ')[1], 10);

  // Converting the second line of input into an array of integers
  let dataArray = rawData[1].split(' ').map(itemValue => parseInt(itemValue, 10));

  // Performing a series of operations as specified by numOperations
  for (let opIndex = 0; opIndex < numOperations; opIndex++) {
    // Finding the position of the largest element in the current array
    let maxIndex = dataArray.indexOf(Math.max.apply(null, dataArray));
    // Halving the value at the found position (integer division)
    dataArray[maxIndex] = Math.floor(dataArray[maxIndex] / 2);
  }

  // Calculating the total sum of all elements in the modified array and logging it
  console.log(dataArray.reduce((accumulator, currentValue) => accumulator + currentValue));
};

// Reading input from standard input and initiating the processing
processInput(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
