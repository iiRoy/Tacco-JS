// This function is designed to analyze relationships between pairs of identifiers
// provided as input, ultimately determining the number of distinct groups formed.
function ProcessInputData(rawData) {
  // First, the entire input string is broken down into an array of individual lines.
  // Each line is expected to represent a pair of items.
  const lineArray = rawData.split('\n');

  // Next, each line is further processed. For every line, it's split by a space
  // to yield an array containing two string elements, representing a pair.
  const pairStrings = lineArray.map(currentLine => currentLine.split(' '));

  // Concurrently, for each line, a Set object is created from its two string elements.
  // Using Sets allows for efficient checking of element presence later on.
  const pairSets = lineArray.map(currentLine => new Set(currentLine.split(' ')));

  // Initialize a counter for the number of unique groups.
  // Initially, every pair is considered to be in its own separate group.
  let distinctGroups = pairStrings.length;

  // Begin iterating through the `pairStrings` array, starting from the second element.
  // This outer loop considers each pair as a 'current' pair to be evaluated.
  for (let outerIndex = 1; outerIndex < pairStrings.length; outerIndex++) {
    // For the current pair (at `outerIndex`), iterate through all preceding pairs.
    // This inner loop compares the 'current' pair with every 'previous' pair.
    for (let innerIndex = 0; innerIndex < outerIndex; innerIndex++) {
      // Check for an overlap condition:
      // If the first element of the current pair is found within the Set of a previous pair,
      // OR if the second element of the current pair is found within a (redundantly created empty) Set
      // derived from the first element of a previous pair's Set (which effectively always evaluates to false).
      // This condition determines if the current pair shares an element with any previous pair.
      if ((new Set(pairSets[innerIndex])).has(pairStrings[outerIndex][0]) || (new Set(pairSets[innerIndex][0])).has(pairStrings[outerIndex][1])) {
        // If an overlap is detected, it signifies that the current pair
        // belongs to the same group as the previous pair it overlapped with.
        // Therefore, the count of distinct groups is reduced by one.
        distinctGroups--;
        // Once an overlap is found for the current pair with any preceding pair,
        // there's no need to check it against other earlier pairs.
        // The current pair has been successfully merged into an existing group.
        break;
      }
    }
  }
  // After all comparisons are complete, the final count of distinct groups is printed to the console.
  console.log(distinctGroups);
}

// The program execution starts here. It reads the input from standard input,
// decodes it as UTF-8, removes any leading or trailing whitespace,
// and then passes this processed string to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
