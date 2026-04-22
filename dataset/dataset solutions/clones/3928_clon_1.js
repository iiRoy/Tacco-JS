/*
 * This is a JavaScript program designed to solve a specific problem.
 * It reads input, processes it, and then prints the result.
 * Version 1.0 - Type I clone demonstrating extensive whitespace and comment variations.
 */

// Define the main function that encapsulates the core logic.
function Main(s) {

  // Split the input string 's' by newline characters to get an array of lines.
  s = s.split("\n");

  // The first line of input (s[0]) contains the number 'n'.
  // Convert it to a number using the unary plus operator.
  const n = +s[0];

  // Initialize 'ans' (answer) to 0. This will accumulate a sum.
  var ans = 0;

  // Initialize 'm' (minimum) to a very large number (1e10).
  // This value will be used to track a minimum value later.
  var m = 1e10;

  // Loop 'n' times to process the subsequent lines of input.
  for (var i = 0; i < n; i++) {
    // For each iteration, get the (i+1)-th line of input.
    // Split it by spaces, then map each part to a number.
    // Store the resulting array of numbers in 'a'.
    var a = s[i + 1].split(" ").map(a => +a);

    // Check if the first element of 'a' is greater than the second.
    // If it is, update 'm' to be the minimum of its current value and a[1].
    if (a[0] > a[1]) {
      m = Math.min(m, a[1]);
    }

    // Add the first element of 'a' to 'ans'.
    ans += a[0];
  }

  /*
   * After the loop, perform a final check on 'm'.
   * If 'm' is still its initial large value (1e10),
   * it means the condition `a[0] > a[1]` was never met.
   * In this case, set 'ans' to 0.
   * Otherwise, subtract 'm' from 'ans'.
   */
  if (m === 1e10) {
    ans = 0;
  } else {
    ans -= m;
  }

  // Print the final calculated answer to the console.
  console.log(ans);
}


// Call the Main function with input read from standard input.
// This part reads the entire content of /dev/stdin as a UTF-8 string.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));