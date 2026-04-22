/*
 * This function takes a multi-line string input
 * and parses it into an array of individual values.
 * It splits by newlines first, then by spaces.
 */
function         parseInput( input )
{
  // Initialize an empty array to store all parsed values.
  const values = [ ] ;

  // Split the input string by newline characters to get individual rows.
  // Then, iterate over each row.
  input.split( '\n' ).forEach( row => {
    // Split the current row by space characters to get a list of values for that row.
    const list = row.split( ' ' ) ;

    // For each value in the current row's list, add it to the main 'values' array.
    list.forEach( v => values.push( v ) ) ;
  } ) ;

  // Return the accumulated array of all parsed values.
  return values ;
}


// Function to retrieve the input data.
// It prioritizes reading from standard input if 'dummy' is empty.
function getInput ( )
{
  // A placeholder or dummy string. In a real scenario, this might be used for testing.
  const dummy = `` ;

  // If dummy is an empty string, it will be falsy, and the right side of '||' will execute.
  // This reads the content of '/dev/stdin' as UTF-8.
  // The content is then passed to the parseInput function.
  return parseInput( dummy || require( 'fs' ).readFileSync( '/dev/stdin' , 'utf8' ) ) ;
}


/*
 * Computes the factorial of a given non-negative integer.
 * factorial(n) = n * (n-1) * ... * 1
 */
function factorial ( num )
{
  // Initialize the result variable to 1, as 0! = 1 and it's the multiplicative identity.
  var number = 1 ;

  // Loop from 1 up to the given number (inclusive).
  for ( var i = 1 ; i <= num ; i++ )
  {
    // Multiply 'number' by the current loop variable 'i'.
    number *= i ;
  }

  // Return the calculated factorial value.
  return number ;
}


/*
 * Calculates the number of combinations (nCr).
 * The formula is nCr = n! / (r! * (n-r)!)
 */
function combination( n , r )
{
  // Calculate n!
  // Calculate r!
  // Calculate (n-r)!
  // Apply the combination formula.
  return factorial( n ) / ( factorial( r ) * factorial( n - r ) ) ;
}


// Immediately Invoked Function Expression (IIFE) to run the main logic.
;( function main ( )
{
  // Get the parsed input array.
  const input = getInput( ) ;

  // Parse the first three input values as numbers.
  // The unary '+' operator converts string to number.
  const n = +input[ 0 ] ;
  const a = +input[ 1 ] ;
  const b = +input[ 2 ] ;

  // Initialize a variable to accumulate the sum.
  var sum = 0 ;

  // Loop from r = 1 up to n (inclusive).
  for ( var r = 1 ; r <= n ; r++ )
  {
    // If 'r' is equal to 'a' or 'b', skip this iteration.
    // This effectively excludes combination(n,a) and combination(n,b) from the sum.
    if ( r === a || r === b )
    {
      continue ; // Skip to the next iteration of the loop.
    }

    // Add the combination(n, r) to the sum.
    sum += combination( n , r ) ;
  }

  // Define a large prime number for modulo operation.
  const c = Math.pow( 10 , 9 ) + 7 ;

  // Print the final sum modulo c to the console.
  console.log( sum % c ) ;
} ) ( ) ; // Invoke the main function immediately.