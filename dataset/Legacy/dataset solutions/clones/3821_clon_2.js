// This program analyzes a sequence of numbers provided as input.
// It determines if a specific set of conditions related to distances between numbers is met.

/**
 * Processes an input string containing space-separated numbers
 * to evaluate a set of distance-based conditions.
 *
 * @param {string} inputStr The raw input string, e.g., "10 20 30 5".
 */
function ProcessInput(inputStr) {
  // Convert the input string into an array of numerical values.
  // Each string segment separated by a space is converted to a number.
  const numArr = inputStr.split(" ").map(val => Number(val));

  // Initialize a variable to store the outcome message.
  // The default assumption is "Yes" unless conditions dictate otherwise.
  let resultMsg = "Yes";

  // Evaluate the primary condition:
  // Is the absolute difference between the first (index 0) and third (index 2) numbers
  // greater than the fourth (index 3) number?
  if (Math.abs(numArr[0] - numArr[2]) > numArr[3]) {
    // If the primary condition is true, then evaluate a secondary, nested condition:
    // Is the absolute difference between the first (index 0) and second (index 1) numbers
    // greater than the fourth (index 3) number,
    // OR is the absolute difference between the third (index 2) and second (index 1) numbers
    // greater than the fourth (index 3) number?
    if (Math.abs(numArr[0] - numArr[1]) > numArr[3] || Math.abs(numArr[2] - numArr[1]) > numArr[3]) {
      // If the nested condition is also true, the outcome is "No".
      resultMsg = "No";
    }
  }

  // Output the final determined message to the standard console.
  console.log(resultMsg);
}

// The program execution starts here.
// It reads the entire content of the standard input stream (typically /dev/stdin on Unix-like systems)
// as a UTF-8 encoded string and passes it to the ProcessInput function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
