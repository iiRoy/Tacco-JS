/*
 * This JavaScript code snippet demonstrates reading input from standard input,
 * performing basic arithmetic operations, and then printing the results.
 * It uses an Immediately Invoked Function Expression (IIFE) pattern.
 */
( function( hoge )
{
  // The 'hoge' parameter receives the input string.
  // We split the input string by spaces to get an array of number strings.
  var num = hoge.split( ' ' );


  // Extract the first number from the 'num' array.
  var x   = num[ 0 ];

  // Extract the second number from the 'num' array.
  var y = num[ 1 ];

  // Perform calculations and print the results to the console.
  // The output includes:
  // 1. The floor of x divided by y (integer division).
  // 2. The remainder of x divided by y (modulo operation).
  // 3. The floating-point result of x divided by y, formatted to 6 decimal places.
  console.log( Math.floor( x / y ) + ' ' + x % y + ' ' + ( x / y ).toFixed( 6 ) );

} )( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) ); // This part reads the input file '/dev/stdin' as UTF-8.