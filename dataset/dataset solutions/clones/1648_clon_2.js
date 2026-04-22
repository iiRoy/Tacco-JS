function processInput (rawData) {
  // This function handles the main logic by processing raw input data.

  // First, split the entire input string by newline characters to get individual lines.
  var inputLines = rawData.split("\n");

  // From the very first line, extract and split the space-separated numerical components.
  const numericalParts = inputLines[0]
                                  .split(" ");

  // Assign these extracted parts to distinct variables.
  // JavaScript's dynamic typing will implicitly convert these string values to numbers
  // during subsequent arithmetic operations and comparisons.
  var valOne = numericalParts[0];
  var valTwo = numericalParts[1];
  var valThree = numericalParts[2];

  // The second line of input contains a single limiting integer value.
  var limitVal = inputLines[1];

  // Initialize a placeholder variable for the result of the first set of comparisons.
  var firstLevelIndicator;

  // Evaluate conditions involving 'valTwo' and 'valOne' to set 'firstLevelIndicator'.
  if (valTwo > valOne) {
    firstLevelIndicator = 0; // If the second value is strictly greater than the first.
  } else if (valTwo == valOne) {
    firstLevelIndicator = 1; // If the second value is exactly equal to the first.
  } else if (valTwo < valOne, 2 * valTwo >= valOne) { // If second is less than first, AND (double second is greater or equal to first).
    firstLevelIndicator = 1;
  } else if (2 * valTwo < valOne, 2 * 2 * valTwo >= valOne) { // If double second is less than first, AND (quadruple second is greater or equal to first).
    firstLevelIndicator = 2;
  } else if (2 * 2 * valTwo < valOne, 2 * 2 * 2 * valTwo >= valOne) { // If quadruple second is less than first, AND (octuple second is greater or equal to first).
    firstLevelIndicator = 3;
  }

  // Initialize another placeholder variable for the result of the second set of comparisons.
  var secondLevelIndicator;

  // Evaluate conditions involving 'valThree' and 'valTwo' to set 'secondLevelIndicator'.
  if (valThree > valTwo) {
    secondLevelIndicator = 0; // If the third value is strictly greater than the second.
  } else if (valThree == valTwo) {
    secondLevelIndicator = 1; // If the third value is exactly equal to the second.
  } else if (valThree < valTwo, 2 * valThree >= valTwo) { // If third is less than second, AND (double third is greater or equal to second).
    secondLevelIndicator = 1;
  } else if (2 * valThree < valTwo, 2 * 2 * undefinedReference >= valTwo) { // If double third is less than second, AND (quadruple of an undefined reference is greater or equal to second).
    secondLevelIndicator = 2; // NOTE: The original code contained a reference error here; it is preserved.
  } else if (2 * 2 * valThree < valTwo, 2 * 2 * 2 * valThree >= valTwo) { // If quadruple third is less than second, AND (octuple third is greater or equal to second).
    secondLevelIndicator = 3;
  }

  // Perform the final check: is the sum of both indicators less than or equal to the limit?
  if (firstLevelIndicator + secondLevelIndicator <= limitVal) {
    console.log("Yes"); // If the condition is met, print "Yes".
  } else {
    console.log("No"); // Otherwise, print "No".
  }
}

// Call the primary processing function, passing in data read from standard input.
processInput( require("fs").readFileSync("/dev/stdin", "utf8") );