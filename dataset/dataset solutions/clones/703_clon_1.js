// This script is designed to handle standard input (stdin)
// and process numerical data received line by line.

process . stdin . resume ( ) ; // Ensures the standard input stream remains open.
process . stdin . setEncoding ( 'utf8' ) ; // Sets the character encoding for incoming data to UTF-8.

// Attaches an event listener to the 'data' event of the stdin stream.
// This function will be called whenever new data (a line) is received.
process . stdin . on ( 'data' , function ( line ) {
  // Delegates the processing of the received line to the 'before' function.
  before ( line ) ;
} ) ;


// Declares a variable 'log' and assigns it the console.log function.
// This is a common shortcut for convenience in logging output.
var log = console . log ;


/**
 * Preprocesses a raw input line received from stdin.
 * It splits the input into individual lines, filters out any empty ones,
 * and then passes the cleaned array of lines to the main processing logic.
 *
 * @param {string} line - The raw string input, potentially containing multiple lines.
 */
function before ( line ) {

  // Splits the input string by newline characters to create an array of strings.
  var lines = line . split ( "\n" ) ;

  // Filters the 'lines' array to remove any elements that are empty strings.
  // This ensures that only non-empty lines are passed for further processing.
  lines = lines . filter ( function ( e ) {
    return ( e !== "" ) ; // Returns true for non-empty elements.
  } ) ;

  // Calls the 'main' function with the filtered array of lines.
  main ( lines ) ;
}


// -----------------------------------------------------------------------------
// This marks the beginning of the core logic function.
// -----------------------------------------------------------------------------

/**
 * The main function responsible for processing an array of string-represented numbers.
 * It expects the first number in a sequence to indicate the count of subsequent numbers
 * that form a data set. It then removes the minimum and maximum from that set
 * and calculates the rounded average of the remaining numbers.
 *
 * @param {Array<string>} lines - An array of strings, each expected to be a number.
 */
function main ( lines ) {

  // Converts each string element in the 'lines' array to a numerical type.
  var ls = lines . map ( function ( e ) {
    return Number ( e ) ; // Converts string 'e' to a number.
  } ) ;

  // Continues looping as long as there are at least two elements left in 'ls'.
  // This ensures there's at least a 'tpl' value and one element for 'arr'.
  while ( ls . length > 1 ) {

    // Removes the first element from 'ls' and assigns it to 'tpl'.
    // 'tpl' determines the size of the next array to be processed.
    var tpl = ls . shift ( ) ;

    // Extracts a sub-array 'arr' from 'ls' starting from index 0 up to 'tpl' elements.
    var arr = ls . slice ( 0 , tpl ) ;

    // Updates 'ls' by removing the elements that were just moved to 'arr'.
    ls = ls . slice ( tpl ) ;

    // Finds the index of the minimum value within the 'arr' array.
    // Math.min.apply(this, arr) is used to find the minimum element in an array.
    var mid = arr . indexOf ( Math . min . apply ( this , arr ) ) ;

    // Removes the element at the 'mid' index (the minimum value) from 'arr'.
    // The second argument '1' indicates that only one element should be removed.
    arr . splice ( mid , 1 ) ;

    // Finds the index of the maximum value within the *modified* 'arr' array.
    var Mid = arr . indexOf ( Math . max . apply ( this , arr ) ) ;

    // Removes the element at the 'Mid' index (the maximum value) from 'arr'.
    arr . splice ( Mid , 1 ) ;

    // Calculates the sum of the remaining elements in 'arr' using the reduce method.
    var sum = arr . reduce ( function ( p , c , i , a ) {
      return p + c ; // 'p' is the accumulator (previous value), 'c' is the current value.
    } ) ;

    // Calculates the average of the remaining elements, rounds it to the nearest integer,
    // and then outputs the result using the 'log' function (console.log).
    log ( Math . round ( sum / arr . length ) ) ;
  }
}