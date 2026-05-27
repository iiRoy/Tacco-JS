function compareObjects(firstObj, secondObj) {
  // Retrieve all own property names for the first object.
  const firstProps = Object.getOwnPropertyNames(firstObj);
  // Retrieve all own property names for the second object.
  const secondProps = Object.getOwnPropertyNames(secondObj);

  // If the number of properties differs, the objects are not equal.
  if (firstProps.length !== secondProps.length) {
    return false;
  }

  // Iterate through the properties of the first object.
  for (let idx = 0; idx < firstProps.length; idx++) {
    const currentPropName = firstProps[idx];
    // Compare the values of corresponding properties.
    // If any property value is strictly unequal, the objects are not equal.
    if (firstObj[currentPropName] !== secondObj[currentPropName]) {
      return false;
    }
  }

  // If all checks pass, the objects are considered equal.
  return true;
}

/**
 * Parses a string into an integer using base 10.
 * @param {string} inputString - The string to parse.
 * @returns {number} The parsed integer.
 */
function parseInteger(inputString) {
  return parseInt(inputString, 10);
}

// Main execution function for the program.
function executeProgram(programInput) {
  // Parse the input string to an integer.
  const numericValue = parseInteger(programInput);

  // Determine the output based on the parsed value.
  // If the value is less than or equal to 999, print "ABC", otherwise print "ABD".
  console.log(numericValue <= 999 ? "ABC" : "ABD");
}

// Read input from standard input and pass it to the main program function.
executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
