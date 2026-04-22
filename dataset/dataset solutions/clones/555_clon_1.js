// This JavaScript program processes multiple datasets from standard input.
// It reads input lines, performs calculations, sorts results, and prints the final output.

/*
 * Section 1: Input Acquisition
 * Reads the entire standard input stream.
 */
var input = require('fs').readFileSync('/dev/stdin', 'utf8');

// The input string is first trimmed to remove leading/trailing whitespace,
// then split into an array of strings, with each element representing a line.
var Arr = (input.trim()).split("\n");


// Section 2: Main Processing Loop
// This loop continues indefinitely, processing one test case per iteration,
// until a specific termination condition is met.
while (true) {

  // The first line of each test case contains two space-separated numbers.
  // These numbers (nm[0] and nm[1]) define the parameters for the current case.
  var nm = Arr.shift().split(" ").map(Number);

  // Termination condition check:
  // If both numbers read are 0, it signifies the end of input, and the loop breaks.
  if (nm[0] == 0 && nm[1] == 0) {
    break; // Exit the while loop.
  }

  // Initialize 'arr' which will store 'nm[1]' elements.
  // Each element is a pair: [unique_identifier, accumulated_value].
  var arr = [];
  for (var i = 0; i < nm[1]; i++) {
    arr[i] = [i + 1, 0]; // Identifier starts from 1, initial value is 0.
  }

  /*
   * Section 3: Data Accumulation
   * Reads 'nm[0]' subsequent lines, each containing 'nm[1]' values.
   * These values are added to their corresponding elements in 'arr'.
   */
  for (var i = 0; i < nm[0]; i++) {
    // Read a line, split by space, and convert to an array of numbers.
    var v = Arr.shift().split(" ").map(Number);

    // Iterate through the values in 'v' and add them to the second component
    // of the corresponding sub-array in 'arr'.
    v.forEach(function(val, i) {
      arr[i][1] += val; // Accumulate the value.
    });
  }

  // Section 4: Sorting Logic
  // Sorts the 'arr' based on two criteria:
  // 1. Primary: Descending order of the accumulated value (arr[i][1]).
  // 2. Secondary: Ascending order of the identifier (arr[i][0]) if accumulated values are equal.
  arr.sort(function(a, b) {
    if (a[1] == b[1]) {
      return a[0] - b[0]; // Sort by identifier ascending.
    } else {
      return b[1] - a[1]; // Sort by accumulated value descending.
    }
  });

  // Section 5: Result Extraction and Output
  // Creates a new array 'ans' containing only the identifiers from the sorted 'arr'.
  var ans = [];
  arr.forEach(function(val, i) {
    ans.push(arr[i][0]); // Extract and store the identifier.
  });

  // Prints the elements of 'ans' to the console, joined by single spaces.
  console.log(ans.join(" "));
}

// End of program execution.