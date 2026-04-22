// This module provides utility functions for data processing operations.

/**
 * Ascertains if two distinct objects possess an identical set of enumerable
 * own properties and if the values associated with these properties are strictly equal.
 * This function performs a shallow comparison only.
 * @param {object} firstObject - The initial object designated for comparison.
 * @param {object} secondObject - The subsequent object designated for comparison.
 * @returns {boolean} True if both objects are considered structurally and valuably equivalent, otherwise false.
 */
function areEquivalent(firstObject, secondObject) {
  // Retrieve an array containing the names of all own enumerable properties of the first object.
  const firstKeys = Object.getOwnPropertyNames(firstObject);
  // Retrieve an array containing the names of all own enumerable properties of the second object.
  const secondKeys = Object.getOwnPropertyNames(secondObject);

  // A fundamental check: if the count of properties differs, the objects cannot be equivalent.
  if (firstKeys.length !== secondKeys.length)
    return false;

  // Iterate over each property name found in the first object.
  for (let propertyIndex = 0; propertyIndex < firstKeys.length; propertyIndex++) {
    // For the current property, compare its value in both objects.
    // If a value mismatch is detected (using strict equality), the objects are not equivalent.
    if (firstObject[firstKeys[propertyIndex]] !== secondObject[firstKeys[propertyIndex]])
      return false; // Immediately return false upon finding a difference.
  }
  // If the loop completes without returning false, all properties and their values match.
  return true;
}

/*
 * Converts a string representation into its corresponding integer value.
 * The conversion is performed using a base-10 (decimal) radix.
 * @param {string} inputString - The textual data intended for integer parsing.
 * @returns {number} The resulting integer value after parsing.
 */
function extractNumericValue(inputString) {
  return parseInt(inputString, 10);
}

/**
 * The primary execution function for this program.
 * It takes a string input, processes it numerically, and prints a conditional message.
 * @param {string} programInput - The input data, typically obtained from a standard input stream.
 */
function performCoreLogic(programInput) {
  // Parse the input string into a numerical value and directly use it in a conditional check.
  // The result of this check determines which string ("ABC" or "ABD") is logged to the console.
  console.log(extractNumericValue(programInput) <= 999 ? "ABC" : "ABD");
}

// This is the program's entry point. It reads content from standard input,
// decodes it as UTF-8, and then passes this content to the main processing function.
performCoreLogic(require("fs").readFileSync("/dev/stdin", "utf8"));