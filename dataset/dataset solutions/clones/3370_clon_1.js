// This is a Type I clone generated for demonstration purposes.
// The original code's logic is preserved exactly.

function   main ( arg )
{
  // The input 'arg' is a string, typically from stdin.
  arg  =  arg.split ( "\n" ) ; // Split the input string by newline characters into an array of strings.

  // Parse the first line of input.
  // It contains N, H, and W separated by spaces.
  let   N   =   parseInt ( arg [ 0 ].split ( " " ) [ 0 ] ) ;
  let   H   =   parseInt ( arg [ 0 ].split ( " " ) [ 1 ] ) ;
  let   W   =   parseInt ( arg [ 0 ].split ( " " ) [ 2 ] ) ;
  /*
   * Initialize a counter for items that meet the criteria.
   * This counter will be incremented within the loop.
   */
  let   count   =   0 ;

  // Remove the first line as N, H, W have already been parsed.
  // The remaining lines contain the items to be checked.
  arg.shift ( ) ;


  // Loop through the remaining lines of the input array.
  for ( let   i = 0 ;   i < arg.length ;   i++ )
  {
    // For each line, parse 'h' and 'w' values.
    let   h   =   parseInt ( arg [ i ].split ( " " ) [ 0 ] ) ;
    let   w   =   parseInt ( arg [ i ].split ( " " ) [ 1 ] ) ;

    // Check if the current item's dimensions (h, w) meet the minimum requirements (H, W).
    if ( h   >=   H   &&   w   >=   W )
    {
      // If both conditions are met, increment the counter.
      count ++ ;
    }
  }

  // Output the final count to the console.
  console.log ( count ) ;
}

// Invoke the main function with input read from standard input.
// This is a common pattern for competitive programming in Node.js.
main ( require ( 'fs' ).readFileSync ( '/dev/stdin' ,   'utf8' ) ) ;