/*
 * This is the main function that processes the input for the problem.
 * It's designed to calculate the minimum absolute difference between
 * the sums of two subgroups of numbers.
 */
function   main( input )
{
  // First, we extract the total number of elements, N, from the first line of the input string.
  const N   =   input . split ( '\n' ) [ 0 ] ;

  // Next, we parse the second line of the input.
  // It's split by newline, then by space, and each part is converted into an integer (base 10).
  const grams   =   input . split ( '\n' ) [ 1 ] . split ( ' ' ) . map ( ( n )   =>   parseInt ( n ,   10 ) ) ;


  // Initialize an empty array 'sa' to store the absolute differences
  // calculated for each possible split point.
  var   sa   =   [ ] ;

  // This loop iterates through all possible split points 'T'.
  // 'T' represents the number of elements in the first group.
  // It starts from 1 (meaning the first group has at least one element)
  // and goes up to N-1 (meaning the second group has at least one element).
  for ( var   T   =   1 ;   T   <   N ;   T ++ )
  {
    // Initialize the sum for the first group.
    var   group1   =   0 ;
  	// Initialize the sum for the second group.
    var   group2   =   0 ;

    // Calculate the sum of the first group.
    // This group includes elements from index 0 up to T-1.
    for ( var   j   =   0 ;   j   <   T ;   j ++ )
    {
      group1   +=   grams [ j ] ; // Add the current gram value to group1's sum.
    }

    // Calculate the sum of the second group.
    // This group includes elements from index T up to N-1.
    for ( var   k   =   T ;   k   <   N ;   k ++ )
    {
      group2   +=   grams [ k ] ; // Add the current gram value to group2's sum.
    }

    // Calculate the absolute difference between the sums of the two groups.
    // Then, push this difference into the 'sa' array for later comparison.
    sa . push ( Math . abs ( group1   -   group2 ) ) ;
  }

  // After evaluating all possible splits, find the minimum value
  // among all the absolute differences stored in the 'sa' array.
  // 'Math.min.apply(null, sa)' is used to find the minimum in an array.
  console . log ( Math . min . apply ( null ,   sa ) ) ;
}

// This line reads the input from standard input (/dev/stdin)
// and passes it as a UTF-8 string to the 'main' function to begin processing.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ) ;