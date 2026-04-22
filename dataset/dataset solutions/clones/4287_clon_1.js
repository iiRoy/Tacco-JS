function myin ( )
{
  /* This utility function reads input from standard input.
   * It uses the 'fs' module to synchronously read the file.
   * The input is expected to be UTF-8 encoded and any leading/trailing
   * whitespace is removed using .trim(). */
  return require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ;
}


// Function for standard output operations.
function myout ( t )
{
  console . log ( t ) ; // Prints the given argument 't' to the console.
}


// Function for standard error output.
function myerr ( t )
{
  console . error ( t ) ; // Writes the argument 't' to the standard error stream.
}


/*
 * This section describes conversion options for the 'myconv' function.
 *
 * Conversion Type Parameters (no):
 *   0: No operation; returns the input as is.
 *   1: Converts the input string to an integer.
 *   2: Splits the input string by single spaces (" ").
 *   3: Splits the input string by newline characters ("\n").
 *   4: Splits by spaces and then converts each part to a number,
 *      resulting in an array of numbers.
 *   5: Splits by newlines and then converts each part to a number,
 *      resulting in an array of numbers.
 *   6: Splits the input string into an array of individual characters.
 *   7: Splits into characters and then converts each character to a number,
 *      resulting in an array of numbers.
 */
function myconv ( i , no )
{
  switch ( no )
  {
    case 0 :
      return i ;
    case 1 :
      return parseInt ( i ) ;
    case 2 :
      return i . split ( " " ) ;
    case 3 :
      return i . split ( "\n" ) ;
    case 4 :
      return i . split ( " " ) . map ( ( a ) => Number ( a ) ) ;
    case 5 :
      return i . split ( "\n" ) . map ( ( a ) => Number ( a ) ) ;
    case 6 :
      return i . split ( "" ) ;
    case 7 :
      return i . split ( "" ) . map ( ( a ) => Number ( a ) ) ;
  }
}


/*
 * The primary function that orchestrates the program's logic.
 * It takes raw input, processes it, and then outputs a result.
 */
function Main ( input )
{
  // First, split the entire input string by newline characters.
  input = myconv ( input , 3 ) ;

  // Extract the first line and convert it to an integer, storing it as N.
  var N = myconv ( input [ 0 ] , 1 ) ;

  // Extract the second line, split by spaces, and convert parts to numbers,
  // storing the result as a list (array of numbers).
  var list = myconv ( input [ 1 ] , 4 ) ;

  // Calculate 3 raised to the power of N, storing the result in 'output'.
  var output = Math . pow ( 3 , N ) ;

  // Initialize a variable 'even' to 1. This will accumulate products related to even numbers.
  var even = 1 ;

  // Loop through the 'list' array from index 0 up to (but not including) N.
  for ( var i = 0 ; i < N ; i ++ )
  {
    // Check if the current element in 'list' is an even number.
    if ( list [ i ] % 2 == 0 )
    {
      // If it's even, multiply 'even' by 2.
      even *= 2 ;
    }
  }

  // Calculate the final result by subtracting 'even' from 'output'.
  // Then, print this final result to standard output.
  myout ( output - even ) ;
}


// This is the entry point of the program.
// It calls the Main function, passing the content read from standard input.
Main ( myin ( ) ) ;