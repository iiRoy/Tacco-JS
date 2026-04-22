/* This is an example of a Type I code clone.
 * Only whitespace and comments are modified.
 * The core logic and structure remain absolutely identical.
 */

// Start of the main execution block
console . log (
  // Immediately Invoked Function Expression (IIFE) starts here
  ( ( args ) => {

    // Trim leading/trailing whitespace from the input string.
    const S = args . trim ( ) ;

    // Get the length of the trimmed string.
    const L = S . length ;

    // Initialize an array 'T' of size L+1 with all zeros.
    // This array will store the "depth" or "level" based on '<' and '>' characters.
    const T = Array ( L + 1 ) . fill ( 0 ) ;

    // Loop through the string 'S' from both ends to calculate levels.
    // The loop runs 'L' times, processing characters from left and right.
    for ( let i = 0 ; i < L ; i ++ ) {

      // First pass: Process '<' characters from left to right.
      // If a '<' is encountered, update T[i+1] based on T[i].
      if ( S [ i ] === '<' ) {
        // T[i+1] takes the maximum of its current value and (T[i] + 1).
        // This propagates the "depth" from left to right.
        T [ i + 1 ] = Math . max ( T [ i + 1 ] , T [ i ] + 1 ) ;
      }


      // Second pass (within the same loop iteration): Process '>' characters from right to left.
      // The index for right-to-left is L - i - 1.
      if ( S [ L - i - 1 ] === '>' ) {
        // T[L-i-1] takes the maximum of its current value and (T[L-i] + 1).
        // This propagates the "depth" from right to left.
        T [ L - i - 1 ] = Math . max ( T [ L - i - 1 ] , T [ L - i ] + 1 ) ;
      }
    }

    // Calculate the sum of all elements in array 'T' and convert it to a string.
    return `${ T . reduce ( ( a , b ) => a + b ) }` ;
  } ) (
    // Read input from standard input synchronously and decode it as UTF-8.
    require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )
  )
) ; // End of console.log and IIFE call.

/* End of file. */