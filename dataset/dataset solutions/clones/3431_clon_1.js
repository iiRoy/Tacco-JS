/*
 * This function calculates a specific sum based on
 * recursive calls and digit analysis.
 *
 * @param {number} i   - An index or level counter.
 * @param {number} x   - The current number being processed.
 * @param {number} n   - The upper limit for x.
 * @param {number} acc - The accumulator for the sum.
 */
function f(i,x,n,acc)
{
  // Base case: if x exceeds the limit n, return the accumulated value.
  if (x > n)
  {
    return acc;
  }

  // Initialize a boolean array to track presence of digits 3, 5, 7.
  var p = new Array(10);
  // Create a mutable copy of x for digit extraction.
  var m = x;


  // Loop through each digit of m.
  while (m > 0)
  {
    /*
     * Check the last digit of m.
     * If it's 3, 5, or 7, mark its presence in array p.
     */
    switch(m % 10)
    {
      case 3:
      {
        p[3] = true; // Mark digit 3 as present
        break;
      }

      case 5:
      {
        p[5] = true; // Mark digit 5 as present
        break;
      }

      case 7:
      {
        p[7] = true; // Mark digit 7 as present
        break;
      }

      default:
      {
        /* No action needed for other digits. */
        break;
      }
    }
    // Remove the last digit from m.
    m = Math.floor(m / 10);
  }

  // If digits 3, 5, and 7 are all present in x, add 1 to acc.
  acc += p[3] === true && p[5] === true && p[7] === true ? 1 : 0;

  // Recursive calls to explore new numbers by appending 3, 5, or 7.
  // The new numbers are formed by (10^i * digit) + x.
  acc += f(i + 1, Math.pow(10, i) * 3 + x, n, 0);
  acc += f(i + 1, Math.pow(10, i) * 5 + x, n, 0);
  acc += f(i + 1, Math.pow(10, i) * 7 + x, n, 0);

  // Return the final accumulated sum for this branch.
  return acc;
}

/**
 * Main entry point function for the program.
 * It reads an integer input, and then calls the recursive
 * function 'f' with initial values to calculate a total sum.
 *
 * @param {string} input - The input string, expected to be a number.
 */
function Main(input)
{
  // Parse the input string into an integer.
  var n = parseInt(input);

  // Initialize the total accumulator.
  var acc = 0;

  // Initial calls to f, starting with single digits 3, 5, and 7.
  acc += f(1, 3, n, 0);
  acc += f(1, 5, n, 0);
  acc += f(1, 7, n, 0);

  // Output the final calculated sum to the console.
  console.log(acc);
}

// This line handles standard input/output; please do not modify it.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));