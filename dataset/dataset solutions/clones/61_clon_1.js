// This JavaScript file implements a large number addition algorithm.
// It reads two numbers as strings from standard input, adds them,
// and prints the sum or an "overflow" message if the sum is too long.

// Standard input setup.
// This section utilizes Node.js 'fs' module for synchronous file system operations
// to read the entire content from standard input (stdin) before processing.
var fs         = require ( 'fs' ) , // Import the 'fs' (file system) module.
    length     = fs . fstatSync ( process . stdin . fd ) . size , // Determine the exact size of data available in stdin.
    buffer     = new Buffer ( length ) , // Allocate a new buffer of the determined size.
    bytesRead  = fs . readSync ( process . stdin . fd , buffer , 0 , length , 0 ) , // Synchronously read data from stdin into the buffer.
    input      = buffer . toString ( 'utf8' , 0 , bytesRead ) . split ( '\n' ) ; // Convert the buffer to a UTF-8 string, then split it by newline characters into an array.

// Invoke the main function to start the program's execution.
main ( ) ;


// The primary function containing the core logic of the program.
function   main ( )
{
  // Loop through each test case or data set provided in the input.
  // The first line of input (input[0]) specifies the total number of data sets to process.
  for ( var dataSet = 1 , maxDataSet = input [ 0 ] ; dataSet <= maxDataSet ; dataSet ++ )
  {
    // Calculate the starting index for the current pair of numbers within the 'input' array.
    // Each data set consists of two numbers, so the index is twice the dataSet number.
    var idx = dataSet << 1 ; // Using a left bit shift (equivalent to multiplying by 2) for efficiency.

    // Retrieve the first number string, then reverse its digits.
    // Reversing makes it easier to perform column-wise addition from least significant to most significant digit.
    var first = input [ idx - 1 ] . split ( "" ) . reverse ( ) . join ( "" ) ;
    // Retrieve the second number string, and also reverse its digits.
    var second = input [ idx ] . split ( "" ) . reverse ( ) . join ( "" ) ;

    // Determine the lengths of the reversed number strings.
    var firstLen  = first . length ;
    var secondLen = second . length ;
    // Find the maximum length between the two numbers to correctly size the result array.
    var maxLen    = firstLen > secondLen ? firstLen : secondLen ;

    // Initialize an Int8Array to store the digits of the sum.
    // An extra element is added (maxLen + 1) to accommodate any potential carry-over for the most significant digit.
    var result = new Int8Array ( maxLen + 1 ) ;

    // Perform the digit-by-digit addition, starting from the least significant digit.
    // The loop iterates up to `maxLen` to cover all potential digit positions.
    for ( var i = 1 ; i < maxLen ; i ++ )
    {
      // Extract the digit from the 'first' number at the current position 'i'.
      // If the number is shorter than 'i', treat the missing digit as 0.
      // Subtracting 0 converts the character digit to a numeric digit.
      var firstChar  = firstLen <= i ? 0 : first [ i ] - 0 ;
      // Extract the digit from the 'second' number at the current position 'i'.
      // Similar logic for handling shorter numbers and character-to-number conversion.
      var secondChar = secondLen <= i ? 0 : second [ i ] - 0 ;

      // Calculate the sum for the current digit position.
      // This includes the digits from both numbers and any carry from the previous position (stored in `result[i]`).
      var val = firstChar + secondChar + result [ i ] ;

      // Check if the sum for the current position results in a carry-over to the next position.
      if ( val >= 10 )
      {
        // If there's a carry, increment the digit at the next position (i + 1).
        result [ i + 1 ] ++ ;
        // Store only the unit digit (remainder after subtracting 10) at the current position.
        result [ i ] = ( val - 10 ) ;
      }
      else
      {
        // If there's no carry, simply store the calculated sum at the current position.
        result [ i ] = val ;
      }
    }

    // Initialize an empty string to build the final sum.
    var resultStr = "" ;
    // Iterate through the 'result' array in reverse order to construct the string.
    // This effectively reverses the digits back into their correct order (most significant to least significant).
    for ( var i = result . length ; i -- ; )
    {
      // Conditions for appending a digit:
      // 1. The digit itself is non-zero (result[i]).
      // 2. Or, if 'resultStr' already contains digits (to handle cases like "001" correctly, preventing leading zeros unless they are the only digit).
      // 3. And, it's not the very first digit (index 0) if it's zero (to avoid printing "0" if the sum is "0" and there are leading zeros).
      if ( ( result [ i ] || resultStr ) && i )
      {
        resultStr += "" + result [ i ] ; // Concatenate the digit to the result string.
      }
    }

    // After calculating the sum, check if its string representation exceeds 80 characters.
    if ( resultStr . length >= 80 )
    {
      console . log ( "overflow" ) ; // If it's too long, print "overflow".
    }
    else
    {
      console . log ( resultStr ) ; // Otherwise, print the computed sum.
    }


  } // End of the loop for processing each data set.

} // End of the 'main' function definition.