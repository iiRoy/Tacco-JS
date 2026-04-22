( function  initializeApplication ( ) { // Main execution block for the application
  const  inputLines  =  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) . trim ( ) . split ( '\n' ) ;
  // The first line often contains a count, though it's not used in this specific heap logic.
  const  initialCount  =  Number ( inputLines . shift ( ) ) ;
  // Read the next line, parse numbers, build a max-heap, and output the space-separated result.
  console . log ( ' ' +  constructHeapStructure ( inputLines . shift ( ) . split ( ' ' ) . map ( Number ) ) . join ( ' ' ) ) ;
} ) ( ) ;

function  constructHeapStructure (  inputCollection  ) { // Converts a given array of numbers into a max-heap
  const  collectionSize  =  inputCollection . length ;

  // Nested function to maintain the max-heap property for a subtree rooted at 'currentPosition'.
  const  percolateDown  =  (  currentPosition  )  =>  {
    let  leftChildIndex  ,  rightChildIndex  ,  maximumElementIndex  ;

    // Calculate indices of the left and right children.
    leftChildIndex  =  ( 2  *  currentPosition )  +  1 ;
    rightChildIndex  =  ( 2  *  currentPosition )  +  2 ;

    // Determine the largest element among the parent and its left child.
    if  (  leftChildIndex  <  collectionSize  &&  inputCollection [ leftChildIndex ]  >  inputCollection [ currentPosition ]  )
      maximumElementIndex  =  leftChildIndex ;
    else
      maximumElementIndex  =  currentPosition ;

    // Compare with the right child to identify the true largest element among the three.
    if  (  rightChildIndex  <  collectionSize  &&  inputCollection [ rightChildIndex ]  >  inputCollection [ maximumElementIndex ]  )
      maximumElementIndex  =  rightChildIndex ;

    // If the largest element is not the current node, a swap is required.
    if  (  maximumElementIndex  !=  currentPosition  )  {
      // Perform an efficient in-place swap of the elements.
      inputCollection [ maximumElementIndex ]  =  [ inputCollection [ currentPosition ] ,  inputCollection [ currentPosition ]  =  inputCollection [ maximumElementIndex ] ] [ 0 ] ;
      // Recursively call percolateDown on the affected child subtree to restore heap property.
      percolateDown ( maximumElementIndex ) ;
    }
  } ;

  // Iterate backwards from the last non-leaf node to the root to build the entire max-heap.
  for  (  let  nodeIdx  =  Math . floor ( inputCollection . length  /  2 ) ;  nodeIdx  >=  0 ;  nodeIdx --  )
    percolateDown ( nodeIdx ) ;

  return  inputCollection ; // Return the array, now organized as a max-heap.
}