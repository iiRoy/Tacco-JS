function myout ( text )
{

  console . log ( text ) ; // This function simply prints the given text to the console.

}



// The primary entry point for the program.
// It processes the input received from standard input.
function Main ( input )
{

  // First, remove any leading or trailing whitespace from the raw input string.
  input = input . trim ( ) ;


  // This line is commented out; it would split the input by spaces.
  // input = input . trim ( ) . split ( " " ) ;


  // Split the input string into an array of lines based on newline characters.
  input = input . trim ( ) . split ( "\n" ) ;


  // These lines are commented out; they would parse numbers from space-separated or newline-separated input.
  // input = input . trim ( ) . split ( " " ) . map ( ( a ) => Number ( a ) ) ;
  // input = input . trim ( ) . split ( "\n" ) . map ( ( a ) => Number ( a ) ) ;


  // The first element of the input array (after splitting by newlines) is expected to be the length.
  var len = parseInt ( input [ 0 ] ) ;


  // The second element is a space-separated string of numbers, which we convert to an array of actual numbers.
  var list = input [ 1 ] . split ( " " ) . map ( ( a ) => Number ( a ) ) ;


  // 'checked' will be used as a hash map (object) to count occurrences or track states of numbers in 'list'.
  var checked = { } ;


  // Iterate through the 'list' to populate the 'checked' object.
  // This loop counts how many times each number appears, but only up to 2.
  for ( var i = 0 ; i < len ; i ++ )
  {
    // If the current number from 'list' is not yet in 'checked' (or its value is null/undefined)...
    if ( checked [ list [ i ] ] == null )
    {
      // ...initialize its count to 1.
      checked [ list [ i ] ] = 1 ;
    }
    // Else if the current number has already been seen once...
    else if ( checked [ list [ i ] ] == 1 )
    {
      // ...increment its count to 2.
      checked [ list [ i ] ] ++ ;
    }
    // Numbers appearing more than twice will still have a count of 2 in 'checked'.
  }


  /*
   * This is a block comment containing some previously considered logic
   * for handling specific lengths (len == 1 or len == 2).
   * It's currently commented out and not part of the active execution flow.
   *
   * if ( len == 1 ) {
   *   myout ( 1 ) ;
   *   return ;
   * } else if ( len == 2 ) {
   *   myout ( 2 ) ;
   *   return ;
   * }
   */


  // myout ( checked ) ; // This line was likely used for debugging the 'checked' object.


  // Sort the 'list' array in ascending order.
  list . sort ( ) ;


  // Filter the 'list' to remove duplicate elements, keeping only unique values.
  // The filter function checks if the first occurrence of an element is at its current index.
  list = list . filter ( function ( x , i , self )
  {
    return self . indexOf ( x ) === i ;
  } ) ;


  // Initialize the output variable, which will store the final result.
  var output = 1 ;


  // Iterate through the unique sorted list to perform validation checks.
  for ( var i = 0 ; i < list . length ; i ++ )
  {
    // Special handling for the case where 'len' is odd and the current number is 0.
    if ( len % 2 == 1 && list [ i ] == 0 )
    {
      // If '0' does not appear exactly once, it's an invalid configuration.
      if ( checked [ list [ i ] ] != 1 )
      {
        myout ( "0" ) ; // Output "0" indicating an invalid scenario.
        return ; // Terminate the program.
      }
      continue ; // If 0 is valid, move to the next number in the list.
    }

    // For all other numbers (or if len is even), they must appear exactly twice.
    if ( checked [ list [ i ] ] != 2 )
    {
      myout ( "0" ) ; // Output "0" if a number does not appear twice.
      return ; // Terminate the program.
    }
  }


  // If 'len' is odd, the first element (which must be 0, handled above) is removed from the list.
  // This prepares the list for the power calculation.
  if ( len % 2 == 1 )
  {
    list . shift ( ) ;
  }


  // Calculate the final output: 2 raised to the power of the remaining number of unique elements in 'list'.
  output *= Math . pow ( 2 , list . length ) ;


  // Print the calculated output to the console.
  myout ( output ) ;

}


// Read input from standard input using Node.js 'fs' module and pass it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;