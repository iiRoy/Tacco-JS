// This script is designed to read and process data from standard input.
// It performs a series of array manipulations based on numerical instructions provided in the input.

var input = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ;
// The initial step involves reading the entire content of standard input.
// The data is read as a UTF-8 encoded string.

var Arr = ( input . trim ( ) ) . split ( "\n" ) ;
// The raw input string is first trimmed to remove any leading or trailing whitespace characters.
// Subsequently, it is split into an array of strings, with each element representing a single line from the input.


// The core logic of the program resides within this infinite loop.
// It will continue to execute until an explicit 'break' statement is encountered.
while ( true )
{
  // From the 'Arr' array, the first element (which is a line of numbers) is removed and processed.
  // This line is split by spaces, and each resulting string is converted into a number.
  var nr = ( Arr . shift ( ) ) . split ( " " ) . map ( Number ) ;

  // This conditional statement checks for the termination condition of the loop.
  // If both the first and second numbers extracted (nr[0] and nr[1]) are zero, the loop will exit.
  if ( nr [ 0 ] == 0 && nr [ 1 ] == 0 )
  {
    break ; // Terminates the 'while(true)' loop.
  }

  // An empty array 'n' is declared and initialized. This array will be the subject of manipulations.
  var n = [ ] ;

  // This 'for' loop populates the array 'n'.
  // It fills 'n' with numbers starting from 'nr[0]' down to 1, in decreasing order.
  for ( var i = 0 ; i < nr [ 0 ] ; i ++ )
  {
    n [ i ] = nr [ 0 ] - i ;
  }


  // This nested 'for' loop executes a series of array rearrangement operations.
  // The number of operations is determined by the second value extracted from the input, 'nr[1]'.
  for ( var i = 0 ; i < nr [ 1 ] ; i ++ )
  {
    // Similar to 'nr', another line is shifted from 'Arr', split, and converted to numbers.
    // These numbers, 'pc[0]' and 'pc[1]', define the parameters for the current array manipulation.
    var pc = ( Arr . shift ( ) ) . split ( " " ) . map ( Number ) ;

    // 'p' represents the starting index (0-based) of the segment to be moved within array 'n'.
    // It's derived by subtracting 1 from the first number in 'pc'.
    var p = pc [ 0 ] - 1 ;

    // 'c' represents the count of elements that constitute the segment to be moved.
    // It's directly taken from the second number in 'pc'.
    var c = pc [ 1 ] ;


    // A new array 'a' is created, containing all elements of 'n' from the beginning up to, but not including, index 'p'.
    var a = n . slice ( 0 , p ) ;

    // Array 'b' is created, containing the segment of 'c' elements starting at index 'p'.
    var b = n . slice ( p , p + c ) ;

    // Array 'c' (note: this 'c' is a new variable, shadowing the previous 'c' for count)
    // This array holds the remaining elements of 'n' after the segment 'b'.
    var c = n . slice ( -1 * ( n . length - p - c ) ) ;


    // The array 'n' is then reconstructed by concatenating 'b', 'a', and the new 'c' in that specific order.
    // This effectively moves the segment 'b' to the front, followed by 'a', and then the rest of the array.
    n = b . concat ( a , c ) ;
  }

  // After all array manipulations for the current set of 'nr' parameters are complete,
  // the first element of the modified array 'n' is printed to the console.
  console . log ( n [ 0 ] ) ;
}

// The script concludes its execution once the 'while' loop is terminated.