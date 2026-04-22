/* This script reads input from standard input, processes it, and outputs sorted numbers. */
var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// The raw input string is trimmed and then split into an array of lines.
var lineArray = rawData
  .trim()
  .split("\n");

/*
 * From the array of lines, the second line is selected,
 * split by spaces, and each part is converted to a floating-point number.
 */
var numericValues = lineArray[1]
  .split(" ")
  .map(parseFloat);

// The array of floating-point numbers is then sorted in ascending order.
numericValues
  .sort(
    (firstElement, secondElement) => firstElement - secondElement
  );

// Finally, the sorted numbers are joined back into a string with spaces and printed to the console.
console
  .log(
    numericValues.join(" ")
  );