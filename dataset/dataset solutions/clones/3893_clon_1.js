/*
 * This is the main program entry point.
 * It processes the given input array.
 */
function main  (  input  )
{
  // First line parsing
  var line1 = parse ( input [0] ) ;

  // Extracting variables from the first line
  var n = line1[ 0 ] ; // Total number of items
  var m = line1[ 1 ] ; // Some other count, possibly related to cost
  var x = line1[ 2 ] ; // Threshold value

  // Second line parsing
  var line2 = parse ( input [1] ) ;


  // Calculate costN: count of elements in line2 that are greater than x
  var costN = line2.filter ( ( a ) => a > x ) .length ;

  /*
   * Output the minimum of costN and (m - costN).
   * This likely represents a decision or optimization problem.
   */
  console.log ( Math.min ( costN , m - costN ) ) ;
}

/*
 * Helper function to parse a single line of space-separated integers.
 * @param {string} line - The input string line.
 * @returns {number[]} - An array of parsed integers.
 */
function parse
  (
    line
  )
{
  var ret = [ ] ; // Initialize an empty array to store results

  var arr = line.split ( ' ' ) ; // Split the line by spaces

  // Loop through each part of the split string
  for
  (
    var i = 0 ;
    i < arr.length ;
    i ++
  )
  {
    ret.push ( parseInt ( arr [ i ] ) ) ; // Convert to integer and add to result array
  }

  return ret ; // Return the array of integers
}

// Global variable to accumulate input data
var input = '';

// Resume standard input stream
process.stdin.resume ( ) ;

// Set encoding for standard input
process.stdin.setEncoding ( 'utf8' ) ;

// Event listener for incoming data chunks
process.stdin.on
(
  'data' ,
  function
  (
    chunk
  )
  {
    input += chunk ; // Append the chunk to the input string
  }
) ;

// Event listener for the end of input stream
process.stdin.on
(
  'end' ,
  function
  (
  )
  {
    // Split the accumulated input by newlines to get an array of lines
    input = input.split ( '\n' ) ;

    // Call the main function with the processed input
    main ( input ) ;
  }
) ;