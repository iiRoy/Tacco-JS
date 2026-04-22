function computeQuaternionProduct(
  scalar1, vector1_x, vector1_y, vector1_z,
  scalar2, vector2_x, vector2_y, vector2_z
) {
  // Initialize result components to zero or the first term.
  // We'll build up the values incrementally.
  let productScalar = 0.0;
  let productVectorX = 0.0;
  let productVectorY = 0.0;
  let productVectorZ = 0.0;

  // Calculate the scalar component (real part) of the quaternion product:
  // s1*s2 - v1_x*v2_x - v1_y*v2_y - v1_z*v2_z
  productScalar = scalar1 * scalar2;
  productScalar -= vector1_x * vector2_x;
  productScalar -= vector1_y * vector2_y;
  productScalar -= vector1_z * vector2_z;

  // Calculate the 'i' component (first imaginary part) of the quaternion product:
  // s1*v2_x + v1_x*s2 + v1_y*v2_z - v1_z*v2_y
  productVectorX = scalar1 * vector2_x;
  productVectorX += vector1_x * scalar2;
  productVectorX += vector1_y * vector2_z;
  productVectorX -= vector1_z * vector2_y;

  // Calculate the 'j' component (second imaginary part) of the quaternion product:
  // s1*v2_y - v1_x*v2_z + v1_y*s2 + v1_z*v2_x
  productVectorY = scalar1 * vector2_y;
  productVectorY -= vector1_x * vector2_z;
  productVectorY += vector1_y * scalar2;
  productVectorY += vector1_z * vector2_x;

  // Calculate the 'k' component (third imaginary part) of the quaternion product:
  // s1*v2_z + v1_x*v2_y - v1_y*v2_x + v1_z*s2
  productVectorZ = scalar1 * vector2_z;
  productVectorZ += vector1_x * vector2_y;
  productVectorZ -= vector1_y * vector2_x;
  productVectorZ += vector1_z * scalar2;

  // Return the four components of the resulting quaternion as an array.
  return [productScalar, productVectorX, productVectorY, productVectorZ];
}

/**
 * Parses a single line of space-separated numeric strings into an array of numbers.
 * @param {string} lineInput The string line to parse.
 * @returns {number[]} An array containing the parsed numbers.
 */
const parseNumericLine = (lineInput) => {
  // Ensure the input string is trimmed of leading/trailing whitespace
  // before splitting and mapping to numbers.
  return lineInput.trim().split(" ").map(Number);
};

// Main execution block for processing input.
const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the entire file content into an array of individual lines.
// The .trim() ensures no empty string is left if the file ends with a newline.
let inputLines = fileContent.trim().split("\n");

// The very first line of the input typically specifies the number of test cases.
const numTestCasesString = inputLines.shift(); // Remove and get the first line.
const totalTestCases = parseInt(numTestCasesString, 10); // Convert to integer.

// Perform a basic sanity check on the number of test cases.
if (isNaN(totalTestCases) || totalTestCases < 0) {
    // If the number of test cases is invalid, log an error and exit or handle.
    // For competitive programming, this might just crash or be ignored.
    console.error("Invalid input: Number of test cases is not a valid non-negative integer.");
    process.exit(1); // Exit with an error code.
}

// Loop through each test case as specified by totalTestCases.
for (let currentCaseIdx = 0; currentCaseIdx < totalTestCases; currentCaseIdx++) {
  const currentInputLine = inputLines[currentCaseIdx];

  // Parse the current line of parameters into an array of numbers.
  const quaternionComponents = parseNumericLine(currentInputLine);

  // Validate that we have the expected number of parameters (8 for two quaternions).
  if (quaternionComponents.length !== 8) {
      console.error(`Skipping case ${currentCaseIdx + 1}: Expected 8 numeric parameters, but found ${quaternionComponents.length}.`);
      continue; // Move to the next test case.
  }

  // Call the quaternion multiplication function using the spread operator
  // to pass the array elements as individual arguments.
  const resultQuaternion = computeQuaternionProduct(...quaternionComponents);

  // Format the resulting quaternion components into a space-separated string for output.
  const formattedOutput = resultQuaternion.join(" ");

  // Print the calculated result for the current test case.
  console.log(formattedOutput);
}