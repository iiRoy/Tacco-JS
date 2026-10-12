/*
 * This script processes a given string of data.
 * It parses three numerical values and checks if the third value
 * falls within the inclusive range defined by the first two values.
 */
function ProcessInput(rawData) {
  // Split the incoming string by spaces to get individual components.
  const parsedValues = rawData.split(' ');

  // Extract the three relevant values from the split array.
  const firstVal = parsedValues[0];
  const secondVal = parsedValues[1];
  const checkVal = parsedValues[2];

  // Evaluate the condition: is the third value between the first and second (inclusive)?
  if (checkVal >= firstVal && checkVal <= secondVal) {
    // If the condition is met, output "Yes".
    console.log('Yes');
  } else {
    // Otherwise, output "No".
    console.log('No');
  }
}

// The following line handles reading from standard input and invoking the main processing function.
// It should not be modified to ensure compatibility with the execution environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
