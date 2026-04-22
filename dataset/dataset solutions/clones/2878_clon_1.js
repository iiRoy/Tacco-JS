/* This is the main function definition. */
function   main   ( input )
{
  // Initialize a counter variable.
  var    count    =    0   ;

  // Loop as long as the substring 'ABC' is found in the input string.
  while ( input.indexOf ( 'ABC' ) >= 0 )
  {
    /* Find the starting position of 'ABC'. */
    var   index   =   input.indexOf ( 'ABC' )   ;

    // Replace the first occurrence of 'ABC' with 'BCA'.
    var   a   =   input.replace ( 'ABC' , 'BCA' )   ;

    // Increment the counter.
    count ++   ;

    // Update the input string to be the slice from the found index.
    input   =   a.slice ( index )   ;
  }
  /*
   * Finally, print the total count to the console.
   */
  console.log ( count )   ;
}

// This line calls the main function with input read from standard input.

main ( require ( 'fs' ) .readFileSync ( '/dev/stdin' , 'utf8' ) ) ;