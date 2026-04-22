/*
 * This is the main function that processes the input.
 * It searches for a valid coordinate pair (X, Y) within a specific range.
 */
function Main ( input ) { // Function declaration with input parameter
  var   a   =   input . split ( "\n" ) ; // Split the input string by newline characters into an array 'a'.

  // Loop through possible X coordinates from 0 to 100
  for ( var   X   =   0 ;   X   <=   100 ;   X ++ ) {

    // Loop through possible Y coordinates from 0 to 100
    for ( var   Y   =   0 ;   Y   <=   100 ;   Y ++ ) {

      var   valid   =   isValid ( a , X , Y ) ; // Call isValid function to check if (X, Y) is valid

      // If a valid coordinate pair is found, return the result
      if ( valid ) {
        return   "" + X + " " + Y + " " + valid ; // Concatenate X, Y, and the valid height as a string
      } // End of if block
    } // End of inner for loop (Y)
  } // End of outer for loop (X)
} // End of Main function

/*
 * This helper function checks if a given (X, Y) coordinate pair is valid
 * based on the provided input data 'a'.
 * It returns the calculated height if valid, otherwise false.
 */
function   isValid ( a , X , Y ) { // Function to validate coordinates
  var   N   =   a [ 0 ] ; // Get the number of data points from the first element of 'a'
  var   H   =   0 ; // Initialize H (not used in this version, but kept for consistency)

  var   maxH   =   1000000000 ; // Initialize maximum possible height
  var   minH   =   1 ; // Initialize minimum possible height

  // Iterate through the data points starting from the second element (index 1)
  for ( var   n   =   1 ;   n   <=   N ;   n ++ ) {
    var   b   =   a [ n ] . split ( " " ) ; // Split each data point string by space
    var   x   =   b [ 0 ] * 1 ; // Parse x coordinate as a number
    var   y   =   b [ 1 ] * 1 ; // Parse y coordinate as a number
    var   h   =   b [ 2 ] * 1 ; // Parse height h as a number

    // Calculate the expected height 'mh' at (X, Y) based on the current data point (x, y, h)
    var   mh   =   h   +   Math . abs ( X   -   x )   +   Math . abs ( Y   -   y ) ;

    // If the height 'h' of the current data point is 0
    if ( h   ==   0 ) {
      // Update maxH if the calculated mh is smaller
      if ( maxH   >   mh ) {
        maxH   =   mh ;
      }
    } else { // If the height 'h' is not 0
      // Update maxH if mh is smaller
      if ( maxH   >   mh ) {
        maxH   =   mh ;
      }
      // Update minH if mh is larger
      if ( minH   <   mh ) {
        minH   =   mh ;
      }
    }

    // If at any point minH becomes greater than maxH, it's an invalid state
    if ( minH   >   maxH ) {
      return   false ; // Return false indicating invalid
    }
  } // End of for loop for data points

  // After checking all data points, if minH is not equal to maxH, it's invalid
  if ( minH   !=   maxH ) { return   false ; } // Check final height consistency

  return   minH ; // If all checks pass, return the consistent height
} // End of isValid function

/*
 * This part reads input from standard input,
 * calls the Main function, and prints the result to console.
 */
console . log ( Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ) ;