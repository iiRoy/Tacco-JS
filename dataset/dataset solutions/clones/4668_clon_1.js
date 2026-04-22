/*
 * This JavaScript program calculates the minimum number of digits
 * required to represent the larger factor of a given number N.
 * It reads input from standard input, processes it, and then
 * prints the result to the console.
 */

// Global variable to store input lines.
// It reads the entire content of '/dev/stdin', decodes it as UTF-8,
// removes leading/trailing whitespace, and splits it into an array of lines.
inp = require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) . trim( ) . split( '\n' ) ;

// Parse the first line of input as the number N.
// `inp.shift()` removes the first element from the array and returns it.
// The `* 1` explicitly converts the string to a number.
N = inp . shift( ) * 1 ;


/*
 * Function to find all positive integer divisors of a given number 'n'.
 * This function efficiently determines all factors by iterating up to
 * the square root of 'n'. For each factor 'i' found, it also adds 'n / i'
 * as a factor, unless 'i' is the square root itself.
 *
 * @param {number} n - The integer for which to find all its divisors.
 * @returns {Array<number>} An array containing all positive integer divisors of 'n',
 *                           sorted in ascending numerical order.
 */
_dividers = function ( n )
{
  var arr = [ ] ; // Initialize an empty array to store the divisors.

  // Loop from 1 up to the square root of 'n'.
  // This approach ensures that all pairs of factors (i, n/i) are found efficiently.
  for ( var i = 1 ; i * i <= n ; i ++ )
  {
     // Check if 'i' evenly divides 'n'.
     if ( n % i === 0 )
     {
       arr . push( i ) ; // Add 'i' to the list of divisors.

       // If 'i' is not equal to 'n / i' (meaning 'i' is not the square root of 'n'),
       // then 'n / i' is a distinct complementary divisor.
       if ( i != n / i )
       {
         arr . push( n / i ) ; // Add the complementary divisor.
       }
     }
  }

  // Sort the array of divisors in ascending order before returning it.
  // The sorting function `(a, b) => a - b` ensures numerical sort.
  return arr . sort( ( a , b ) => a - b ) ;
} ;


// Call the _dividers function to get all divisors of N.
// The result is stored in the variable 'd'.
d = _dividers( N ) ;

// Initialize 'min' with the number of digits in N itself.
// This provides an initial upper bound for the minimum length we are trying to find.
min = N . toString( ) . length ;

// Iterate through each divisor found in the 'd' array.
// The goal is to find the pair of factors (a, b) of N such that
// the number of digits in the larger factor (max(a, b)) is minimized.
for ( i = 0 ; i < d . length ; i ++ )
{
  b = d [ i ] ; // 'b' represents one factor from the divisors list.
  a = N / b ;   // 'a' represents the complementary factor (N divided by b).

  // Calculate the number of digits in the larger of the two factors 'a' and 'b'.
  // Convert the number to a string to easily get its length (number of digits).
  m = a > b ? a . toString( ) . length : b . toString( ) . length ;

  // If the currently calculated maximum factor length 'm' is smaller than
  // the current minimum 'min', update 'min' with this new smaller value.
  if ( min > m )
  {
      min = m ;
  }
}

// Print the final calculated minimum number of digits to the console.
console . log( min ) ;