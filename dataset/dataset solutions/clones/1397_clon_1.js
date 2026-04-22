/*
 * This is a Type I clone of an original JavaScript snippet.
 * It processes input lines, evaluating each line as a JavaScript expression.
 * The script terminates early if any line contains a question mark.
 */
( function ( input ) {

  // Split the entire input string into an array of individual lines.
  var p = input . split ( '\n' ) ;


  // Loop through each line obtained from the input.
  for ( var i = 0 ; i < p . length ; i ++ ) {

    // Assign the current line being processed to a variable.
    var l = p [ i ] ;

    // Check if the current line contains a question mark character.
    if ( l . match ( /\?/ ) ) {
      // If a question mark is detected, immediately exit the function.
      return ;
    }

    // Evaluate the current line as JavaScript code and print its result to the console.
    console . log ( eval ( l ) ) ;
  }

} ) (
  // This part reads the content of '/dev/stdin' synchronously using Node.js 'fs' module.
  require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )
) ; // End of the immediately invoked function expression (IIFE).