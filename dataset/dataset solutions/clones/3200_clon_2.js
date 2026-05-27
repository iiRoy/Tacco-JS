'use strict';

const processInput = (rawData) => {
  // Extract the first numerical value from the input string
  const upperBound = Number(rawData.split('\n')[0].split(' ')[0]);
  // Extract the second numerical value from the input string
  const thresholdValue = Number(rawData.split('\n')[0].split(' ')[1]);

  // Initialize a variable to keep track of odd numbers
  let oddCount = 0;

  // Iterate through numbers, starting from 1, incrementing by 2, up to the upper bound
  for (let loopIndex = 1; loopIndex <= upperBound; loopIndex += 2) {
    oddCount++; // Increment the counter for each odd number encountered
  }

  // Compare the total count of odd numbers with the specified threshold
  if (oddCount > thresholdValue) {
    console.log('YES'); // Output 'YES' if the count exceeds the threshold
  } else {
    console.log('NO'); // Otherwise, output 'NO'
  }
};

// Read the entire content from standard input and pass it to the processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
