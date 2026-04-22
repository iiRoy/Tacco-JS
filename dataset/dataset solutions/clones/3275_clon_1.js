"use strict"; /* This directive enforces strict mode,
                       preventing common errors and unsafe actions. */

// Main function definition, processing the input data.
function   main( input )
{
  // Split the input string by newline characters to get an array of lines.
  var lines = input . split( '\n' ) ;

  // Parse the first line as an integer for N.
  var N = parseInt( lines[0] ) ;

  // Process the second line to get array A, sliced to length N.
  var A = splitNum( lines[1] ) . slice( 0, N ) ;

  // Process the third line to get array B, also sliced to length N.
  var B = splitNum( lines[2] ) . slice( 0, N ) ;


  // Calculate the differences between corresponding elements of A and B.
  var diffs = A . map( function ( a , i )
    {
      /* The anonymous function calculates the difference: a - B[i] */
      return a - B[i] ;
    }
  ) ;


  // Sort the differences in descending order (largest first).
  diffs . sort( function ( x, y )
    { // Custom comparison function for sorting.
      return y - x ;
    }
  ) ;

  /* Initialize a boolean array 'changed' of the same length as diffs,
     all values initially set to false. This tracks modifications. */
  var changed = diffs . map( function ( _ )
    {
      return false ;
    }
  ) ;

  // Initialize pointers for the two ends of the sorted diffs array.
  var source = 0 ;
  var target = N - 1 ;

  // Loop as long as the source pointer is less than the target pointer.
  while ( source < target )
  {
    // Get the difference at the target pointer (smallest difference).
    var diff = diffs[target] ;

    // If the smallest difference is non-negative, we can stop.
    if ( diff >= 0 )
    {
      // All remaining differences are positive or zero, no more changes needed.
      break ;
    }

    // Check if the largest difference can compensate for the smallest negative difference.
    if ( diffs[source] >= -diff )
    {
      // Mark both source and target elements as changed.
      changed[source] = true ;
      changed[target] = true ;

      // Adjust the source difference by adding the negative target difference.
      diffs[source] += diff ;
      // Set the target difference to zero as it's been compensated.
      diffs[target] = 0 ;

      // Move the target pointer inwards.
      target-- ;
    }
    else
    {
      // If the source difference is positive, it means it's contributing to compensation.
      if ( diffs[source] > 0 )
      {
        // Mark both elements as changed.
        changed[source] = true ;
        changed[target] = true ;
      }

      // Add the source difference to the target difference (partially compensating).
      diffs[target] += diffs[source] ;
      // Set the source difference to zero as it's fully used.
      diffs[source] = 0 ;

      // Move the source pointer inwards.
      source++ ;
    }
  }

  // After the loop, check the remaining difference at the target.
  if ( diffs[target] < 0 )
  {
    // If it's still negative, it's impossible to make all diffs non-negative.
    console.log( -1 ) ;
  }
  else
  {
    // Otherwise, count the number of true values in the 'changed' array.
    // This represents the minimum number of elements that needed adjustment.
    console.log( changed . reduce( function ( acc, v )
      {
        return acc + v ; // Sum boolean values (true=1, false=0).
      } , 0
    ) ) ;
  }

  // End of main function.
  return ;
}

/*
 * This is a utility function to compute the greatest common divisor (GCD)
 * of two numbers using the Euclidean algorithm.
 * Although defined, this function is not used in the 'main' logic.
 */
function gcd( a, b )
{
  // Ensure 'a' is greater than or equal to 'b' for consistent recursion.
  if ( a < b )
  {
    return gcd( a, b ) ;
  }

  // Base case: if 'b' is 0, 'a' is the GCD.
  if ( b === 0 )
  {
    return a ;
  }

  // Calculate the remainder.
  var r = a % b ;

  // Recursive call with 'b' and the remainder.
  return gcd( b, r ) ;
}

// Execute the main function with input read from standard input.
main( require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ) ;

// Helper function to parse a line of space-separated numbers into an array of integers.
function splitNum( line )
{
  return line . split( /\s+/ ) . map( function ( n )
    {
      // Convert each string number to an integer.
      return parseInt( n ) ;
    }
  ) ;
}