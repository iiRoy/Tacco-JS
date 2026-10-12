'use strict'; // Enforce strict parsing and error handling for the entire script

// Utilize the Node.js file system module to acquire input data.
const inputData = require('fs')
  // Synchronously read the content from the standard input stream.
  .readFileSync('/dev/stdin', 'utf8')
  // Divide the obtained string into an array of substrings, using any whitespace as a delimiter.
  .split(/\s/);

/**
 * Core function to determine the minimum absolute difference between 753 and any 3-digit number
 * formed by consecutive digits within the input string.
 * @param {string[]} dataArray - An array where the first element is the string to be processed.
 */
const processInput = dataArray => {
  // Extract the primary string from the provided input array.
  const targetString = dataArray[0];

  // Initialize an empty array to store all generated 3-character substrings.
  let substringsList = [];

  // Iterate through the target string to generate all possible 3-character sequences.
  // The loop condition ensures that a full 3-character substring can always be extracted.
  for (let idx = 0, limit = targetString.length - 2; idx < limit; idx++) {
    // Append the current 3-character substring to our list.
    substringsList.push(targetString.substr(idx, 3));
    // console.log(substringsList); // This line was commented out in the original, so it remains commented.
  }

  // Employ the reduce method to find the substring (which will be implicitly converted to a number)
  // that has the smallest absolute difference when compared to the constant 753.
  const closestValue = substringsList.reduce((accumulator, currentValue) =>
    Math.abs(accumulator - 753) < Math.abs(currentValue - 753) ? accumulator : currentValue
  );

  // Calculate the final outcome: the absolute difference between the identified closest value and 753.
  const finalResult = Math.abs(closestValue - 753);

  // Display the computed final result to the standard output.
  console.log(finalResult);
};

// Invoke the main processing function, passing the prepared input data.
processInput(inputData);
