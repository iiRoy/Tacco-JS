(
  function( payload )
  {
    // This function takes raw input, processes it, and prints a sorted result.
    // The main purpose is to demonstrate array manipulation and sorting.

    /*
     * First, we prepare the input string.
     * We remove any trailing newline character to prevent issues with splitting.
     * Then, the string is divided into an array of substrings using space as a delimiter.
     */
    var dataArray = payload
      .replace( new RegExp('\\n$') , String() ) // Remove the final newline character if present.
      .split( String.fromCharCode(32) ) // Split the string by space into an array of elements.
    ;

    // Now, we proceed to sort the numerical elements in descending order.
    // After sorting, the elements are rejoined into a single string with spaces.
    console.log
    (
      dataArray.sort
      (
        function( elementA, elementB )
        {
          // The comparison function for a reverse numerical sort.
          // Subtracting elementA from elementB yields a descending order for numbers.
          return elementB - elementA ;
        }
      )
      .join( String.fromCharCode(32) ) // Reconstruct the string with space delimiters.
    ) ; // End of console.log call.

  }
)
(
  require('fs')
    .readFileSync( '/dev/stdin', 'utf8' ) // Read the content from standard input synchronously.
)
; // Final semicolon for the IIFE.