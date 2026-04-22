/*
 * This is the main immediately-invoked function expression (IIFE)
 * that encapsulates the entire program logic.
 * It processes input from stdin to solve a specific problem.
 */
( function main ( ) {

  // Read input from standard input.
  // The 'fs' module is used for file system operations.
  // '/dev/stdin' is a common path for standard input in Unix-like systems.
  // 'utf8' specifies the encoding.
  // .trim() removes leading/trailing whitespace.
  // .split("\n") separates the input into an array of lines.
  let lines = require ( 'fs' )
                  . readFileSync ( '/dev/stdin' , 'utf8' )
                  . trim ( )
                  . split ( "\n" ) ;


  // The first line contains two space-separated integers: n and k.
  // lines.shift() removes and returns the first element of the array.
  // .split(' ') separates the string by space.
  // .map(Number) converts each string part to a number.
  let [ n , k ] = lines . shift ( ) . split ( ' ' ) . map ( Number ) ;


  // The remaining lines represent weights.
  // Each line is converted to a number.
  let w = lines . map ( Number ) ;

  // Debugging line (commented out in original, keeping it commented).
  // console . log ( w ) ;


  // Calculate the total sum of all weights.
  // reduce() iterates over the array, accumulating a single result.
  // 0 is the initial value for the accumulator 'p'.
  let sum = w . reduce ( ( p , c ) => p + c , 0 ) ;


  // Special case: if k is 1, the answer is simply the total sum of weights.
  // No further processing is needed.
  if ( k == 1 )
  {
    console . log ( sum ) ;
    return ;
  }


  // Initialize two arrays: t and t2.
  // 't' will store the accumulated sum for each 'bin' or 'group'.
  // 't2' will store the individual elements placed into each 'bin'.
  let t = [ ] , t2 = [ ] ;


  // Initialize 'k' number of bins/groups.
  // Each bin in 't' starts with a sum of 0.
  // Each bin in 't2' starts as an empty array.
  for ( let i = 0 ; i < k ; i ++ )
  {
    t [ i ] = 0 ;
    t2 [ i ] = [ ] ;
  }


  // Calculate the initial average weight per bin.
  // This average will be dynamically updated as weights are assigned.
  let avg = sum / ( k ) ;


  // 'cnt' tracks the current bin index.
  // 'max' will store the maximum sum found in any bin.
  let cnt = 0 ;
  let max = 0 ;


  // Iterate over each weight 'e' in the array 'w'.
  w . forEach ( function ( e )
  {
    // Decision logic for assigning weights to bins.
    // This condition checks if adding the current element 'e' to the
    // current bin 't[cnt]' would still keep the average 'avg'
    // (considering the current bin's state) positive.
    // The expression `(2 * t[cnt] + e) / 2` seems to be an attempt to
    // calculate a new average or a midpoint for comparison.
    if ( avg - ( ( 2 * t [ cnt ] ) + e ) / 2 > 0 )
    {
      // If the condition is true, we can potentially add 'e' to the current bin.
      // The original code has an empty block here, meaning no action is taken
      // if the condition holds, and the element is added unconditionally later.
      // This implies the condition might be primarily for the 'else' branch.
    }
    else
    {
      // If the condition is false, it means the current bin 't[cnt]'
      // is considered "full enough" or adding 'e' would make it too large
      // based on the average.
      // So, we finalize the current bin and move to the next.

      // Recalculate the average for the *remaining* bins (k - cnt - 1).
      // This is done before updating 'cnt'.
      avg = sum / ( k - cnt - 1 ) ;

      // Update 'max' if the current bin's sum 't[cnt]' is greater.
      max = max < t [ cnt ] ? t [ cnt ] : max ;

      // Original debug line for sum and avg (commented).
      // console . log ( sum , avg ) ;

      // Move to the next bin.
      cnt ++ ;
    }

    // After the if/else block, these operations always happen.
    // Recalculate average for remaining bins.
    // This line appears redundant if avg is already calculated in the else block.
    // However, it's part of the original logic, so it must remain.
    avg = sum / ( k - cnt - 1 ) ;

    // Subtract the current element 'e' from the total 'sum' of remaining weights.
    sum -= e ;

    // Add the current element 'e' to the sum of the current bin.
    t [ cnt ] += e ;

    // Add the current element 'e' to the list of elements in the current bin.
    t2 [ cnt ] . push ( e ) ;
  } ) ; // End of forEach loop.


  // Original debug line for t and t2 (commented).
  // console . log ( t , t2 ) ;


  // After processing all weights, ensure 'max' captures the sum of the last bin.
  // This is necessary because the 'max' update inside the 'else' block
  // might not have been triggered for the very last bin if it didn't
  // meet the 'else' condition.
  max = max < t [ cnt ] ? t [ cnt ] : max ;

  // Output the final maximum bin sum.
  console . log ( max ) ;

} ) ( ) ; // End of main IIFE.