/*
 * This is an Immediately Invoked Function Expression (IIFE).
 * It encapsulates the main logic of the program, ensuring variables
 * declared within it do not pollute the global scope.
 */
( function main ( )
{

  // Read input from standard input (/dev/stdin), decode as UTF-8,
  // remove leading/trailing whitespace, and split the string into an array of lines.
  const   lines   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) . trim ( ) . split ( '\n' ) ;


  /*
   * The first line of input is expected to be a number (n).
   * It is removed from the 'lines' array using shift() and converted to a Number type.
   * This 'n' typically represents the count of elements in the subsequent input line.
   */
  const   n       =   Number ( lines . shift ( ) ) ;


  /*
   * The second line of input contains the actual array elements.
   * It's extracted using lines.shift(), split by spaces, and each part
   * is mapped to a Number. This array is then passed to the buildMaxHeap function.
   * The resulting max-heap array is joined back into a space-separated string,
   * prefixed with an additional space, and finally printed to the console.
   */
  console . log ( ' ' + buildMaxHeap ( lines . shift ( ) . split ( ' ' ) . map ( Number ) ) . join ( ' ' ) ) ;

} ) ( ) ; // End of the main IIFE function call.


/**
 * Function: buildMaxHeap
 * ----------------------
 * Description:
 *   Transforms a given array into a max-heap data structure in-place.
 *   A max-heap is a complete binary tree where the value of each node
 *   is greater than or equal to the values of its children.
 *
 * Parameters:
 *   @param {Array<number>} arr - The array of numbers to be transformed into a max-heap.
 *
 * Returns:
 *   @returns {Array<number>} The input array, now structured as a max-heap.
 */
function   buildMaxHeap ( arr )
{
  // Get the current length of the array. This 'n' represents the total number of elements.
  const   n   =   arr . length ;


  /*
   * Inner Helper Function: maxHeapify
   * ---------------------------------
   * Description:
   *   This function maintains the max-heap property for a subtree rooted at a given index 'i'.
   *   It assumes that the subtrees rooted at the left and right children of 'i' are already max-heaps.
   *   If the node at index 'i' violates the max-heap property (i.e., it's smaller than one of its children),
   *   it swaps 'i' with its largest child and recursively calls maxHeapify on the affected subtree.
   *
   * Parameters:
   *   @param {number} i - The index of the root of the subtree to be heapified.
   */
  const   maxHeapify   =   ( i )   =>
  {
    // Declare variables to store indices of the left child, right child, and the largest element.
    let   left ,
          right ,
          largest ;


    // Calculate the 0-based index of the left child of node 'i'.
    left    =   2   *   i   +   1   ;
    // Calculate the 0-based index of the right child of node 'i'.
    right   =   2   *   i   +   2   ;


    /*
     * Determine the largest among the current node (i) and its left child.
     * Check if the left child exists within the array bounds (left < n)
     * and if its value is greater than the current node's value.
     */
    if   (   left   <   n   &&   arr [ left ]   >   arr [ i ]   )
    {
      largest   =   left   ; // Left child is larger.
    }
    else
    {
      largest   =   i   ;    // Current node is larger or left child doesn't exist/isn't larger.
    }


    /*
     * Now, compare the current 'largest' element (which could be node 'i' or its left child)
     * with the right child.
     * Check if the right child exists within the array bounds (right < n)
     * and if its value is greater than the current 'largest' value.
     */
    if   (   right   <   n   &&   arr [ right ]   >   arr [ largest ]   )
    {
      largest   =   right   ; // Right child is the largest overall.
    }


    /*
     * If 'largest' is not the original node 'i', it means a child was larger,
     * and a swap is necessary to restore the max-heap property.
     */
    if   (   largest   !=   i   )
    {
      // Perform an in-place swap of arr[i] and arr[largest] using a common JavaScript trick.
      // The expression [arr[i], arr[i] = arr[largest]][0] works as follows:
      // 1. arr[i] = arr[largest] assigns the value of arr[largest] to arr[i].
      // 2. The result of this assignment (which is arr[largest]'s value) is then part of an array literal: [original_arr[i], new_arr[i]].
      // 3. The original value of arr[i] (which is the first element in the array literal) is then assigned to arr[largest].
      arr [ largest ]   =   [ arr [ i ] ,   arr [ i ]   =   arr [ largest ] ] [ 0 ]   ;

      // After swapping, the subtree rooted at 'largest' (where the original 'i' value moved)
      // might now violate the max-heap property. Therefore, recursively call maxHeapify
      // on this affected subtree to ensure the property is maintained downwards.
      maxHeapify ( largest )   ;
    }
  }   ; // End of the maxHeapify inner function definition.


  /*
   * The main loop to build the max-heap.
   * It iterates from the last non-leaf node up to the root (index 0).
   * For an array of length 'n', the indices of non-leaf nodes range from
   * Math.floor(n / 2) - 1 down to 0.
   * The expression `Math.floor(arr.length / 2)` gives the index of the last parent node
   * when considering a 0-indexed array where children of node i are 2i+1 and 2i+2.
   * By calling maxHeapify on each of these nodes, working upwards, the entire array
   * is transformed into a max-heap.
   */
  for   (   let   i   =   Math . floor ( arr . length   /   2 )   ;   i   >= 0   ;   i --   )
  {
    maxHeapify ( i )   ; // Call heapify for the current non-leaf node.
  }

  // Return the array, which has now been successfully transformed into a max-heap.
  return   arr   ;
} // End of buildMaxHeap function.