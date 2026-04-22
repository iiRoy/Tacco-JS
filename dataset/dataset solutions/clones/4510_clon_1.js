/* This constant 'big' is used for modulo operations throughout the script. */
var big = Math.pow( 10, 9 ) + 7 ; // A large prime number often used in competitive programming.

//
// This function calculates the factorial of a given number,
// applying a modulo operation with 'big' at each step to prevent overflow.
//
function factorialize( num )
{
  var result = num ; // Initialize result with the number itself.

  // Loop from 1 up to (num - 1)
  for ( var i = 1 ; i < num ; i++ )
  {
    result = ( result * i ) % big ; // Multiply and then apply modulo.
  }

  return result ; // Return the final factorial value modulo 'big'.
}

/*
 * The Main function processes the input and calculates the final result
 * based on the problem's logic.
 */
function Main( input )
{
  var split = input . split( " " ) ; // Split the input string by space into an array.

  var n = Number( split[ 0 ] ) ; // Convert the first part to a number.
  var m = Number( split[ 1 ] ) ; // Convert the second part to a number.

  // Check the absolute difference between n and m.
  if ( Math.abs( n - m ) >= 2 )
  {
    return 0 ; // If the difference is 2 or more, the result is 0.
  }

  // Handle the special case where n and m are equal.
  if ( n === m )
  {
    // For n == m, the formula is (factorialize(n) * factorialize(m) * 2) % big.
    return factorialize( n ) * factorialize( m ) * 2 % big ;
  }

  // This is the general case where |n - m| is 1.
  // The formula is (factorialize(n) * factorialize(m)) % big.
  return factorialize( n ) * factorialize( m ) % big ;
}


// --- Main execution block ---
// Reads input from standard input, processes it with the Main function,
// and then prints the result to the console.
console.log( Main( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ) ;