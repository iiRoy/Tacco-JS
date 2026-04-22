// This JavaScript program processes input to calculate a specific sum based on given parameters.
// It's designed to read data from standard input, perform calculations, and then print the result.

const main = ( input ) =>
{
  // The input string is initially split into an array of lines.
  // Each element in the 'input' array now corresponds to a line from the original input.
  input = input . split ( "\n" ) ;

  // Extract N and X from the first line of the input.
  // input[0] contains the first line, which is then split by space.
  // The first part is N, the second part is X.
  const N = Number ( input [ 0 ] . split ( " " ) [ 0 ] ) ; // N represents the count of L values
  const X = Number ( input [ 0 ] . split ( " " ) [ 1 ] ) ; // X is the maximum allowed distance

  // Extract the array of L values from the second line of the input.
  // input[1] contains the second line, split by space, and each part is converted to a number.
  const Ls = input [ 1 ] . split ( " " ) . map ( ( L ) => Number ( L ) ) ; // Ls is an array of segment lengths

  // Initialize variables that will be used in the loop.
  var boundSum = 1 ;    // This variable counts the number of "bounds" or points reached. Starts at 1 for the origin.
  var distance = 0 ;    // This variable accumulates the total distance covered. Starts at 0.

  // Iterate through the array of segment lengths (Ls).
  // The loop continues as long as the index 'i' is less than N (the total number of segments).
  for ( var i = 0 ; i < N ; i ++ )
  {
    // Check if the accumulated distance has already exceeded or met the limit X.
    // If it has, we cannot add any more segments, so we exit the loop.
    if ( distance >= X )
    {
      break ; // Terminate the loop early
    }

    // Add the current segment's length to the total distance.
    distance += Ls [ i ] ; // Update the total distance

    // Increment the boundSum. Each time a new segment is considered and added (before checking X),
    // it implies we've reached a new potential bound.
    boundSum += 1 ; // Increment the count of bounds
  }

  // After the loop finishes, print the final calculated boundSum to the console.
  console . log ( boundSum ) ;
} ; // End of the main function definition

// This line executes the 'main' function.
// It reads the entire content of standard input ("/dev/stdin") as a UTF-8 string
// and passes it as the 'input' argument to the 'main' function.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;