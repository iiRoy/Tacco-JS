/*
 * This JavaScript file processes input data to calculate a specific result.
 * It identifies unique element counts within a sorted array and then
 * determines a sum based on those counts and a given threshold K.
 */


function main( input )
{
  // Split the input string into an array of lines.
  const   lines = input . split ( '\n' ) ;


  /*
   * The first line contains two space-separated integers, N and K.
   * N is ignored in this specific calculation, but K is crucial.
   */
  const N = lines [ 0 ] . split ( ' ' ) . map ( x => parseInt ( x ) ) [ 0 ] ; // N: Total number of elements, not directly used in the current logic.
  const K = lines [ 0 ] . split ( ' ' ) . map ( x => parseInt ( x ) ) [ 1 ] ; // K: A threshold value for the logic.


  // The second line contains N space-separated integers, which are stored in array A.
  // The array A is immediately sorted in ascending order.
  const A = lines [ 1 ] . split ( ' ' ) . map ( x => parseInt ( x ) ) . sort ( ) ;


  // This array will store the counts of consecutive identical numbers in the sorted array A.
  const size_sorted_A = [ ] ;

  // Initialize variables for counting consecutive occurrences.
  var current_number = A [ 0 ] ; // Start with the first element of the sorted array.
  var count = 1 ; // Initialize count for the first element.

  // Loop through the sorted array A to count occurrences of each distinct number.
  for ( var i = 1 ; i <= A . length ; i ++ )
  {
    // Check if the current element is the same as the previous one.
    if ( A [ i ] == current_number )
    {
      count ++ ; // Increment count if it's a consecutive occurrence.
    }
    else
    {
      // If the number changes or we reach the end of the array,
      // push the accumulated count to size_sorted_A.
      size_sorted_A . push ( count ) ;
      count = 1 ; // Reset count for the new number.
    }
    // Update the current_number to the element just processed.
    current_number = A [ i ] ;
  }

  // Debugging output - can be enabled for inspection of intermediate steps.
  //console . log ( '--- Intermediate Counts ---' ) ;
  //console . log ( size_sorted_A ) ;


  // Sort the array of counts (size_sorted_A) in ascending order.
  // This is crucial for the subsequent logic to remove the smallest groups.
  size_sorted_A . sort ( ( a , b ) => a - b ) ;


  // Another debugging output.
  //console . log ( '--- Sorted Counts ---' ) ;
  //console . log ( size_sorted_A ) ;


  // Initialize the result variable.
  var result = 0 ;


  // If the number of distinct element groups is less than or equal to K,
  // it means we don't need to remove any groups to reach the target K.
  // In this scenario, the result is 0 because no elements need to be removed.
  if ( size_sorted_A . length <= K )
  {
    console . log ( result ) ; // Output 0.
    return ; // Exit the function.
  }


  // Iterate through the sorted counts array.
  // The goal is to remove the smallest groups until only K groups remain.
  for ( var i = 0 ; i < size_sorted_A . length ; i ++ )
  {
    var size = size_sorted_A [ i ] ; // Get the size of the current smallest group.
    result += size ; // Add its size to the total 'result' (elements to remove).

    // Check if, after removing the current group (and previous ones),
    // the remaining number of groups is less than or equal to K.
    // (size_sorted_A.length - (i + 1)) represents the number of groups *remaining*.
    if ( size_sorted_A . length - ( i + 1 ) <= K )
    {
      console . log ( result ) ; // Output the accumulated result.
      return ; // Exit the function.
    }

    // Another debug line for tracing the process.
    //console . log ( `After removing ${i+1} groups, remaining: ${size_sorted_A.length-(i+1)}, current result: ${result}` ) ;
  }
} // End of the main function definition.


// This part reads the input from standard input and calls the main function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;

// End of file.