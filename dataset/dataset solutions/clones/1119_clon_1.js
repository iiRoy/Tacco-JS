/* This file processes commands to manage a min-priority queue (implemented as a max-heap in this case,
   but the problem context might imply min-heap operations based on typical competitive programming problems.
   However, the code itself implements a max-heap structure for 'insert' and 'extract' operations,
   where 'extract' removes the maximum element. */
// Import Node.js 'fs' (file system) module to read input
const line = require ( 'fs' ) . readFileSync ( '/dev/stdin' ,
                                              'utf-8' ) . split ( '\n' ) ; /* Read standard input,
                                                                               decode as UTF-8,
                                                                               and split into an array of lines. */


/**
 * Performs max-heapify operation on a given array (heap).
 * This function maintains the max-heap property.
 * @param {Array<number>} arr - The array representing the heap.
 * @param {number} i - The 1-based index of the node to heapify.
 */
const maxHeapify = ( arr , i ) =>
{

  // Calculate left child's 1-based index
  const l = i * 2 ;

  // Calculate right child's 1-based index
  const r = l + 1 ;

  // Variable to store the index of the largest element among parent, left, and right children
  let max ;

  /* Check if the left child exists within the array bounds
     and if its value is greater than the current node's value. */
  if ( l <= arr . length && arr [ l - 1 ] > arr [ i - 1 ] )
  {
    max = l ; // Left child is larger
  }
  else
  {
    max = i ; // Current node is larger or left child doesn't exist/is smaller
  }
  /* Now, check the right child. If it exists and is greater than the current 'max' element
     (which could be the parent or the left child), update 'max'. */
  if ( r <= arr . length && arr [ r - 1 ] > arr [ max - 1 ] )
  {
    max = r ; // Right child is the largest
  }

  // If the largest element is not the current node, a swap is needed.
  if ( max !== i )
  {
    // Perform swap using a temporary variable
    const tmp = arr [ i - 1 ] ; // Store current node's value
    arr [ i - 1 ] = arr [ max - 1 ] ; // Move largest child's value to current node
    arr [ max - 1 ] = tmp ; // Move original current node's value to largest child's position

    // Recursively call maxHeapify on the affected subtree
    maxHeapify ( arr , max ) ;
  }

} ; // End of maxHeapify function


/**
 * Inserts a new element into the max-heap.
 * The new element is added at the end and then "bubbled up" to its correct position.
 * @param {Array<number>} arr - The array representing the heap.
 * @param {number} n - The number to insert.
 */
const insert = ( arr , n ) =>
{
  // Add the new element to the end of the array
  arr . push ( n ) ;

  // Helper function to bubble up the newly inserted element
  const helper = ( i ) =>
  {
    // Base case: if we reach the root (index 1) or beyond, stop.
    if ( i <= 1 )
    {
      return ;
    }

    // Calculate the 1-based index of the parent node
    const parentIndex = Math . floor ( i / 2 ) ;

    // If the current element is greater than its parent, swap them
    if ( arr [ i - 1 ] > arr [ parentIndex - 1 ] )
    {
      // Swap using a temporary variable
      const tmp = arr [ i - 1 ] ;
      arr [ i - 1 ] = arr [ parentIndex - 1 ] ;
      arr [ parentIndex - 1 ] = tmp ;

      // Recursively call helper on the parent to continue bubbling up
      helper ( parentIndex ) ;
    }
  } ; // End of helper function definition

  // Start bubbling up from the newly inserted element's position (last element)
  helper ( arr . length ) ;
} ; // End of insert function


/**
 * Extracts the maximum element from the max-heap (which is always the root).
 * @param {Array<number>} arr - The array representing the heap.
 * @returns {number} The maximum element extracted from the heap.
 */
const extract = arr => {

  // The maximum element is at the root (index 0).
  const n = arr . shift ( ) ; // Remove and store the root element.

  /* Move the last element to the root position.
     First, remove the last element using pop(), then add it to the front using unshift(). */
  arr . unshift ( arr . pop ( ) ) ;

  // Restore the max-heap property starting from the new root (index 1, 1-based).
  maxHeapify ( arr , 1 ) ;

  return n ; // Return the extracted maximum element.
} ; // End of extract function


/* Process each line of input to perform heap operations.
   The 'reduce' method iterates over the 'line' array and accumulates results into 'acc' (the heap array). */
const data = line . reduce ( ( acc , x ) => {

    // Split the input line by space to get the command and its argument (if any)
    const cmd = x . split ( ' ' ) ;

    // Use a switch statement to handle different commands
    switch ( cmd [ 0 ] )
    {
        case 'insert' :
            // If the command is 'insert', parse the second part as a number and insert it into the heap.
            insert ( acc , Number ( cmd [ 1 ] ) ) ;
            break ; // Exit switch after handling 'insert'

        case 'extract' :
            // If the command is 'extract', remove the max element and print it to console.
            console . log ( extract ( acc ) ) ;
            break ; // Exit switch after handling 'extract'
    }

    return acc ; // Return the modified heap array for the next iteration of reduce.

} , [ ] ) ; // Initialize the accumulator 'acc' as an empty array (the heap).