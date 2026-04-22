// This defines the main function for processing input.
const Main = ( input ) => {

  // Parse the input string: trim whitespace, split by space, and convert each part to an integer.
  var xs = input . trim() . split( ' ' ) . map( v => parseInt( v , 10 ) ) ;


  // Calculate the sum of the first two elements from the parsed array.
  var ans = xs[ 0 ] + xs[ 1 ] ;


  // The original debug log for xs was commented out. We keep it that way.
  // console.log( xs ) ; // This line is intentionally commented out.


  // Check if the calculated sum is perfectly divisible by 3.
  if ( ans % 3 === 0 ) {

    // If divisible, output 'Possible' to the console.
    console . log( 'Possible' ) ;

  } else if ( ans % 3 !== 0 ) { // This condition is logically redundant but syntactically allowed in a Type I clone.

    // Otherwise (if not divisible by 3), output 'Impossible'.
    console . log( 'Impossible' ) ;

  } // End of the conditional block for checking divisibility.

} // End of the Main function definition.


// This section reads input from standard input and calls the Main function.
// It uses Node.js's 'fs' module to read the file located at '/dev/stdin' with 'utf8' encoding.
Main( require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ) ;