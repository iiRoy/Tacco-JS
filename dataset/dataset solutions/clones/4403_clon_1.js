/*
 * This JavaScript code processes a specific input format
 * to find certain numerical properties.
 * It primarily focuses on identifying pairs within a sorted list.
 */
function  main ( input )
{
  // Initialize an array 'hen' with two zero values.
  // This array will store two numbers identified later in the logic.
  var   hen   =   [   0   ,   0   ]   ;

  // Split the entire input string by newline characters.
  // This typically separates different lines of input data.
  var   tmp   =   input . split ( '\n' ) ;

  // From the 'tmp' array, take the element at index 1 (the second line).
  // Then, split this second line by space characters to get an array 'A'
  // containing individual string representations of numbers.
  var   A   =   tmp [ 1 ] . split ( ' ' ) ;


  // Sort the array 'A' in descending order.
  // The comparison function (b - a) ensures that larger numbers come first.
  A . sort ( function ( a , b )
  {
    return   b   -   a ;
  } ) ;


  // Initialize a counter 'j' to 0.
  // 'j' will be used as an index for the 'hen' array.
  var   j   =   0 ;

  // Loop through the sorted array 'A'.
  // The loop continues as long as 'i' is within bounds (not the last element)
  // AND 'j' is less than 2 (meaning we are still looking for two 'hen' values).
  for ( var   i   =   0 ;
        i   <   A . length   -   1   &&   j   <   2 ;
        i ++ )
  {
    // Check if the current element 'A[i]' is equal to the next element 'A[i+1]'.
    // This condition identifies a pair of identical numbers.
    if ( A [ i ]   ==   A [ i + 1 ] )
    {
      // If a pair is found, store the value in the 'hen' array at index 'j'.
      hen [ j ]   =   A [ i ] ;
      // Increment 'i' an extra time to skip the second element of the identified pair.
      i ++ ;
      // Increment 'j' to prepare for storing the next 'hen' value (if another pair is found).
      j ++ ;
    }
  }

  /*
   * The following line was commented out in the original source.
   * It's typically used for debugging to see the sorted array 'A'.
   */
  // console.log("Sorted Array A (for debugging):", A);


  // Finally, calculate and print the product of the two values stored in the 'hen' array.
  console . log ( hen [ 0 ]   *   hen [ 1 ] ) ;
}

// This line reads the input from standard input (/dev/stdin)
// using Node.js's file system module and then calls the 'main' function
// with the read content as its argument, encoded as UTF-8.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;