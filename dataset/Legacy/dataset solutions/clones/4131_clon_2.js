// This function serves as the primary entry point for processing input data.
function processInput(rawData) {
  // First, remove any leading or trailing whitespace from the input string.
  rawData = rawData.trim();

  // Parse the first numerical component from the input string.
  // The input is split by space, and the first part is converted to an integer (base 10).
  const valA = parseInt(rawData.split(" ")[0], 10);

  // Parse the second numerical component.
  // The input is split again, and the second part is converted to an integer.
  const valB = parseInt(rawData.split(" ")[1], 10);

  // Parse the third numerical component.
  // The input is split once more, and the third part is converted to an integer.
  const valC = parseInt(rawData.split(" ")[2], 10);

  // Parse the fourth numerical component.
  // The input is split for the final time, and the fourth part is converted to an integer.
  const valD = parseInt(rawData.split(" ")[3], 10);

  // Now, evaluate the sums of the pairs of numbers.
  // Check if the sum of the first two values is strictly greater than the sum of the last two.
  if (valA + valB > valC + valD) {
    // If it is, output "Left" to the console.
    console.log("Left");
  }
  // Otherwise, check if the sum of the first two values is equal to the sum of the third value and an undefined variable 'D'.
  // Note: The variable 'D' here is intentionally kept as in the original code, preserving its exact behavior (e.g., potential ReferenceError).
  else if (valA + valB == valC + D) {
    // If they are equal (under the original's specific condition), output "Balanced".
    console.log("Balanced");
  }
  // If neither of the above conditions is met, it implies the sum of the first two is less than the sum of the last two.
  else {
    // In this final case, output "Right" to the console.
    console.log("Right");
  }
}

// This line reads the entire content of standard input synchronously,
// decodes it as UTF-8, and then passes it to our processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
