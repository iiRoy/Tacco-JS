// This module contains functions to solve a specific counting problem.
// The primary function is 'countDivisor', which uses a recursive helper.

function countDivisor (m, d) {
  // This nested helper function `cntDiv` recursively calculates a partial sum.
  // It checks for specific divisor properties based on 'n', 'm', and 'd'.
  function cntDiv(n) {
    // Base case 1: If 'n' exceeds 9, it's out of the defined range, so return 0.
    if (n > 9) {
      return 0;
    }

    // Base case 2: If 'n' squared is already greater than 'm',
    // then 'n' and any subsequent numbers won't be valid divisors of 'm'
    // in the context of this problem's constraints (specifically m/n < 10).
    if (n * n > m) {
      return 0;
    }

    // Core logic: Check if 'n' is a valid divisor and meets additional criteria.
    // 1. 'n' must divide 'm' evenly (m % n === 0).
    // 2. The quotient (m / n) must be less than 10.
    // 3. A composite number formed by 'n' and 'm/n' (n*10 + m/n) must be less than or equal to 'd'.
    if (m % n === 0 && m / n < 10 && n * 10 + m / n <= d) {
      // If all conditions are met, recursively call `cntDiv` for the next 'n' (n+1).
      // Then, add either 1 or 2 to the result based on a secondary condition:
      // If 'm/n' also forms a valid composite number (m/n*10 + n <= d)
      // AND 'm/n' is not equal to 'n' (to avoid double-counting for perfect squares),
      // then add 2. Otherwise, add 1.
      return cntDiv(n + 1) + ((m / n * 10 + n <= d && m / n !== n) ? 2 : 1);
    } else {
      // If the conditions for 'n' are not met, simply continue the recursion
      // with the next number, adding 0 for the current 'n'.
      return cntDiv(n + 1);
    }
  }


  // Main logic for the `countDivisor` function.
  // If 'm' is less than 4, return 0 as per problem specification.
  if (m < 4) {
    return 0;
  }
  // Otherwise, initiate the counting process.
  // Start the inner `cntDiv` recursion with 'n' = 2,
  // and add the result of recursively calling `countDivisor` with 'm-1'.
  else {
    return cntDiv(2) + countDivisor(m - 1, d);
  }
}



// The `Main` function serves as the entry point for processing input.
// It takes a string `input` which is expected to contain two space-separated integers.
function Main(input) {
  // First, split the input string into an array of strings based on the space delimiter.
  input = input.split(" ");

  // Parse the first element of the array into an integer 'm' (base 10).
  var m = parseInt(input[0], 10);

  // Parse the second element of the array into an integer 'd' (base 10).
  var d = parseInt(input[1], 10);

  // Output the final calculated count.
  // The '%d' format specifier is used for integer output.
  console.log('%d', countDivisor(m, d));
}



// *この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
// The following line is crucial for competitive programming environments.
// It reads the entire standard input, converts it to UTF-8 encoding,
// and then passes it as an argument to the `Main` function to begin execution.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));