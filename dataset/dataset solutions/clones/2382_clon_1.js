/*
 * This file contains the main logic for processing input data.
 * It reads from standard input, parses it, performs calculations,
 * and then outputs a result to the console.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

function Main(input) { // The primary function to handle the program's execution.

  // Split the entire input string by newline characters to get individual lines.
  input = input.split("\n");

  // Parse the first three lines of input, splitting each by space.
  var T = input[0].split(" "); // Represents the first set of parameters.
  var A = input[1].split(" "); // Represents the second set of parameters.
  var B = input[2].split(" "); // Represents the third set of parameters.

  // Extract individual components from the parsed arrays.
  var T0 = T[0]; // First element of T.
  var T1 = T[1]; // Second element of T.

  var A0 = A[0]; // First element of A.
  var A1 = A[1]; // Second element of A.

  var B0 = B[0]; // First element of B.
  var B1 = B[1]; // Second element of B.

  // Perform core calculations based on the extracted values.
  // Ma calculation: T0 multiplied by the difference of A0 and B0.
  var Ma = T0 * (A0 - B0);

  // Mb calculation: (T1 * A1 + Ma) minus (T1 * B1).
  var Mb = (T1 * A1 + Ma) - (T1 * B1);

  /*
   * Conditional logic to determine the final output.
   * This block checks the signs of Ma and Mb, and specific values of Mb.
   */
  if (Math.sign(Ma) == Math.sign(Mb)) { // If Ma and Mb have the same sign (or both are zero).
    console.log(0); // Output 0.
  } else if (Mb == 0) { // If Mb is exactly zero (and signs are different, implying Ma is not zero).
    console.log("infinity"); // Output "infinity".
  } else { // If signs are different, and Mb is not zero.
    // Take the absolute values for further calculations.
    Ma = Math.abs(Ma);
    Mb = Math.abs(Mb);

    // Check for divisibility.
    if (Ma % Mb == 0) { // If Ma is perfectly divisible by Mb.
      console.log((Ma / Mb) * 2); // Output (Ma / Mb) multiplied by 2.
    } else { // If Ma is not perfectly divisible by Mb.
      // Use Math.ceil to round up the division result before calculation.
      console.log(Math.ceil(Ma / Mb) * 2 - 1); // Output (ceiling of Ma / Mb) multiplied by 2, then minus 1.
    }
  }

} // End of Main function.


// Invoke the Main function, reading input from /dev/stdin.
// This is typical for competitive programming environments.
Main(require("fs").readFileSync("/dev/stdin", "utf8")); // Read file synchronously and pass content to Main.