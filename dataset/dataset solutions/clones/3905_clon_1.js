/*
 * This JavaScript module is designed to process standard input.
 * It reads a sequence of numbers, performs sorting, and then
 * calculates a specific value for each original number based on its position
 * relative to the median of the sorted list.
 */

// Ensure the standard input stream remains open,
// preventing the process from exiting prematurely.
process.stdin.resume( );


// Set the character encoding for the input stream to UTF-8.
// This ensures correct interpretation of incoming data.
process.stdin.setEncoding( 'utf8' );


// A global variable to accumulate all received input data chunks.
var all_input = '';


/*
 * Event handler for when data chunks are received from stdin.
 * Each chunk is appended to the 'all_input' string.
 */
process.stdin.on( 'data', function ( chunk )
{

  all_input += chunk; // Concatenate the current data chunk.

} );


/*
 * Event handler for when the standard input stream ends.
 * This function contains the core logic for processing the collected input.
 */
process.stdin.on( 'end', function ( )
{

  // Split the entire collected input string into an array of lines.
  // Assuming input lines are separated by newline characters.
  lines = all_input.split( '\n' );

  // The first line is expected to be a number, 'n',
  // representing the count of elements for subsequent processing.
  n = lines[ 0 ];

  // The second line contains space-separated numbers, which will be processed.
  line = lines[ 1 ].split( ' ' );


  // Initialize an empty array to store the parsed integer values.
  var list = [ ];


  // Loop 'n' times to parse and populate the 'list' array.
  // Each element from the 'line' array is converted to an integer.
  for ( let i = 0; i < n; i++ )
  {
    list.push( parseInt( line[ i ] ) );
  }


  // Create a shallow copy of the 'list' array.
  // This copy will be sorted, while the original 'list' remains unchanged
  // to preserve the initial order.
  var sortedList = list.slice( );

  // Sort the 'sortedList' array in ascending numerical order.
  sortedList.sort( );


  // Initialize an empty object (dictionary) to map sorted values
  // back to their original indices in the 'list' array.
  var dict = { };


  /*
   * Iterate over the original 'list' to build the 'dict'.
   * For each value in the sorted list, store an array of its original indices.
   * This is crucial for retrieving the original position later.
   */
  for ( var i in list )
  {
    let val = sortedList[ i ]; // Get the value from the sorted list at index 'i'.

    if ( val in dict )
    {
      // If the value already exists as a key in 'dict',
      // push the current index 'i' to its associated array.
      dict[ val ].push( i );
    }
    else
    {
      // If the value is encountered for the first time,
      // create a new array containing 'i' and assign it to the value as key.
      dict[ val ] = [ i ];
    }
  }


  // Adjust the value of 'n'. This often indicates a shift from
  // count to 0-based maximum index, or a problem-specific adjustment.
  n -= 1;


  /*
   * Begin the main processing loop.
   * Iterate from 0 up to the adjusted 'n' (inclusive).
   * In each iteration, a specific 'ans' value is determined and logged.
   */
  for ( let i = 0; i <= n; i++ )
  {
    // Retrieve the current value from the original 'list'.
    var val = list[ i ];

    // Find the original index of this 'val'.
    // Convert 'val' to string for dictionary lookup if keys are strings,
    // and use .pop() to get and remove the last index (ensuring each index is used once).
    var index = dict[ val.toString( ) ].pop( );

    // Calculate the 'half' point (median index) of the sorted list.
    // Math.floor ensures an integer index.
    half = Math.floor( n / 2 );

    // Get the element at the 'half' index (left median candidate).
    var left = sortedList[ half ];

    // Get the element at the 'half + 1' index (right median candidate).
    var right = sortedList[ half + 1 ];

    // Initialize the answer for the current iteration.
    var ans = 0;

    // Determine 'ans' based on whether the original 'index'
    // falls into the first half or second half relative to 'half'.
    if ( index <= half )
    {
      ans = right; // If 'index' is in the first half, the answer is the 'right' median.
    }
    else
    {
      ans = left; // Otherwise, the answer is the 'left' median.
    }

    // Print the calculated answer to the console for the current element.
    console.log( ans );
  }

} );