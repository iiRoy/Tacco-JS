/* This is a Type I clone example.
 * All identifiers, operators, and expressions are preserved.
 * Only whitespace and comments are altered.
 */
function
  countDivisor
( m , d )
{
  // Inner helper function to perform the core divisor counting logic.
  function
    cntDiv
  ( n )
  {
    // Base case: if n*n exceeds m, no more divisors to check from this point.
    if ( n * n > m )
      return 0
    ;

    // Check if n is a divisor of m.
    if ( ( m % n === 0 ) && ( m / n < 10 ) )
      {
        // Recursive call for the next potential divisor.
        // Also, calculate the contribution based on conditions.
        return (
          cntDiv( n + 1 )
          +
          ( ( ( m / n ) * 10 + n ) < d && ( m / n !== n ) )
          ?
          2
          :
          1
        )
        ;
      }
    else
      {
        // If n is not a divisor, or m/n is not less than 10,
        // continue checking with the next number.
        return cntDiv( n + 1 )
        ;
      }
  }

  // Initial check for m.
  if ( m < 4 )
    {
      return 0
      ; // Numbers less than 4 don't fit the problem's criteria for counting.
    }
  else
    {
      // Start the recursive divisor counting from 2,
      // and add the result of the previous m.
      return (
        cntDiv( 2 )
        +
        countDivisor( m - 1 , d )
      )
      ;
    }
}


/*
 * This is the main entry point function.
 * It processes the input and prints the result.
 */
function
  Main
( input )
{
  // Split the input string by space to get individual values.
  input = input . split ( " " )
  ;

  // Parse the first value as integer m.
  var
    m
    =
    parseInt ( input [ 0 ] , 10 )
  ;

  // Parse the second value as integer d.
  var
    d
    =
    parseInt ( input [ 1 ] , 10 )
  ;

  // Output the final calculated value to the console.
  // The format specifier '%d' ensures it's printed as a decimal integer.
  console . log ( '%d' , countDivisor ( m , d ) )
  ;
}

// DO NOT EDIT THE FOLLOWING LINE.
// This section handles standard input/output operations.
// It reads the entire standard input and passes it to the Main function.
Main(
  require("fs")
    .readFileSync(
      "/dev/stdin"
      ,
      "utf8"
    )
)
;