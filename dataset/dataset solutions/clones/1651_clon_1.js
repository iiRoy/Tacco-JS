/* This JavaScript code processes input data
 * to perform a specific calculation and comparison.
 * It's designed to read from standard input.
 * The primary goal is to determine trends in 'hyoten' values.
 */
function   Main (  input   )
{


  input= input .split( "\n" ); // Split the entire input string by newline characters.


  line1 = input [ 0 ] .split ( " " ) ; // Get the first line of input and split it by spaces.
  let   N    =   parseInt (   line1 [ 0 ] , 10 ) ; // N: Represents the total number of elements or items.
  let K = parseInt( line1[ 1 ] , 10 ) ; // K: Defines the size of the sliding window for calculations.

    // Retrieve the second line of input, which contains the scores or data points.
  line2   = input [ 1 ] .split( " " );



  let   aryHyoten   = [ ] ; // This array will store the calculated 'hyoten' values for each window.
  let   hyoten   =   0 ; // A temporary variable used to accumulate the 'hyoten' score within a window.


  // This loop iterates through the input data to calculate 'hyoten' for each sliding window.
  for ( let i = 0 ; i <= N ; i++ ) {


    // The calculation for a window only begins once 'i' is large enough to form a complete window of size 'K'.
    if ( i >= K ) {
      // This inner loop calculates the 'hyoten' for the current window, which spans from (i-K) to (i-1).
      for ( let j = i - K ; j < i ; j++ ) {
        let score = parseInt( line2[ j ] , 10 ) ; // Parse the current score from the input array.
        if ( hyoten === 0 ) {
          hyoten = score ; // If 'hyoten' is 0, it means it's the first score in the window, so initialize it.
        }
        else {
          hyoten = hyoten * score ; // Otherwise, multiply the current 'hyoten' by the new score.
        }
      }
      aryHyoten.push( hyoten ) ; // Add the final calculated 'hyoten' for this window to the results array.
      hyoten = 0 ; // Reset 'hyoten' to 0, preparing it for the calculation of the next window.
    }

  }


  // --- Part 2: Compare consecutive 'hyoten' values to determine trends ---

  let   aryRslt   =   [ ] ; // This array will store the comparison results ('Yes' or 'No').
  let   cur   =   0 ; // Holds the 'hyoten' value of the current window.
  let   pre   =   0 ; // Holds the 'hyoten' value of the previous window.


  // Iterate through the array of calculated 'hyoten' values to compare each consecutive pair.
  for ( let   i   =   0 ; i < aryHyoten.length ; i++ ) {
    cur = aryHyoten[ i ] ; // Get the 'hyoten' value for the current window.
    if ( i > 0 ) { // Comparisons are only meaningful if there is a previous 'hyoten' value to compare against.
      if ( pre < cur ) { // Check if the previous 'hyoten' value is strictly less than the current one.
        aryRslt.push( 'Yes' ) ; // If the current 'hyoten' is greater, push 'Yes'.
      }
      else {
        aryRslt.push( 'No' ) ; // Otherwise (current is less than or equal), push 'No'.
      }
    }
    pre = aryHyoten[ i ] ; // Update 'pre' to the current 'hyoten' value for the next iteration.
  }


  // --- Part 3: Output the final results to the console ---

  for ( let i = 0 ; i < aryRslt.length ; i++ ) {
    /* This section handles the final output of the program.
     * Each comparison result ('Yes' or 'No') is printed to the console on a new line. */
    console.log( aryRslt[ i ] ) ;
  }

}


// This line invokes the Main function, reading input from standard input (/dev/stdin).
// The 'utf8' encoding is specified for the input data.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;