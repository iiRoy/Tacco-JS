/*
 * This JavaScript code processes a stream of text input.
 * It reads from stdin, performs several string manipulations,
 * and then prints a filtered and processed list of strings.
 */
x = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . replace ( /,/g , "" ) . trim () . split ( /\s/ ) ;


// Initialize an array to hold the final processed strings.
str2 = [ ] ;

// Initialize a temporary string buffer.
str = "" ;


/*
 * The main loop iterates through each element extracted from the input.
 * The variable 'i' is used as the loop counter.
 */
for ( i = 0 ; i < x . length ; i ++ ) {

  // console.log("Current element x[i]: " + x[i]); // Debug line: Shows the current element being processed.

  // Check if the current string contains any periods.
  if ( x [ i ] . replace ( /\./g , "" ) . length < x [ i ] . length ) {

    // console.log("Element contains a period: " + x[i]); // Debug line: Confirms period presence.

    // If it contains periods, further check its length after removing periods.
    if ( x [ i ] . replace ( /\./g , "" ) . length >= 3 && x [ i ] . replace ( /\./g , "" ) . length <= 6 ) {

      // console.log("Period-containing element matches length criteria: " + x[i]); // Debug line: Confirms length.

      // Check if the period is at the very end of the string.
      if ( x [ i ] . search ( /\./ ) >= x [ i ] . length - 1 ) {
        str += x [ i ] . replace ( /\./g , "" ) ; // Append the string with periods removed.
        str2 . push ( str ) ; // Add the accumulated string to the result array.
      } else {
        str += x [ i ] ; // If period is not at the end, append the string as is.
      }

      // console.log("Intermediate str2 state: " + str2); // Debug line: Shows str2 after push.
      str = "" ; // Reset the temporary string.

    } else {
      str2 . push ( str ) ; // If length criteria not met, push whatever is in 'str'.
      str = "" ; // Reset 'str'.
      // console.log("str2 after non-matching period-containing element: " + str2); // Debug line.
    }

  } else if ( x [ i ] . length >= 3 && x [ i ] . length <= 6 ) {
    // If the string does not contain periods, and its length is between 3 and 6 (inclusive).
    str += x [ i ] + " " ; // Append the string followed by a space.
  }

} // End of the main processing loop.


// Second loop: Iterate through the 'str2' array and print each element.
for ( i = 0 ; i < str2 . length ; ) {
    // Print the current element and then increment 'i'.
    console . log ( str2 [ i ++ ] ) ;
}