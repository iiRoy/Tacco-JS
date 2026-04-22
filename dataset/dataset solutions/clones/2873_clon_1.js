debug = false /* Controls whether debug messages are printed to console */


function log ( ) {
  // Check if debugging is enabled
  if ( debug )
  {
    var arr = [ ] ; // Initialize an empty array to hold arguments
    /* Loop through all passed arguments */
    for ( var i = 0 ; i < arguments . length ; i ++ ) {
      arr . push ( arguments [ i ] ) ; // Add each argument to the array
    }
    console . log ( arr . join ( ', ' ) ) ; // Output arguments joined by a comma and space
  }
}


/*
 * Main function that processes the input string.
 * It reads various parameters and performs checks based on substrings.
 */
function Main ( input ) {

  lines = input . split ( "\n" ) ; // Split the input string into an array of lines

  f = lines [ 0 ] . split ( " " ) ; // Split the first line by spaces to get parameters

  N = f [ 0 ] ; // N is the first parameter (string)
  A = f [ 1 ] * 1 ; // A is the second parameter, converted to a number
  B = f [ 2 ] * 1 ; // B is the third parameter, converted to a number
  C = f [ 3 ] * 1 ; // C is the fourth parameter, converted to a number
  D = f [ 4 ] * 1 ; // D is the fifth parameter, converted to a number

  s = lines [ 1 ] ; // s is the second line of the input (the main string)

  log ( N , A , B , C , D , s ) ; // Log all initial parameters for debugging

  bool = true ; // Initialize a boolean flag to true

  // Conditional logic block if C is greater than D
  if ( C > D ) {
    end = D ; // Set 'end' variable to D initially
    if ( C - D <= 3 ) { // If the difference between C and D is 3 or less
      end = C ; // Update 'end' to C
    }
    s2 = s ; // Create a copy of the main string 's'
    // Check a specific character in s2
    if ( s [ D - 2 ] == '#' ) {
      log ( s2 , s2 [ D - 1 ] ) ; // Log current s2 and character at D-1
      // Note: The original code had an issue here trying to assign to s2[D-1] which is not allowed for strings.
      // The line below effectively replaces the character, making s2 a new string.
      s2 = s2 . slice ( 0 , D - 1 ) + '#' + s2 . slice ( D ) ;
    }
    log ( s2 ) ; // Log the modified s2
    str = s2 . slice ( B - 1 , end ) ; // Extract a substring from s2
    log ( str , bool ) ; // Log the extracted substring and the boolean flag
    // Check if the substring contains "..."
    bool = bool && ( ( / \. \. \. / ) . test ( str ) ) ;
    log ( str , bool ) ; // Log again after the check
  }

  // First check for "##" pattern within a specific slice of 's'
  str = s . slice ( A - 1 , C ) ;
  bool = bool && ! ( ( / # # / ) . test ( str ) ) ; // Ensure no "##" exists
  log ( str , bool ) ;

  // Second check for "##" pattern within another specific slice of 's'
  str = s . slice ( B - 1 , D ) ;
  bool = bool && ! ( ( / # # / ) . test ( str ) ) ; // Ensure no "##" exists
  log ( str , bool ) ;

  // Determine the final answer based on the boolean flag
  ans = bool ? 'Yes' : 'No' ;

  console . log ( ans ) ; // Output the final answer
}

// Read input from standard input and pass it to the Main function
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;