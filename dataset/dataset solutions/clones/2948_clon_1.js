/*
 * This is the main function that processes input commands.
 * It simulates operations on a sorted array 'a' and maintains a 'sum'.
 */
function Main ( input )
{
  // First, process the raw input string.
  input = input . split ( "\n" );

  // Remove any trailing empty line that might result from splitting.
  if ( input [ input . length - 1 ] === '' )
  {
    input . pop ( );
  }

  /*
   * Initialize variables required for the processing.
   * Q is likely the number of queries, but its value isn't used after assignment.
   */
  const Q = input [ 0 ] . split ( ' ' ) [ 0 ]; // Extract Q, though it's unused later.

  var sum = 0; // 'sum' will store the accumulated value based on operations.
  var a   = []; // 'a' is a dynamically maintained sorted array.

  // Declare variables used for insertion logic and temporary storage.
  var insert, min, max, mid;
  var temp; // Used to store parsed parts of an input line.

  // Loop through each input line, starting from the second one (index 1).
  for ( var i = 1 ; i < input . length ; i ++ )
  {
    // Check the type of operation based on the current input line.
    if ( input [ i ] === '2' )
    {
      // If the command is '2', print the median-like element and the current sum.
      // Math.ceil(a.length/2)-1 finds the middle index for both even and odd lengths.
      console . log ( a [ Math . ceil ( a . length / 2 ) - 1 ], sum );
    }
    else
    {
      // For other commands (implicitly '1' followed by numbers).
      // Parse the input line to extract the numbers.
      temp = input [ i ] . split ( ' ' ) . slice ( 1 ) . map ( e =>
      {
        return e - 0; // Convert string to number.
      } );

      // Handle the case where the array 'a' is empty.
      if ( a . length === 0 )
      {
        a = [ temp [ 0 ] ]; // Add the first number.
        sum += temp [ 1 ]; // Add the second number to sum.
        continue; // Move to the next input line.
      }

      // Determine the insertion point for 'temp[0]' into the sorted array 'a'.
      if ( a [ a . length - 1 ] < temp [ 0 ] )
      {
        insert = a . length; // Insert at the end if it's the largest.
      }
      else if ( a [ 0 ] >= temp [ 0 ] )
      {
        insert = 0; // Insert at the beginning if it's the smallest or equal to first.
      }
      else
      {
        // Binary search to find the correct insertion point.
        max = a . length - 1;
        min = 0;

        while ( max - min > 1 )
        {
          mid = Math . floor ( ( max + min ) / 2 );

          if ( a [ mid ] < temp [ 0 ] )
          {
            min = mid;
          }
          else
          {
            max = mid;
          }
        }
        insert = min + 1; // The insertion point is after 'min'.
      }

      // Adjust 'sum' based on the new element 'temp[0]' and the array's current state.
      if ( a . length % 2 === 0 )
      {
        // If 'a' has an even number of elements.
        if ( insert > a . length / 2 )
        {
          // If inserted element is in the upper half.
          sum += temp [ 0 ] - a [ a . length / 2 ];
        }
        else if ( insert < a . length / 2 )
        {
          // If inserted element is in the lower half.
          sum += a [ a . length / 2 - 1 ] - temp [ 0 ];
        }
        // If insert == a.length/2, sum remains unchanged relative to this part.
      }
      else
      {
        // If 'a' has an odd number of elements.
        // Sum is adjusted by the absolute difference between the new element and the current median.
        sum += Math . abs ( temp [ 0 ] - a [ ( a . length - 1 ) / 2 ] );
      }

      // Finally, insert the new element into array 'a' at the determined position.
      a . splice ( insert, 0, temp [ 0 ] );
      sum += temp [ 1 ]; // Add the second value from input to the total sum.
    }
  }
}


/*
 * This section handles standard input/output.
 * Do not edit these lines. They read from stdin and call the Main function.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin", "utf8" ) );