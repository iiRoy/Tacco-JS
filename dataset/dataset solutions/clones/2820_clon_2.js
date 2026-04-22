/*
 * This module is designed to ingest raw textual content,
 * parse it into numerical components, and then perform a specific comparison.
 * It demonstrates basic input processing and conditional output logic.
 */
function processInputData(rawData) {

  // A constant array to store the integers extracted from the input.
  // The raw string is first cleaned of peripheral whitespace,
  // then segmented into parts by space characters,
  // and each segment is subsequently converted into a base-10 integer.
  const numericalValues = rawData
    .trim() // Initial cleanup: removes leading and trailing whitespace from the string.
    .split(' ') // Breaks the string into an array of substrings using space as a delimiter.
    .map(item => parseInt(item, 10)); // Transforms each substring 'item' into an integer, specifying base 10.

  // Outputs a result based on a simple relational check between the first two processed numbers.
  // If the first number is greater than or equal to the second, a specific positive integer is logged;
  // otherwise, a zero value is logged.
  console.log(
    numericalValues[0] >= numericalValues[1] ? // Evaluates if the first numerical element is greater than or equal to the second.
    10 : // The value to be printed if the condition above evaluates to true.
    0    // The value to be printed if the condition above evaluates to false.
  );
}


// Invokes the primary data handling function by feeding it content from standard input.
// The Node.js 'fs' (file system) module is utilized here to synchronously read
// the entire content of '/dev/stdin' as a UTF-8 encoded string.
processInputData(
  require("fs")
  .readFileSync("/dev/stdin", "utf8")
);