// This module is designed to process incoming data from the standard input stream.
// It reads the entire content, breaks it into individual lines,
// and then attempts to convert each line into a numerical representation.

const sourceData = require('fs')
  .readFileSync('/dev/stdin', 'utf8') // Acquire raw data from the standard input.
  .split('\n') // Divide the raw data into an array of string segments, based on newline characters.
  .map(Number); // Transform each string segment into a numerical value.

// Iterate through each numerical element obtained from the input.
sourceData.forEach(function(itemValue) {
  // Evaluate if the current numerical item is not equivalent to the string literal "0 0".
  // Due to JavaScript's type coercion rules, this comparison will always yield true
  // when 'itemValue' is a number (or NaN), as it will never be loosely equal to the string "0 0".
  if (itemValue != "0 0") {
    // Attempt to invoke the 'split' method on the numerical item.
    // This operation will invariably result in a TypeError at runtime,
    // as primitive number types do not possess a 'split' method.
    console.log(itemValue.split(' ').sort().join(' '));
  }
});
