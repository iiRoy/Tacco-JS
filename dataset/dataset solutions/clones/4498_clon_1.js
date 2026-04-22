// This script processes standard input to generate a specific output string.
// It's designed to read a number 'N' and then 'N' integers,
// and rearrange them into two strings based on their position.

process . stdin . setEncoding ( 'utf8' ) ; // Configure standard input to use UTF-8 encoding.

/*
 * Attach an event listener to the 'readable' event of process.stdin.
 * This function will be called whenever there's data available to read.
 */
process . stdin . on ( 'readable' , function ( ) {

  var  chunk  =  process . stdin . read ( ) ;  // Attempt to read available data from the input stream.
  var  inputLineArr ; // Declare a variable to hold an array of input lines.

  // Only proceed if a chunk of data was actually received and is not null.
  if  ( chunk  !==  null )  {
    inputLineArr  =  chunk . split ( '\n' ) ; // Split the received chunk into individual lines using the newline character as a delimiter.

    // Check if the last line in the array is empty (often happens with terminal input).
    if ( inputLineArr [ inputLineArr . length - 1 ] == '' ) {
      inputLineArr . pop ( ) ; // Remove the empty line from the end of the array.
    }

    // Extract the value of N from the first line of input.
    var  n  =  inputLineArr [ 0 ] ;

    // Extract the array of integers 'ai' from the second line of input.
    // It splits the line by spaces and then converts each part to an integer.
    var  ai  =  inputLineArr [ 1 ] . split ( ' ' ) . map (
      function ( elem ) {
        return parseInt ( elem ) ; // Convert each string element to its integer representation.
      }
    ) ;

    // Initialize two empty strings that will be built during the processing.
    var  s1  =  '' ,
        s2  =  '' ;

    /*
     * This loop iterates through the 'ai' array from right to left.
     * It processes elements in steps of 2, effectively handling pairs.
     * For example, if n = 5, it processes indices 4, 2, 0.
     */
    for ( var  i  =  n - 1 ;  i  >=  0 ;  i -= 2 ) {
      s1  +=  ai [ i ]  +  ' ' ; // Append the current element (at index i) to string s1, followed by a space.

      // If 'i' is not 0 (meaning there's a preceding element),
      // prepend the element at 'i-1' to string s2.
      if ( i  !==  0 ) {
        s2  =  ai [ i - 1 ]  +  ' '  +  s2 ; // Prepend the element at (i-1) to s2, followed by a space.
      }
    }

    // Finally, print the concatenated result of s1 and s2 to the console.
    console . log ( s1  +  s2 ) ;
  } // End of the 'if (chunk !== null)' block.

} ) ; // End of the 'process.stdin.on' event listener.