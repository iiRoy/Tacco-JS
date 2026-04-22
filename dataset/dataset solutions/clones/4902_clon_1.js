/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact structural and logical equivalence,
 * with only variations in whitespace and comments.
 */

function   Main  ( input   )   {

  // Input processing: split the entire input string by newline characters.
  var   input   =   input.split( "\n" );

  // Parse K and T from the first line of input.
  // K represents some initial quantity, T might be a type or count.
  var K = parseInt( input[ 0 ].split( " " )[ 0 ] );
  var T = parseInt( input[ 0 ].split( " " )[ 1 ] );

  // Process the second line of input:
  // Split by space, then map each element to an array [original_index, parsed_integer_value].
  var a = input[ 1 ].split( " " ).map( ( el , i ) => {
    return [ i , parseInt( el ) ];
  } );

  // Initialize 'last' to -1, indicating no previous item was selected.
  var last = -1;

  // Initialize 'count' to 0, which will track certain operations.
  var count = 0;

  // Main loop: continues indefinitely until a return statement is hit.
  while ( 1 ) {

    // If K becomes 0, the process is complete. Log the final count and exit.
    if ( K == 0 ) {
      return console.log( count );
    };

    // Sort array 'a' in descending order based on the second element (the integer value).
    // This prioritizes elements with higher values.
    a.sort( function ( a , b ) { return a[ 1 ] < b[ 1 ]; } );

    // Flag to indicate if an item was successfully found and processed in the current iteration.
    var found = 0;

    // Iterate through the sorted array 'a' to find a suitable item.
    for ( var i = 0 ; i < a.length ; i++ ) {

      // Condition: The item's value must be greater than 0 AND its original index must not be 'last'.
      // This prevents selecting the same item consecutively if 'last' is set.
      if ( a[ i ][ 1 ] > 0 && a[ i ][ 0 ] != last ) {

        // Update 'last' to the original index of the current item.
        last = a[ i ][ 0 ];
        // Decrement the item's value.
        a[ i ][ 1 ]--;
        // Decrement the main counter K.
        K--;
        // Set 'found' flag to 1, as an item was processed.
        found = 1;
        // Break out of the loop as one item has been handled.
        break;
      }
    };

    // If no suitable item was found in the previous loop (i.e., 'found' is still 0).
    if ( !found ) {

      // This block handles cases where all remaining items have been processed consecutively
      // or only one type of item remains and it was 'last'.
      // Iterate again, but this time, the 'last' constraint is ignored.
      for ( var i = 0 ; i < a.length ; i++ ) {

        // Condition: The item's value must be greater than 0.
        // No check for 'last' here, so it can select the previously selected item if necessary.
        if ( a[ i ][ 1 ] > 0 ) {

          // Update 'last' to the original index of the current item.
          last = a[ i ][ 0 ];
          // Decrement the item's value.
          a[ i ][ 1 ]--;
          // Decrement the main counter K.
          K--;
          // Increment 'count' as a special action occurred (likely forcing a selection).
          count++;
          // Break out of the loop.
          break;
        }
      };
    }
  } // End of while(1) loop.

} // End of Main function.

// Execute the Main function with input read from standard input.
Main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) );