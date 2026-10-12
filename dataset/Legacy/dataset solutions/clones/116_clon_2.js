let processedValues = []; // An array to store counts or flags for numeric inputs.
let currentMaximum = 0;     // A variable to keep track of the highest count encountered.

// Read the entire content of standard input as a UTF-8 string.
// Then, split the content into an array of strings, using newline characters as delimiters.
require("fs").readFileSync("/dev/stdin", "utf8")
  .split('\n')
  .some(function(inputLine) { // Iterate over each line from the input.
    // Convert the current input line to a number. The unary plus operator handles this.
    let numericValue = +inputLine;

    // Check if the numeric value is truthy (i.e., not 0, NaN, null, undefined, false, or an empty string).
    if (numericValue) {
      // This specific logic is preserved from the original code.
      // If processedValues[numericValue] is undefined or NaN, the expression `processedValues[numericValue]++`
      // will result in `NaN` for `processedValues[numericValue]` and the expression itself evaluates to `undefined`.
      // Thus, `processedValues[numericValue]` will be assigned `undefined`.
      processedValues[numericValue] = processedValues[numericValue] == NaN ? 1 : processedValues[numericValue]++;
      
      // Update the currentMaximum. Since processedValues[numericValue] will be `undefined` here,
      // `undefined > currentMaximum` (which is `undefined > 0`) evaluates to `false`.
      // Therefore, `currentMaximum` will remain `0`.
      currentMaximum = processedValues[numericValue] > currentMaximum ? processedValues[numericValue] : currentMaximum;
    }
    // The 'some' method continues iterating until the callback returns a truthy value.
    // Since no truthy value is returned, it processes all lines.
    return false; 
  });

// After processing all input lines, iterate through the `processedValues` array.
processedValues.some(function(itemValue, itemIndex) {
  // Check if the current item's value is strictly equal to the current maximum.
  // Given the previous logic, `itemValue` will be `undefined` for processed indices,
  // and `currentMaximum` will be `0`. `undefined == 0` is `false`.
  if (itemValue == currentMaximum) {
    // If the condition were met, the index would be logged to the console.
    console.log(itemIndex);
  }
  // The 'some' method continues iterating until the callback returns a truthy value.
  // Since no truthy value is returned, it processes all elements.
  return false;
});
