const rawData = require('fs')
  .readFileSync('/dev/stdin', 'utf8') // Read the standard input stream as a UTF-8 string.
  .split('\n'); // Split the entire input content into an array of strings, one for each line.

console.log(
  rawData.map(function (lineContent) {
    // For each individual line of input, process its numerical values.
    const parsedValues = lineContent.split(' ').map(Number); // Split the line by space and convert each part to a number.

    // Check the first number in the parsed array. If it's zero, return an empty string.
    // Otherwise, generate a rectangular pattern based on the two numbers.
    return parsedValues[0] === 0
      ? '' // Return an empty string if the first value is 0, indicating termination.
      : (function (heightVal, widthVal) {
          // This anonymous function generates a rectangle of '#' characters.
          // First, create a string representing a single row of '#' characters.
          const rowPattern = Array(widthVal + 1).join('#');
          // Then, repeat this row 'heightVal' times, with each row followed by a newline character.
          return Array(heightVal + 1).join(rowPattern.concat('\n'));
        })(parsedValues[0], parsedValues[1]); // Immediately invoke the function with the first two parsed numbers as height and width.
  }).join('\n') // After processing all lines, join the resulting strings (rectangles or empty strings) with newlines.
);
