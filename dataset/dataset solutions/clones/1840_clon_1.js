/*
 * This is a Type I clone of the original JavaScript code.
 * All functional logic, variable names, and operators remain
 * precisely identical to the source.
 *
 * The only modifications are to whitespace and comments,
 * ensuring logical equivalence while appearing visually different.
 */

// Initialize the file system module.
fs = require('fs');

// Read input from standard input, using UTF-8 encoding.
input = fs.readFileSync('/dev/stdin', 'utf-8');

// Split the input into lines to process each test case.
tmp1 = input.split('\n');

// The first line of input contains the total number of test cases.
T = tmp1[0];

// Loop through each test case, starting from the second line (index 1).
for (i = 1; i <= T; i++) {
  // Split the current line by spaces to get individual parameters.
  tmp2 = tmp1[i].split(' ');

  // Parse the integer values for N, A, B, C, and D from the split line.
  N = parseInt(tmp2[0], 10); // N: Target number
  A = parseInt(tmp2[1], 10); // A: Cost for operation 1
  B = parseInt(tmp2[2], 10); // B: Cost for operation 2
  C = parseInt(tmp2[3], 10); // C: Cost for operation 3 (commented out in original)
  D = parseInt(tmp2[4], 10); // D: Cost for operation 4 (base cost)

  // Initialize the result variable for the current test case.
  R = 0;

  // Call the recursive function 'ab' to calculate the minimum cost.
  // 'n' is the current number, 'coin' is the accumulated cost so far.
  ab(N, 0);

  // Print the calculated minimum cost for the current test case.
  console.log(R);
}

// Recursive function to determine the minimum cost to reach 'n'.
function ab(n, coin) {
  // Check for operations involving '2'.
  if (n >= 2) {
    // P1: remainder when n is divided by 2.
    // P2: quotient when n is divided by 2 (number of '2' groups).
    P1 = n % 2;
    P2 = (n - P1) / 2;

    // If P1 is 0 (n is even) or P2 is 1 (n is 2 or 3),
    // we can perform a direct calculation.
    if (P1 == 0 || P2 == 1) {
      // Calculate total cost for this specific combination.
      tc = coin + A * P2 + D * P1;

      // Update the global minimum result 'R' if this cost is lower
      // or if R is still zero (initial state).
      if (R == 0 || R > tc) {
        R = tc;
      }
    } else {
      // If direct calculation is not optimal, explore recursive options.
      // Option 1: Reduce n by 2, add cost A.
      ab(P2, coin + A + D * P1);

      // Option 2: Consider reducing n by (P2+1)*2 and adjust P1 accordingly.
      P2 = P2 + 1;
      P1 = n - P2 * 2;

      // If P1 becomes 0 after adjustment, perform a direct calculation.
      if (P1 == 0) {
        tc = coin + A * P2 + D;
        P2 = 1; // This P2 assignment seems to be a leftover or an error in the original logic if it's not used.
        if (R == 0 || R > tc) R = tc;
      } else {
        // Otherwise, recurse with the adjusted values.
        ab(P2, coin + A + D * P1);
      }
    }
  }

  // Check for operations involving '3'.
  if (n >= 3) {
    // P1: remainder when n is divided by 3.
    // P2: quotient when n is divided by 3 (number of '3' groups).
    P1 = n % 3;
    P2 = (n - P1) / 3;

    // If P1 is 0 (n is a multiple of 3) or P2 is 1 (n is 3, 4, or 5).
    if (P1 == 0 || P2 == 1) {
      // Calculate total cost for this specific combination.
      tc = coin + B * P2 + D * P1;

      // Update global minimum result 'R'.
      if (R == 0 || R > tc) {
        R = tc;
      }
    } else {
      // Explore recursive options.
      // Option 1: Reduce n by 3, add cost B.
      ab(P2, coin + B + D * P1);

      // Option 2: Consider reducing n by (P2+1)*3 and adjust P1.
      P2 = P2 + 1;
      P1 = n - P2 * 3;

      // If P1 becomes 0 after adjustment, perform a direct calculation.
      if (P1 == 0) {
        tc = coin + B * P2 + D;
        if (R == 0 || R > tc) R = tc;
      } else {
        // Otherwise, recurse with adjusted values.
        ab(P2, coin + B + D * P1);
      }
    }
  }

  /*
   * This section (operations involving '5') was commented out in the original code.
   * It remains commented out here to preserve the exact structure.
   *
   * if(n >= 5) {
   *   P1 = n % 5;
   *   P2 = (n - P1) / 5;
   *   if(P1 == 0 || P2 == 1) {
   *     tc = coin + C * P2 + D * P1;
   *     if(R == 0 || R > tc) { R = tc; };
   *   } else {
   *     ab(P2,coin + C + D * P1);
   *     P2 = P2 + 1;
   *     P1 = n - P2 * 5;
   *     if(P1 == 0) {
   *       tc = coin + C * P2 + D;
   *       if(R == 0 || R > tc) R = tc;
   *     } else ab(P2,coin + C + D * P1);
   *   }
   * }
   */
}