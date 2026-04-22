/*
 * This JavaScript code processes input data based on specific rules.
 * It involves several steps including parsing input, performing calculations,
 * and dynamic programming to arrive at a final result.
 */

/**
 * Applies a transformation to a number.
 * If the number is 10 or greater, it's adjusted.
 * @param {number} x - The input number.
 * @returns {number} The transformed number.
 */
function over ( x )
{
  // Check if the value of x is greater than or equal to 10.
  if ( x >= 10 )
  {
    /* If it is, subtract 10 and then add 1 to x.
     * This effectively wraps the number around, similar to a modulo operation
     * but with a specific offset.
     */
    x = x - 10 + 1 ;
  }

  // Return the (potentially) modified value of x.
  return x ;
}


// --- Main Program Execution Begins Here ---


// Import the 'fs' (file system) module to read input.
// Read the entire content of '/dev/stdin' as a UTF-8 string.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Trim leading/trailing whitespace from the input and split it into an array
// of strings, using newline characters as delimiters.
var arr = input . trim ( ) . split ( "\n" ) ;

// The first line of input is 'n'. Convert it to a number.
// The '-0' is a common JavaScript idiom to convert a string to a number.
var n = arr . shift ( ) - 0 ;

// The second line of input is 'id'. Split it into an array of individual characters.
var id = arr . shift ( ) . split ( "" ) ;

// The third line of input is 'a'. Convert it to a number.
var a = arr . shift ( ) - 0 ;

// The fourth line of input is 'ary'. Split it by spaces and map each part to a Number.
var ary = arr . shift ( ) . split ( " " ) . map ( Number ) ;


// Initialize an empty array 'k' to store certain multiplier values.
var k = [ ] ;

// Initialize 'sum' to 0. This variable will accumulate values based on 'id'.
var sum = 0 ;


/*
 * Iterate over each character 'v' and its index 'i' in the 'id' array.
 * This loop processes the 'id' string to populate 'k' and 'sum'.
 */
id . forEach ( function ( v , i )
{
  // If the current character is an asterisk ("*").
  if ( v == "*" )
  {
    // If the index 'i' is even, push '1' into the 'k' array.
    if ( i % 2 == 0 )
    {
      k . push ( 1 ) ;
    }
    // Otherwise (if the index 'i' is odd), push '2' into the 'k' array.
    else
    {
      k . push ( 2 ) ;
    }
  }
  // If the current character is not an asterisk.
  else
  {
    // If the index 'i' is even, add the numeric value of 'v' to 'sum'.
    if ( i % 2 == 0 )
    {
      sum += v - 0 ; // Convert 'v' to a number before adding.
    }
    // Otherwise (if the index 'i' is odd), apply 'over' function to (v * 2) and add to 'sum'.
    else
    {
      sum += over ( ( v - 0 ) * 2 ) ; // Convert 'v' to a number, multiply by 2, then apply 'over'.
    }
  }
} ) ;


// Declare a 2D array 'dp' for dynamic programming.
var dp = [ ] ;

// Initialize the 'dp' array.
// The outer loop creates 8 rows (from index 0 to 7).
for ( var i = 0 ; i <= 7 ; i ++ )
{
  dp [ i ] = [ ] ; // Initialize each row as an empty array.

  // The inner loop initializes all elements in the current row to 0.
  // The size of the inner dimension is 1,000,001 (from 0 to 1,000,000).
  for ( var s = 0 ; s <= 1000000 ; s ++ )
  {
    dp [ i ] [ s ] = 0 ;
  }
}


// Set the initial state for the dynamic programming.
// The value at dp[0][sum] is set to 1, representing a starting point.
dp [ 0 ] [ sum ] = 1 ;


/*
 * This set of nested loops performs the core dynamic programming calculation.
 * It iterates through the 'k' array and 'ary' array to update 'dp' states.
 */
for ( var i = 0 ; i < k . length ; i ++ )
{
  for ( var j = 0 ; j < ary . length ; j ++ )
  {
    for ( var s = 0 ; s <= 1000000 ; s ++ )
    {
      // If dp[i][s] has a value (meaning this state is reachable).
      if ( dp [ i ] [ s ] > 0 )
      {
        // Calculate the value to be added based on 'ary[j]' and 'k[i]',
        // then apply the 'over' function.
        var valueToAdd = over ( ary [ j ] * k [ i ] ) ;

        // Update the next state in the dp table.
        // The value from the current state dp[i][s] is added to
        // dp[i+1][s + valueToAdd].
        dp [ i + 1 ] [ s + valueToAdd ] += dp [ i ] [ s ] ;
      }
    }
  }
}


// Initialize 'ans' to 0. This variable will store the final answer.
var ans = 0 ;

// Iterate through the last row of the 'dp' table (dp[k.length]).
for ( var s = 0 ; s <= 1000000 ; s ++ )
{
  // If the current sum 's' is divisible by 10 (i.e., its remainder when divided by 10 is 0).
  if ( s % 10 == 0 )
  {
    // Add the value from dp[k.length][s] to 'ans'.
    ans += dp [ k . length ] [ s ] ;
  }
}

// Print the final calculated answer to the console.
console . log ( ans ) ;