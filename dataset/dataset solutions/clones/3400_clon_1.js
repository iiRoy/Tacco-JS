/*
 * This file contains the main logic for processing an input array
 * and calculating a specific result based on its elements.
 *
 * It demonstrates array manipulation, conditional logic, and looping constructs.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

function Main ( input )
{
  // Split the input string by newline characters to get individual lines.
  input = input . split ( "\n" ) ;

  // Parse the first line as an integer to get the size N.
  var N = parseInt ( input [ 0 ] ) ;

  // Initialize array A with size N.
  A = new Array ( N ) ;

  // Split the second line by spaces to get temporary string values.
  tmp = input [ 1 ] . split ( " " ) ;

  // Populate array A by parsing each temporary string as an integer.
  for ( i = 0 ; i < N ; i ++ )
  {
    A [ i ] = parseInt ( tmp [ i ] ) ;
  }

  // Initialize 'ans' variable. This will be overwritten shortly.
  var ans = 1 ;

  // Initialize 'flag' variable to control program flow.
  var flag = 0 ;

  // Re-initialize 'ans' variable to zero.
  var ans = 0 ;

  // Original comment: //var c=0; -- This line was commented out in the original.

  // Initialize 'c' variable to one.
  var c = 1 ;

  // Create array B and fill it with ones. Its initial size is based on the first element of A.
  B = new Array ( A [ 0 ] ) . fill ( 1 ) ;

  // Main processing loop, iterating from the second element of A.
  for ( i = 1 ; i < N ; i ++ )
  {
    // Check if the 'flag' is set to 2.
    if ( flag == 2 )
    {
      // Inner loop to iterate through elements of B.
      for ( j = 0 ; j < B . length ; j ++ )
      {
        // Original comment: //c=Math.max(c,B[j]); -- This line was commented out.

        // Check if the current element of B is different from its first element.
        if ( B [ j ] != B [ 0 ] )
        {
          // If different, set flag to 1 and break the inner loop.
          flag = 1 ;
          break ;
        }
        else
        {
          // If not different, set flag to 0.
          flag = 0 ;
        }
      } // End of inner loop for B elements.
    } // End of flag == 2 condition.

    // Check if the current element of A is greater than the previous element.
    if ( A [ i ] > A [ i - 1 ] )
    {
      // Loop to push ones into array B a certain number of times.
      for ( j = 0 ; j < A [ i ] - A [ i - 1 ] ; j ++ )
      {
        B . push ( 1 ) ; // Add a '1' to the end of array B.

        // If flag is not 0, set it to 1.
        if ( flag != 0 )
        {
          flag = 1 ;
        }
      } // End of loop for pushing ones.

    }
    // Else if flag is 0.
    else if ( flag == 0 )
    {
      // Increment the value at a specific index in B.
      B [ A [ i ] - 1 ] = B [ A [ i ] - 1 ] + 1 ;

      // Slice array B, keeping elements up to A[i].
      B = B . slice ( 0 , A [ i ] ) ;

      // If B's length is not 1.
      if ( B . length != 1 )
      {
        flag = 1 ; // Set flag to 1.
        c ++ ;     // Increment 'c'.
      }
    }
    // Else if flag is 1.
    else if ( flag == 1 )
    {
      // Slice array B, keeping elements up to A[i].
      B = B . slice ( 0 , A [ i ] ) ;

      // Loop backward through a portion of array B.
      for ( j = A [ i ] - 1 ; j >= 0 ; j -- )
      {
        // If B[j] equals 'c', set it to 1.
        if ( B [ j ] == c )
        {
          B [ j ] = 1 ;
        }
        // Else if B[j] is not equal to 'c'.
        else if ( B [ j ] != c )
        {
          B [ j ] = B [ j ] + 1 ; // Increment B[j].
          flag = 2 ;              // Set flag to 2.
          break ;                 // Break the backward loop.
        }
      } // End of backward loop.
    } // End of else if flag == 1.
  } // End of main processing loop.

  // Final loop to find the maximum value in array B and store it in 'ans'.
  for ( i = 0 ; i < B . length ; i ++ )
  {
    ans = Math . max ( ans , B [ i ] ) ;
  }

  // Output the final answer to the console.
  console . log ( '%s' , ans ) ;
}


// Debug function definition.
// This function is typically used for local testing or debugging purposes
// when running in a browser environment.
function debug ( )
{
  // Retrieve input from a DOM element with id "input".
  var input = document . getElementById ( "input" ) . value ;

  // Call the main processing function with the debug input.
  Main ( input ) ;
}
// This line executes the Main function by reading input from standard input,
// which is common in competitive programming environments.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;