// This script reads quaternion data from standard input and performs quaternion multiplication.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: remove whitespace and split into individual lines.
let lineSegments = rawData.trim().split("\n");

// The initial line specifies the total number of quaternion operations to perform.
const numIterations = lineSegments.shift() - 0; // Convert the string count to a numeric value.

// Iterate through each set of quaternion components provided in the input.
for (let loopCounter = 0; loopCounter < numIterations; loopCounter++) {
  // A line containing '0' acts as a termination signal for processing.
  if (lineSegments[loopCounter] == 0) {
    break; // Exit the loop if the termination condition is met.
  }

  // Parse the current line, splitting by spaces and converting all parts to numbers.
  const currentValues = lineSegments[loopCounter].split(" ").map(Number);

  // Extract the components of the first quaternion (q1 = q1_x + q1_y*i + q1_z*j + q1_w*k).
  const q1_x = currentValues[0];
  const q1_y = currentValues[1];
  const q1_z = currentValues[2];
  const q1_w = currentValues[3];

  // Extract the components of the second quaternion (q2 = q2_x + q2_y*i + q2_z*j + q2_w*k).
  const q2_x = currentValues[4];
  const q2_y = currentValues[5];
  const q2_z = currentValues[6];
  const q2_w = currentValues[7];

  // Initialize the components of the resulting quaternion (q_result = result_a + result_i*i + result_j*j + result_k*k).
  // This follows the Hamilton product formula for quaternion multiplication.
  let result_a = q1_x * q2_x;
  let result_i = q1_x * q2_y;
  let result_j = q1_x * q2_z;
  let result_k = q1_x * q2_w;

  // Accumulate terms for the i-component.
  result_i += q1_y * q2_x;
  result_a -= q1_y * q2_y;
  result_k += q1_y * q2_z;
  result_j -= q1_y * q2_w;

  // Accumulate terms for the j-component.
  result_j += q1_z * q2_x;
  result_k -= q1_z * q2_y;
  result_a -= q1_z * q2_z;
  result_i += q1_z * q2_w;

  // Accumulate terms for the k-component.
  result_k += q1_w * q2_x;
  result_j += q1_w * q2_y;
  result_i -= q1_w * q2_z;
  result_a -= q1_w * q2_w;

  // Output the four components of the resulting quaternion, separated by spaces.
  console.log(result_a + " " + result_i + " " + result_j + " " + result_k);
}
