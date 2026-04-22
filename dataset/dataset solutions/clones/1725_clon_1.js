/*
 * This JavaScript file processes input to solve a problem involving
 * two arrays and a target value 'k'. It utilizes prefix sums and
 * binary search to find an optimal combination.
 */
function   main ( input )
{
  // The input string is first split into an array of lines.
  input   =   input . split ( '\n' ) ;

  // Parse the first line to get the values N, M, and K.
  const   [ n ,   m ,   k ]   =   input [ 0 ] . split ( ' ' ) . map ( Number ) ;

  /*
   * Process the second line of input to create array 'a'.
   * This array 'a' will actually store the prefix sums of the original numbers.
   */
  const   a   =   input [ 1 ] . split ( ' ' ) . map ( Number ) . reduce ( (   a ,   x   )   =>
    {
      // If the accumulated array 'a' is empty, start with the first element.
      if   (   a . length   ===   0   )
      {
        return   [   x   ] ;
      }
      // Otherwise, append the sum of the current element 'x' and the last prefix sum.
      else
      {
        return   [   ... a ,   x   +   a [ a . length   -   1 ]   ] ;
      }
    } ,   [ ]   ) ;


  /*
   * Similarly, process the third line of input to create array 'b'.
   * Array 'b' also stores prefix sums.
   */
  const   b   =   input [ 2 ] . split ( ' ' ) . map ( Number ) . reduce ( (   a ,   x   )   =>
    {
      if   (   a . length   ===   0   )
      {
        return   [   x   ] ;
      }
      else
      {
        return   [   ... a ,   x   +   a [ a . length   -   1 ]   ] ;
      }
    } ,   [ ]   ) ;


  // Determine the maximum index 'aMax' in array 'a' such that a[aMax-1] <= k.
  const   aMax   =   searchIndex (   a ,   k   ) ;

  // Initialize a variable to keep track of the maximum sum of indices found.
  let   max   =   0 ;

  // Iterate through all possible valid prefixes of array 'a'.
  for   (   let   i   =   0 ;   i   <=   aMax ;   i ++   )
  {
    // 'ak' represents the cost of reading 'i' books from array 'a'.
    // If i is 0, no books are read from 'a', so the cost is 0.
    const   ak   =   i   ===   0   ?   0   :   a [ i   -   1 ] ;

    // Calculate the remaining budget for array 'b'.
    const   remainingBudget   =   k   -   ak ;

    // Find the maximum index 'bMax' in array 'b' that can be afforded with the remaining budget.
    const   bMax   =   searchIndex (   b ,   remainingBudget   ) ;

    // If the current combination of 'i' (from 'a') and 'bMax' (from 'b')
    // results in a greater total count of books, update 'max'.
    if   (   bMax   +   i   >   max   )
    {
      max   =   bMax   +   i ;
    }
  }

  // Print the final maximum total count of books.
  console . log (   max   ) ;
}


/*
 * This utility function performs a binary search on a sorted array.
 * It finds the largest index 'st' such that arr[st-1] is less than or equal to 'k'.
 * Essentially, it finds how many elements from the beginning of 'arr'
 * can be summed up without exceeding 'k'.
 */
function   searchIndex (   arr ,   k   )
{
  // 'st' (start) is the lower bound of the search window.
  let   st   =   0 ;
  // 'ed' (end) is the upper bound of the search window, initially the array's length.
  let   ed   =   arr . length ;

  // Loop continues as long as the search window is valid.
  while   (   st   !=   ed   )
  {
    // Calculate the middle index 'i' using integer division.
    i   =   (   (   st   +   ed   )   /   2   )   >>   0 ;

    // If the value at the middle index is greater than 'k',
    // it means 'k' must be in the left half (or not present).
    if   (   k   <   arr [ i ]   )
    {
       ed   =   i ; // Adjust the upper bound.
    }
    // If the value at the middle index is less than or equal to 'k',
    // it means 'k' could be in the right half, or 'i' is a potential answer.
    else
    {
      st   =   i   +   1 ; // Adjust the lower bound.
    }
  }

  // 'st' now holds the target index.
  return   st ;
}

// The program execution starts by reading input from standard input,
// removing any leading/trailing whitespace, and passing it to the main function.
main (   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) . trim ( )   ) ;

// End of the main program logic.