/*
 * This function calculates the factorial of a given number.
 * It uses a recursive approach to compute the result.
 *
 * @param {number} num - The number for which to calculate the factorial.
 * @returns {number} The factorial of the input number.
 */
const factorial = ( num => num <= 1 ? 1 : num * factorial(num - 1) );


// This block defines a function responsible for acquiring specific patterns.
// It's a complex recursive function used for combinatorial calculations,
// likely related to counting numbers with specific digit properties.
//
// Parameters:
//   n: A string or array representing the number.
//   k: An integer, possibly representing a target count of a specific digit.
//   keta: The total number of digits (length of n).
//   i: The current digit index being processed (from left to right).
//   xnum: The count of a specific digit found so far.
//   pflag: A boolean flag indicating if the current prefix is 'tight'
//          (i.e., matches the original number's prefix exactly).
const getPattern = ( ( n, k, keta, i, xnum, pflag ) => {
  // Base case: If we have processed all digits up to 'keta',
  // it means we've successfully formed a pattern.
  if ( i >= keta ) {
    return 1;
  }

  // Initialize variables to hold partial counts.
  let num1 = 0; // Represents count for specific cases (e.g., leading zeros).
  let num2 = 0; // Represents count for other specific cases (e.g., non-tight prefix).
  let num = 0;  // The total count for the current state.

  // Check if the current prefix matches the original number's prefix (tight constraint).
  if ( pflag ) {
    // Case 1: The current digit in 'n' is not zero.
    // This implies we have options to place non-zero digits.
    if ( n[i] !== 0 ) {
      // Check if there are still digits to place (k-xnum) and
      // if the remaining length (keta-i) allows for placing a zero.
      // This condition is a bit complex, related to permutations/combinations.
      if ( ( n - i ) != ( k - xnum ) ) {
        // If there are 'x's (specific digits) left to place.
        if ( ( k - xnum ) > 0 ) {
          // Calculate patterns where the current position is a leading zero.
          // This involves combinatorial calculation using the factorial function.
          const pNum = factorial( keta - i - 1 ) / ( factorial( k - xnum ) * factorial( keta - i - 1 - k + xnum ) );

          // Calculate the total number of such patterns.
          // The '* 9' might represent choices for non-zero digits.
          num1 = ( k - xnum ) * 9 * pNum;
        }
        else {
          // If no 'x's are left to place, and this path is taken, it's a single pattern.
          num1 = 1;
        }
      }

      // Re-evaluate 'x's existence for another branch of calculation.
      if ( ( k - xnum ) > 0 ) {
        // If the current digit of 'n' is greater than 1,
        // it means we can place a digit smaller than n[i] but non-zero,
        // which breaks the 'tight' constraint (pflag becomes false).
        if ( n[i] > 1 ) {
          // Recursively call getPattern with 'pflag' set to false for non-tight paths.
          num2 = ( n[i] - 1 ) * getPattern( n, k, keta, i + 1, xnum + 1, false );
        }
        // If the current digit of 'n' is 1 (or 0, but that's handled above),
        // we must try to match it exactly to maintain the 'tight' constraint.
        // This is the 'exact match' path.
        num2 = getPattern( n, k, keta, i + 1, xnum + 1, true );
      }

      // Sum up the counts from both branches.
      num = num1 + num2;
    }
    // Case 2: The current digit in 'n' is zero.
    // If n[i] is 0, we must place a 0 to maintain the 'tight' constraint.
    else {
      // Recursively call getPattern, moving to the next digit,
      // and keeping 'pflag' true because we matched n[i] (which was 0).
      num = getPattern( n, k, keta, i + 1, xnum, true );
    }
  }
  // Case 3: The current prefix does NOT match the original number's prefix (not tight).
  // This means we have full freedom to place digits from 0-9.
  else {
    // Calculate permutations/combinations for the remaining digits.
    // This is a more general calculation as 'pflag' is false.
    const pNum = factorial( keta - i ) / ( factorial( k - xnum ) * factorial( keta - i - k + xnum ) );
    // Calculate the total number of patterns for this non-tight branch.
    num = ( k - xnum ) * 9 * pNum;
  }

  // Return the calculated count for the current state.
  return num;
} );


/*
 * Main function to process input and output the result.
 * This function reads from standard input, parses it,
 * and then calls 'getPattern' to compute the final answer.
 *
 * @param {string} input - The raw input string from stdin.
 */
function Main ( input ) {
  // Split the input string by newlines to get individual lines.
  var inputs = input.split( "\n" );

  // Extract 'n' (the number string) and 'k' (the count) from the input.
  const n = inputs[0];
  const k = inputs[1];

  // Determine the number of digits in 'n'.
  const keta = inputs[0].length;

  // Call the 'getPattern' function with initial parameters.
  // Starting at index 0, with 0 'x's found, and 'pflag' true (tight constraint initially).
  const num = getPattern( n, k, keta, 0, 0, true );

  // Output the final calculated number to the console.
  console.log( num );
}

// Read input from standard input and pass it to the Main function.
Main( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );