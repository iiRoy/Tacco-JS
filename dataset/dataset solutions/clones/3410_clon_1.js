function    main  ( input )
{
  // This function processes the input string, which is expected
  // to contain newline-separated numbers.
  // Each line is parsed into an integer and stored in an array.
  input = input . split ( '\n' ) . map ( ( n ) => parseInt ( n , 10 ) ) ;


  // The first element of the input array is stored in 'COUNT'.
  // Note: 'COUNT' is not actually used in subsequent calculations.
  const COUNT = input [ 0 ] ;


  // Remove the first element from the array.
  // This modifies the 'input' array in place.
  input . shift ( ) ;


  // Find the maximum numeric value among the remaining elements in the 'input' array.
  const MAX = Math . max . apply ( null , input ) ;


  // Determine the zero-based index of the first occurrence of the maximum value.
  const maxIndex = input . indexOf ( MAX ) ;


  // Halve the value of the element found at 'maxIndex'.
  // The result is assigned back to the same position in the array.
  input [ maxIndex ] = ( input [ maxIndex ] / 2 ) ;


  // Calculate the sum of all elements in the modified 'input' array.
  // The 'reduce' method iterates through the array, accumulating the sum.
  sum = input . reduce ( ( a , x ) => a += x , 0 ) ;

  // Print the final calculated sum to the console.
  console . log ( sum ) ;

} // End of the 'main' function definition


// This line ensures the script can read input from standard input (e.g., via a pipe).
// It reads the entire content of '/dev/stdin' as a UTF-8 string,
// and then passes it as an argument to the 'main' function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;