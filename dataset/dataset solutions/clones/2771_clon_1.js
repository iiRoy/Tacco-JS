/*
 * This file contains the primary logic for processing input data.
 * It's a re-formatted version of the original source.
 * No functional changes have been made whatsoever.
 */

// Define the main processing function that accepts the raw input string.
function Main(  input  )
{
  // The input parameter contains all the raw input data as a single string.
  // We'll split it by newline characters to get an array of lines.
  input = input . split ( "\n" ) ;

  // The second line (index 1) contains space-separated values.
  // We extract these values into a temporary array 'tmp'.
  tmp = input [ 1 ] . split ( " " ) ;

  // The first line (index 0) contains a single integer N.
  // Use parseInt for string to integer conversion, specifying base 10.
  var N = parseInt ( input [ 0 ] ,   10 ) ;

  // Transform the temporary string array 'tmp' into an array of integers 'valley'.
  var valley = toIntAll ( tmp ) ;

  // Initialize variables for finding the maximum valley value and its index.
  var maxValley = - Infinity ; // Represents negative infinity for initial comparison.
  var maxValleyIndex = 0 ;     // Stores the index of the maximum valley.
  var sumValley = 0 ;          // Accumulator for the total sum of valley values.

  // Loop through the 'valley' array to find the maximum value and its position.
  // Also, calculate the sum of all elements in 'valley'.
  for ( var i = 0 ; i < valley . length ; i ++ )
  {
    // Check if the current valley element is greater than the current maximum.
    if ( valley [ i ] > maxValley )
    {
      maxValleyIndex = i ;     // Update the index of the maximum valley.
      maxValley = valley [ i ] ; // Update the maximum valley value.
    }

    sumValley += valley [ i ] ; // Add the current element to the total sum.
  }

  // Variables for mountain calculations.
  var sumMountain = 0 ;
  var mountainIndex1 = maxValleyIndex ;
  var mountainIndex2 = ( maxValleyIndex + 1 ) % N ; // Circular index calculation for the next element.
  var tmpMountain ; // Temporary array to store calculated mountain values.
  var isContradiction = true ; // Flag to indicate if a contradiction is found during calculations.

  // Main loop: Iterate from 0 up to 'maxValley' to test different assumptions for 'j'.
  for ( var j = 0 ; j <= maxValley ; j ++ )
  {
    // Set up initial assumptions for 'tmpMountain' for the current 'j'.
    tmpMountain = [ ] ; // Initialize an empty array for temporary mountain values.
    sumMountain = 0 ;   // Reset mountain sum for each iteration of 'j'.

    // Assign initial values based on 'j' to the two primary mountain indices.
    tmpMountain [ mountainIndex1 ] = j * 2 ;
    tmpMountain [ mountainIndex2 ] = ( maxValley - j ) * 2 ;

    // Calculate the initial sum of mountain values based on the assumptions.
    sumMountain = tmpMountain [ mountainIndex1 ] + tmpMountain [ mountainIndex2 ] ;

    // Inner loop: Determine subsequent mountain values based on the initial assumptions.
    // This loop continues indefinitely until a 'break' statement is encountered.
    for ( var tmpIndex1 = ( mountainIndex1 + 1 ) % N ; ; tmpIndex1 = ( tmpIndex1 + 1 ) % N )
    {
      // Calculate the next index in a circular manner.
      tmpIndex2 = ( tmpIndex1 + 1 ) % N ;

      // Calculate a potential mountain value for the current index based on valley and previous mountain.
      tmpMountainOne = ( valley [ tmpIndex1 ] - ( tmpMountain [ tmpIndex1 ] / 2 ) ) * 2 ;

      // Check for contradiction: mountain value must be non-negative.
      if ( tmpMountainOne < 0 )
      {
        isContradiction = true ; // Set contradiction flag.
        break ;                  // Exit the inner loop as a contradiction is found.
      }

      // Check if we are not yet back to the starting mountain index.
      if ( tmpIndex2 !== mountainIndex1 )
      {
        tmpMountain [ tmpIndex2 ] = tmpMountainOne ; // Assign the calculated value to the temporary array.
        sumMountain += tmpMountain [ tmpIndex2 ] ;   // Add to the total mountain sum.

        // Check if the accumulated mountain sum exceeds the total valley sum.
        if ( sumMountain > sumValley )
        {
          isContradiction = true ; // Contradiction found.
          break ;                  // Exit the inner loop.
        }
      }
      // If we have completed one full cycle around the array.
      else
      {
        // Verify if the calculated mountain value for the starting index matches the initial assumption.
        if ( tmpMountainOne === tmpMountain [ mountainIndex1 ] )
        {
          isContradiction = false ; // No contradiction found for this 'j' iteration.
          break ;                   // Exit the inner loop successfully.
        }
        else
        {
          isContradiction = true ; // Contradiction: initial assumption doesn't hold true after a full cycle.
          break ;                  // Exit the inner loop due to contradiction.
        }
      }
    }
    // If no contradiction was found in the inner loop, we can stop iterating 'j'.
    if ( isContradiction === false )
    {
      break ;
    }
  }

  // Output the final result to the console.
  console . log ( '%s' , outputDelimiterSpace ( tmpMountain ) ) ;
}

// Helper function: Converts all elements of an input array of strings to integers.
function toIntAll ( input )
{
  var out = [ ] ; // Initialize an empty array for output.
  // Loop through each element in the input array.
  for ( var i = 0 ; i < input . length ; i ++ )
  {
    out [ i ] = parseInt ( input [ i ] ) ; // Convert the string to an integer and assign.
  }
  return out ; // Return the array of integers.
}

// Helper function: Joins an array of words with spaces and appends a newline character.
function outputDelimiterSpace ( words )
{
  var out = words . join ( ' ' ) ; // Join array elements with a space delimiter.
  out += '\n' ;                    // Append a newline character at the end.
  return out ;                     // Return the formatted string.
}

/*
 * The following line is crucial for standard input/output operations
 * in this environment and should not be modified.
 * It reads the entire content from standard input and passes it to the Main function.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;