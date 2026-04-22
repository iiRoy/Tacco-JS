function findPartition(targetValue) {
  // This function checks if the given targetValue allows partitioning the dataArray
  // into at most maxPartitions segments.
  let isFeasible = true;
  let partitionCount = 0;
  let currentSum = 0;

  for (let idx = 0; idx < dataArray.length; idx++) {
    // If any single element is greater than the target value, it's impossible.
    if (targetValue < dataArray[idx]) {
      isFeasible = false;
      break;
    }
    // If adding the current element makes the sum exactly equal to targetValue,
    // we've completed a partition. Reset sum and increment count.
    else if (currentSum + dataArray[idx] === targetValue) {
      currentSum = 0;
      // Only increment partition count if it's not the very last element,
      // as the last element doesn't initiate a *new* partition for subsequent elements.
      if (idx !== dataArray.length - 1) partitionCount++;
    }
    // If adding the current element would exceed the targetValue,
    // start a new partition with the current element.
    else if (currentSum + dataArray[idx] > targetValue) {
      currentSum = dataArray[idx];
      partitionCount++;
    }
    // If adding the current element is still within the targetValue,
    // continue accumulating the sum for the current partition.
    else if (currentSum + dataArray[idx] < targetValue) {
      currentSum += dataArray[idx];
    }

    // If the number of partitions exceeds the allowed maximum, it's not feasible.
    if (partitionCount === maxPartitions) {
      isFeasible = false;
      break;
    }
  }
  return isFeasible;
}

// Global variables for problem context
let maxPartitions;
let dataArray;

// Read all input from standard input
const rawData = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const lineBuffer = rawData.trim().split('\n');

// Process each test case until "0 0" is encountered
while (true) {
  let configLine = lineBuffer.shift();

  // Termination condition for input processing
  if (configLine === '0 0') {
    break;
  }

  // Parse the configuration line for max partitions and number of elements
  configLine = configLine.split(' ').map(Number);
  maxPartitions = configLine[0];
  let numElements = configLine[1];

  // Populate the data array for the current test case
  dataArray = [];
  while (numElements--) {
    dataArray.push(Number(lineBuffer.shift()));
  }

  // Initialize binary search bounds
  let lowerBound = 0;
  let upperBound = 1_500_000; // A reasonable upper limit for the search space, based on problem constraints.

  // Perform binary search to find the minimum possible maximum sum of any partition
  while (true) {
    let midPoint = Math.floor((lowerBound + upperBound) / 2);
    let isFeasible = findPartition(midPoint);

    if (isFeasible) {
      // If midPoint is feasible, try for a smaller value
      upperBound = midPoint - 1;
    } else {
      // If midPoint is not feasible, we need a larger value
      lowerBound = midPoint + 1;
    }

    // Termination condition for binary search
    if (lowerBound > upperBound) {
      // The result is either upperBound + 1 (if the last feasible check was true)
      // or lowerBound (if the last feasible check was false)
      if (isFeasible) {
        console.log(upperBound + 1);
      } else {
        console.log(lowerBound);
      }
      break;
    }
  }
}