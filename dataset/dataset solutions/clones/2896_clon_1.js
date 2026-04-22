function main ( input )
{
  // This function serves as the primary entry point for processing the input data.
  // It reads configuration, processes side lengths, and calculates a final result.

  /*
   * First, we preprocess the raw input string.
   * - `trim()` removes any leading or trailing whitespace.
   * - `split(/\r\n|\n/)` breaks the input into an array of lines,
   *   handling both Windows-style (`\r\n`) and Unix-style (`\n`) line endings.
   */
  var args = input . trim ( ) . split ( / \r\n | \n / ) ;

  // The first line of the input contains the number of elements to consider.
  // We parse this string into an integer with base 10.
  var num = parseInt ( args [ 0 ] , 10 ) ;


  /*
   * Next, we process the 'sides' data.
   * These are the lines between the first and the last lines of the input.
   * Each 'side' line contains two space-separated integers.
   *
   * - `slice(1, args.length - 1)` extracts the relevant lines.
   * - `map(l => { ... })` iterates over each line.
   *   - Inside the map, `l.split(" ")` splits the line by space.
   *   - `map((v) => parseInt(v, 10))` converts each part into an integer.
   *   - `sort((a, b) => a - b)` ensures the two numbers in each 'side' are
   *     always in ascending order (e.g., [3, 5] not [5, 3]).
   */
  var sides = args . slice ( 1 , args . length - 1 ) . map ( l => {

    var value = l . split ( " " ) . map ( ( v ) => parseInt ( v , 10 ) ) ;

    return value . sort ( ( a , b ) => a - b )
  } ) ;


  // The very last line of the input contains a series of space-separated values.
  // We parse these into an array of integers.
  var values = args [ args . length - 1 ] . split ( " " ) . map ( v => parseInt ( v , 10 ) ) ;

  // Sort these values in descending order.
  values . sort ( ( a , b ) => b - a ) ;

  // Keep only the first 'num' elements as determined by the initial input line.
  values = values . splice ( 0 , num ) ;


  /*
   * We create a map to group 'sides' based on their first element.
   * This helps in organizing the data for later processing.
   */
  var sidesMap = { } ;

  // Iterate through each 'side' and populate the `sidesMap`.
  for ( var i = 0 ; i < sides . length ; i ++ ) {

    // If the first element of the current 'side' hasn't been seen yet as a key,
    // initialize an empty array for it in the map.
    if ( ! sidesMap [ sides [ i ] [ 0 ] ] ) {
      sidesMap [ sides [ i ] [ 0 ] ] = [ ] ;
    }

    // Add the current 'side' to the array associated with its first element.
    sidesMap [ sides [ i ] [ 0 ] ] . push ( sides [ i ] ) ;
  }


  // Convert the grouped 'sidesMap' into an array of arrays of sides.
  // Each inner array represents a group of sides sharing the same first element.
  groupSides = Object . keys ( sidesMap ) . map ( k => sidesMap [ k ] ) ;

  // Sort these groups based on their length, in ascending order.
  // Groups with fewer sides will come first.
  groupSides . sort ( ( a , b ) => {
    return a . length < b . length ;
  } ) ;

  // Flatten the array of grouped sides back into a single array,
  // maintaining the order established by the group sorting.
  sortedSides = groupSides . reduce ( ( a , c ) => {
    return a . concat ( c ) ;
  } , [ ] ) ;


  // Initialize variables for the main calculation loop.
  var result = 0 ;
  var resultCombination = [ ] ; // This variable is declared but not used in the original logic.
  var cache = { } ; // Used to store values associated with side elements.

  // Create a mutable copy of the `values` array for `shift()` operations.
  var tempValues = values . concat ( )

  /*
   * Main loop to calculate the final result.
   * It iterates through the `sortedSides` array.
   */
  for ( var j = 0 ; sortedSides . length > j ; j ++ ) {

    // Check if the first element of the current 'side' is already in the cache.
    // If not, take the next available value from `tempValues` and store it.
    if ( ! cache [ sortedSides [ j ] [ 0 ] ] ) {
      cache [ sortedSides [ j ] [ 0 ] ] = tempValues . shift ( ) ;
    }

    // Do the same for the second element of the current 'side'.
    if ( ! cache [ sortedSides [ j ] [ 1 ] ] ) {
      cache [ sortedSides [ j ] [ 1 ] ] = tempValues . shift ( ) ;
    }

    // Determine the minimum of the two cached values for the current side.
    var min = Math . min ( cache [ sortedSides [ j ] [ 0 ] ] , cache [ sortedSides [ j ] [ 1 ] ] ) ;

    // Add this minimum value to the total result.
    result += min ;
  }


  // Output the final result followed by a newline and the original `values` array
  // joined by spaces.
  console . log ( result + ' \n ' + values . join ( " " ) ) ;
}


// This line reads the input from standard input and passes it to the `main` function.
// `require("fs").readFileSync("/dev/stdin", "utf8")` reads the entire file synchronously
// from the standard input stream as a UTF-8 encoded string.
main ( require ( "fs" ) . readFileSync ( " /dev/stdin " , " utf8 " ) ) ;