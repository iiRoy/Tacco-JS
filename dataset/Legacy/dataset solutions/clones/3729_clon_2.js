'use strict';

/*
 * This function processes an input string to generate a specific sequence
 * of numbers and then prints a subset of that sequence.
 */
function processInput(inputString) {
  // Extract the numerical limit from the first line of the input string.
  const limitValue = Number(inputString.split('\n')[0]);

  // Initialize a dynamic collection with some predefined string representations of numbers.
  const resultCollection = [
    '1', '2', '3', '4', '5', '6', '7', '8', '9',
    '19', '29', '39', '49', '59', '69', '79', '89', '99'
  ];

  // Define a set of prefix digits that will be used to construct new numbers.
  const prefixDigits = [
    '2', '3', '4', '5', '6', '7', '8', '9',
    '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'
  ];

  // Initialize a string pattern that will be appended to prefixes.
  let suffixPattern = '99';

  // Loop to generate additional numbers and add them to the collection.
  // The outer loop controls the length of the suffix pattern.
  for (let outerIndex = 0; outerIndex <= 20; outerIndex++) {
    // The inner loop iterates through the prefix digits.
    for (let innerCounter = 0; innerCounter < prefixDigits.length; innerCounter++) {
      // Concatenate a prefix digit with the current suffix pattern and add to the collection.
      resultCollection.push(prefixDigits[innerCounter] + suffixPattern);
    }
    // Extend the suffix pattern by appending another '9' for the next iteration.
    suffixPattern += '9';
  }

  // Extract a portion of the generated collection based on the limit value,
  // then join the elements with newline characters.
  const finalOutput = resultCollection.slice(0, limitValue).join('\n');

  // Print the final formatted string to the console.
  console.log(finalOutput);
}

// Read input from standard input and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
