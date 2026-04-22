/* This is a Type I clone of the original JavaScript code.
 * It preserves all logical and structural elements.
 * Only whitespace and comments have been altered.
 */


// Define the main function to process input
function Main ( s )
{

  // Split the input string by newline characters
  var s = s . split ( "\n" ) ;


  // Parse the first line as an integer for 'n'
  var n = parseInt ( s [ 0 ] , 10 ) ;


  // Parse the second line, split by spaces, and map to integers for array 'a'
  var a = s [ 1 ] . split ( " " ) . map ( e => parseInt ( e , 10 ) ) ;


  // Initialize accumulator, counter, and result array
  var acc = 0 , cnt = 0 , arr = [ ] ;


  /*
   * Loop through the array 'a' from 0 to n-1
   * This is the core processing logic for the problem
   */
  for
  (
    var i = 0 ;
    i < n ;
    i ++
  )
  {
    // Update the accumulator with the current element
    acc += a [ i ] ;

    // Special handling for the first iteration (when i is exactly 0)
    if ( i === 0 )
    {
      // If accumulator is zero at the very first step
      if ( acc === 0 )
      {
        // Check the sign of the next element in array 'a'
        if ( a [ i + 1 ] >= 0 )
        {
          // Adjust accumulator based on the positive next element
          acc -= ( a [ i + 1 ] - 1 ) ;
          // Ensure accumulator is not zero after adjustment
          if ( acc === 0 )
          {
            acc -- ; // Decrement if it became zero
          }
          // Update the counter with the absolute value of the adjusted accumulator
          cnt += Math . abs ( acc ) ;
        }
        else // if a[i+1] is negative
        {
          // Adjust accumulator for a negative next element
          acc += ( Math . abs ( a [ i + 1 ] ) - 1 ) ;
          // Ensure accumulator is not zero after adjustment
          if ( acc === 0 )
          {
            acc ++ ; // Increment if it became zero
          }
          // Update the counter with the adjusted accumulator
          cnt += acc ;
        }
      }
    }
    else // For subsequent iterations (when i is greater than 0)
    {
      // Check the sign of the previous processed value stored in 'arr'
      if ( arr [ i - 1 ] > 0 )
      {
        // If accumulator is non-negative, adjust it to be negative
        if ( acc >= 0 )
        {
          // Increment counter by (acc + 1)
          cnt += ( acc + 1 ) ;
          // Decrement accumulator by (acc + 1)
          acc -= ( acc + 1 ) ;
        }
      }
      else // if arr[i-1] is not positive (i.e., zero or negative)
      {
        // If accumulator is non-positive, adjust it to be positive
        if ( acc <= 0 )
        {
          // Increment counter by (abs(acc) + 1)
          cnt += ( Math . abs ( acc ) + 1 ) ;
          // Increment accumulator by (abs(acc) + 1)
          acc += ( Math . abs ( acc ) + 1 ) ;
        }
      }
    }

    // Push the current accumulator value into the 'arr' array for tracking
    arr . push ( acc ) ;
  }

  // Output the final calculated count to the console
  console . log ( cnt ) ;
}

// This line reads input from standard input and calls the Main function
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;