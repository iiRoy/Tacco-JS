var input = require( "fs" ). readFileSync( "/dev/stdin", "utf8" ) . trim() . split( "\n" ) ;

// This 'obj' acts as a custom iterator for the input array.
var obj = {

  "list"  : input, // The array of input lines.
  "index" : 0,     // Current position in the array.
  "max"   : input.length, // Total number of elements.

  /**
   * Retrieves the next element from the list.
   * Throws an error if no more elements are available.
   * @returns {string} The next element.
   */
  "next" : function() {

    if ( ! this.hasNext() ) { // Check if there are more elements.
      throw "NoSuchElementException:次に要素は無いよ" ; // Error if no next element.
    }

    var returnObj = this.list[ this.index ]; // Get the current element.
    this.index++; // Advance the index.

    return returnObj ; // Return the element.
  },

  /**
   * Checks if there are more elements in the list.
   * @returns {boolean} True if there are more elements, false otherwise.
   */
  "hasNext" : function() {
    return ( this.index < this.max ) ;
  }

} ; // End of obj definition.


// Start the main execution flow.
Main() ;


/* Helper function to get the next input line. */
function next() {
  return obj.next() ;
}


/* Helper function to check for more input lines. */
function hasNext() {
  return obj.hasNext() ;
}


/*
 * Function for standard output.
 * @param {*} t - The value to be printed to console.
 */
function myout( t ) {
  console.log( t ) ; // Uses console.log for output.
}


/*
 * Function for standard error output.
 * @param {*} t - The value to be printed to error stream.
 */
function myerr( t ) {
  console.error( t ) ; // Uses console.error for error output.
}


/*
 * This function provides various conversion utilities.
 * [no] parameter defines the conversion type:
 *   - Default/Unknown: Returns input as is.
 *   - 1: Converts to integer.
 *   - 2: Splits string by half-width space.
 *   - 4: Splits string by half-width space and converts elements to numbers.
 *   - 6: Splits string by character.
 *   - 7: Splits string by character and converts elements to numbers.
 *   - 8: Joins array elements with half-width space.
 *   - 9: Joins array elements with newline.
 *   - 0: Joins array elements without any separator.
 * @param {*} i - The input value to be converted.
 * @param {number} no - The conversion type identifier.
 * @returns {*} The converted value.
 */
function myconv( i, no ) {

  try {

    switch ( no ) {

      case 1 : return parseInt( i ) ;
      case 2 : return i.split( " " ) ;
      case 4 : return i.split( " " ).map( ( a ) => Number( a ) ) ;
      case 6 : return i.split( "" ) ;
      case 7 : return i.split( "" ).map( ( a ) => Number( a ) ) ;
      case 8 : return i.join( " " ) ;
      case 9 : return i.join( "\n" ) ;
      case 0 : return i.join( "" ) ;

      default: return i ; // No conversion specified, return original input.
    }

  } catch ( e ) {
    return i ; // In case of error during conversion, return original input.
  }

} // End of myconv function.


/*
 * Main function where the primary logic resides.
 * It processes a string based on its length and alphabetical order.
 */
function Main() {

  var s = next() ; // Get the first line of input.

  // Logic for strings shorter than 26 characters:
  // Find the lexicographically smallest unused character and append it.
  //
  // Logic for strings exactly 26 characters long:
  // Check if it's "zyxwvutsrqponmlkjihgfedcba".
  // If not, identify the first non-lexicographically ordered position,
  // replace the character before it with the next character in dictionary order,
  // and truncate the rest of the string. (This part of logic is currently empty).

  // Initialize a list with all lowercase English alphabets.
  var list = myconv( "abcdefghijklmnopqrstuvwxyz", 6 ) ;

  if ( s.length < 26 ) {

     // Remove characters from 'list' that are present in 's'.
     for ( var i = 0 ; i < s.length ; i++ ) {
       list[ list.indexOf( s[i] ) ] = "" ; // Mark character as used by setting to empty string.
     }

    myerr( list ) ; // Debug output of the remaining characters.

     // Find the first unused character (lexicographically smallest) and append it to 's'.
     for ( var i = 0 ; i < 26 ; i++ ) {
       if ( list[i] != "" ) {
          s += list[i] ; // Append the character.
         break ; // Found and appended, exit loop.
       }
     }

    myout( s ) ; // Output the modified string.

  } else { // s.length is 26 or more.

    // Specific check for the reverse alphabetical string.
    if ( s == "zyxwvutsrqponmlkjihgfedcba" ) {
       myout( -1 ) ; // Output -1 for this specific case.
    } else {
       // Placeholder for other 26-character string logic.
       // This block is empty in the original code, hence remains empty.
    }

  }

} // End of Main function.