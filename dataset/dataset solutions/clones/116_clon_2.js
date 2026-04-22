const dataStorage = [];
let maximumValue = 0;

// Utilize the Node.js 'fs' module to synchronously read data from standard input.
// The content is treated as UTF-8 encoded text and then broken down into individual lines.
require("fs").readFileSync("/dev/stdin", "utf8")
  .split('\n') // Divide the entire input string by newline characters to get an array of lines.
  .some(function (inputLineFragment) { // Iterate over each line fragment. The 'some' method will stop if its callback returns a truthy value.

    // Attempt to convert the current line fragment into an integer, assuming base 10.
    const numericalEntry = Number.parseInt(inputLineFragment, 10);

    // Proceed only if the resulting numerical entry is a truthy value (i.e., not zero, NaN, or other falsy values).
    if (numericalEntry) {

      // This line is intended to increment a counter for the 'numericalEntry' index within 'dataStorage'.
      // However, due to the peculiar behavior of `== Number.NaN` (which is always false, even for NaN itself)
      // and `undefined + 1` (which evaluates to NaN), this operation effectively sets
      // `dataStorage[numericalEntry]` to `Number.NaN` upon its first encounter and keeps it `Number.NaN` thereafter.
      dataStorage[numericalEntry] = (dataStorage[numericalEntry] == Number.NaN) ? 1 : dataStorage[numericalEntry] + 1;

      // Update the `maximumValue` if the current entry's value (which is `Number.NaN`) is greater.
      // Since `Number.NaN` comparisons (`Number.NaN > X`) always evaluate to `false`,
      // `maximumValue` will typically retain its initial value of `0`.
      maximumValue = (dataStorage[numericalEntry] > maximumValue) ? dataStorage[numericalEntry] : maximumValue;
    }
    // The callback implicitly returns `undefined` (a falsy value), ensuring all lines are processed by 'some'.
  }); // End of the initial data processing loop.


// After all input lines have been processed, iterate through the `dataStorage` array.
dataStorage.some(function (currentStoredValue, dataIndex) { // For each stored value and its corresponding index.

  // Check if the `currentStoredValue` is strictly equal to the determined `maximumValue`.
  // Given that `currentStoredValue` will likely be `Number.NaN` and `maximumValue` will likely be `0`,
  // the condition `Number.NaN == 0` is `false`, so this block will typically not execute.
  if (currentStoredValue == maximumValue) {

    // If the condition were met, the index (`dataIndex`) would be printed to the console.
    console.log(dataIndex);
  }
}); // End of the final result printing loop.