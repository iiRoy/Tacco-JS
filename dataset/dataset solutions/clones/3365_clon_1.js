// This is the main function of the program.
// It takes an array 'input' as its argument.
function main( input )
{
  // Initialize a counter variable 'ans' to zero.
  // This variable will store the final count.
  var ans = 0 ;

  // Loop through the characters of the first string in the input array.
  // The input array is expected to contain strings.
  for ( var i = 0 ; i < input[ 0 ].length ; i ++ )
  {
    // Check if the current character is exactly '2'.
    // Using strict equality operator '===' for comparison.
    if ( input[ 0 ][ i ] === '2' )
      // If the character is '2', increment the 'ans' counter.
      ans ++ ;
  }

  // After the loop, print the final count to the console.
  console.log( ans ) ;
}




// This utility function is designed to parse a single line of input.
// It converts a space-separated string of numbers into an array of integers.
function parse( line )
{
  // Initialize an empty array to store the parsed integers.
  var ret = [ ] ;

  // Split the input 'line' string by spaces to get an array of string numbers.
  var arr = line . split ( ' ' ) ;

  // Iterate over each string number in the 'arr' array.
  for ( var i = 0 ; i < arr . length ; i ++ )
  {
    // Convert the current string number to an integer and push it into the 'ret' array.
    ret . push ( parseInt ( arr [ i ] ) ) ;
  }

  // Return the array of parsed integers.
  return ret ;
}


// Declare a global variable 'input' to accumulate all incoming data.
var input = '' ;


// Resume the standard input stream.
process . stdin . resume ( ) ;

// Set the encoding for the standard input stream to UTF-8.
process . stdin . setEncoding ( 'utf8' ) ;

// Attach an event listener for 'data' events on the standard input.
// This callback function appends each received chunk of data to the 'input' variable.
process . stdin . on ( 'data' , function ( chunk )
{
  input += chunk ; // Concatenate the new chunk to the existing input string.
} ) ;

// Attach an event listener for the 'end' event on the standard input.
// This callback function is executed once all input has been received.
process . stdin . on ( 'end' , function ( )
{
  // Split the accumulated input string by newline characters.
  // This typically creates an array where each element is a line from the input.
  input = input . split ( '\n' ) ;

  // Call the main function with the processed input array.
  main ( input ) ;
} ) ;