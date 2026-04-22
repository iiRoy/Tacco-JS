/*
 * This script processes a list of numbers from standard input
 * to find the minimum absolute difference between the sums of two
 * partitions of the list. It's a classic array partitioning problem.
 */
var    fs    =    require('fs');  // Import the Node.js File System module.


// Read all content from '/dev/stdin', interpret it as UTF-8,
// and then split the entire string by newline characters into an array.
var inputs = fs.readFileSync('/dev/stdin', 'utf8').split('\n');


// The first line of input (at index 0) is expected to be a single number.
// Convert this string to a numeric type and store it in the 'num' variable.
var num = Number(inputs[0]);


// The second line of input (at index 1) contains space-separated numbers.
// 1. Split this string by spaces to get an array of number-strings.
// 2. Use the 'map' method to transform each string element 'i' into a Number.
//    The anonymous function `function (i) {Number(i)}` performs this conversion.
var wnums = inputs[1].split(' ').map(function (i) {
                                                  // Converts the string 'i' to a Number.
                                                  return Number(i)
                                                });

// Initialize 'minimum' to null. This variable will hold the smallest
// absolute difference found between the two sums during iteration.
var minimum = null;


// Begin a loop that iterates from t = 1 up to, but not including, 'num'.
// 't' represents the potential split point for the 'wnums' array.
for (var t = 1; t < num; t++) {

  // Calculate the difference between the sum of the first part of 'wnums'
  // and the sum of the second part.
  //
  // First part: wnums.slice(0, t) extracts elements from index 0 to t-1.
  //             .reduce(function(c,i) {return c+i}) sums these elements.
  //
  // Second part: wnums.slice(t) extracts elements from index t to the end.
  //              .reduce(function(c,i) {return c+i}) sums these elements.
  var sub = wnums.slice(0, t).reduce(function(c,i) { return c+i }) - wnums.slice(t).reduce(function(c,i) { return c+i });


  // If the calculated difference 'sub' is negative,
  // convert it to its absolute value by negating it.
  if (sub < 0) {
    sub = -sub; // Make 'sub' positive.
  }

  // Check if 'minimum' is currently null (which happens only on the first iteration)
  // or if the current absolute difference 'sub' is smaller than the 'minimum'
  // value found in previous iterations.
  if (minimum === null || minimum > sub) {
    minimum = sub; // Update 'minimum' with the new, smaller absolute difference.
  }

} // End of the 'for' loop.


// After the loop has completed, 'minimum' will contain the smallest
// absolute difference found across all possible partitions.
// Print this final 'minimum' value to the console.
console.log(minimum);

// End of script execution.