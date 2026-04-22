/* This is a Type I clone of a JavaScript program.
 * It processes input to find the number of "waves" in a sequence. */

// Immediately Invoked Function Expression (IIFE) starts here.
( function ( stdin ) {

  // Split the entire standard input string by newline characters.
  // This creates an array where each element is a line from the input.
  input   =   stdin . split ( "\n" ) ;

  // Parse the first line of input as an integer.
  // This 'n' typically represents the number of elements in the array 'a'.
  var   n   =   parseInt ( input [ 0 ] ,   10 ) ;

  // Split the second line of input by spaces to get an array of strings.
  // These strings will later be compared.
  var   a   =   input [ 1 ] . split ( " " ) ;


  // Initialize the counter for the number of "waves" found.
  var   ans   =   0 ;
  // Flag to indicate an increasing trend in the sequence.
  var   up   =   false ;
  // Flag to indicate a decreasing trend in the sequence.
  var   down   =   false ;

  // Loop through the array 'a' from the first element up to the second-to-last element.
  // We compare a[i] with a[i+1], so we need to stop before the last element.
  for   ( var   i   =   0 ;   i   <   n   -   1 ;   i ++ )   {

    // Check if the current element is less than the next element.
    // If true, it means the sequence is currently going "up".
    if   ( a [ i ]   <   a [ i   +   1 ] )   {
            up   =   true ; // Set the 'up' flag to true.
    }

    // Check if the current element is greater than the next element.
    // If true, it means the sequence is currently going "down".
    if   ( a [ i ]   >   a [ i   +   1 ] )   {
            down   =   true ; // Set the 'down' flag to true.
    }

    // If both an "up" trend and a "down" trend have been observed
    // within the current segment, it signifies a complete "wave".
    if   ( up   &&   down )   {
            up   =   down   =   false ; // Reset both flags to start looking for the next wave.
            ans ++ ; // Increment the wave counter.
    }
  }

  // Output the final count of waves to the console.
  // The "%d" is a format specifier, though often not strictly needed in modern console.log.
  console . log ( "%d" ,   ans ) ;

// The IIFE is immediately executed with the result of reading standard input.
} ) ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;
/* End of program. */