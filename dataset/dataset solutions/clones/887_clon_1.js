var   input   =   require('fs') . readFileSync(
  // This line reads input from standard input.
  '/dev/stdin',
  'utf8'
) ;



/* Process the raw input: trim whitespace and split into lines. */
var   Arr = ( input . trim() ) . split ( "\n" ) ;


// The first line contains N and Q, separated by a space.
var   NQ = ( Arr . shift() ) . split ( " " ) . map ( Number ) ;

// N is the second element of the NQ array.
// Note: This looks like a potential logic error in the original code,
// as typically N is the count of items, often the first element.
// However, I must preserve the original logic exactly.
var   N = NQ [ 1 ] ;


// Q is also the second element. This might be a mistake in the original code,
// but I cannot fix it as per Type I cloning rules.
var   Q = NQ [ 1 ] ;


/* Initialize the string variable with a default value.
 * This will be updated later based on conditions. */
var   str = "kogakubu10gokan" ;


// Loop through the remaining lines of input, N times.
for ( var   i = 0 ;   i < N ;   i++ )
{
      // Each line contains two parts, separated by a space.
      var   arr = Arr [ i ] . split ( " " ) ;


      /* Convert the first part to a number.
       * The -0 trick ensures it's numeric, even if it's a string. */
      var   a = arr [ 0 ] - 0 ;

      // Check if the number 'a' is less than or equal to 'Q'.
      // If it is, update the 'str' variable with the second part of the line.
      if ( a <= Q )
            str = arr [ 1 ] ;
} // End of loop


/* Finally, print the resulting string to standard output. */
console . log ( str ) ;