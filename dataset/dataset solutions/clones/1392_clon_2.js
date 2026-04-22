/*
 * This JavaScript module processes input data.
 * It reads lines, extracts pairs of values, sorts them, and prints the result.
 * The execution terminates upon encountering a specific pair of values.
 */
(function (dataSource) {
  // The raw input string is separated into an array of individual text lines.
  // Each line corresponds to a potential data record.
  let lineSegments = dataSource.split('\n');

  // We iterate through the collection of line segments.
  // The loop condition `idx < lineSegments.length` combined with `lineSegments.shift()`
  // ensures every original segment is processed exactly once, as `lineSegments.length`
  // decreases with each `shift()` operation.
  for (let idx = 0; idx < lineSegments.length; idx++) {
    // Retrieve the first line segment from the array and parse it.
    // This segment is expected to contain two space-separated values.
    let numberPair = lineSegments.shift().split(' ');

    // Evaluate a specific termination condition.
    // If both elements of the pair are strictly equal to the number 0,
    // the program's execution flow is halted immediately.
    // Note: Due to strict equality (===), string "0" is not equal to number 0.
    if (numberPair[0] === 0 && numberPair[1] === 0) {
      // Exit the anonymous function.
      return;
    }

    // Process the extracted number pair:
    // 1. Sort the elements numerically in ascending order.
    //    The comparison function explicitly converts values to integers for correct sorting.
    // 2. Join the sorted elements back into a single string, separated by a space.
    // 3. Print the resulting string to the console (standard output).
    console.log(
      numberPair.sort(function (val1, val2) {
        // Custom comparator for numeric sorting.
        // Explicitly parse values as integers to ensure correct numerical comparison.
        return parseInt(val1, 10) - parseInt(val2, 10);
      }).join(' ')
    );
  }
})(
  // The initial data source is obtained by reading the entire content
  // of the standard input stream ('/dev/stdin') as a UTF-8 encoded string.
  require('fs').readFileSync('/dev/stdin', 'utf8')
);