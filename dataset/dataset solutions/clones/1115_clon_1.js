/*
 * This file implements a max-heap construction algorithm.
 * It processes input from standard input to build a max heap
 * and then outputs the heapified array.
 */
( function main ( )
{
    // Read the entire content of standard input as a UTF-8 string,
    // remove leading/trailing whitespace, and split it into an array of lines.
    const lines = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) . split ( '\n' ) ;


    // The first line is parsed as a number 'n'.
    // In this specific implementation, 'n' is not used further in the main scope
    // after being read.
    const n = Number ( lines . shift ( ) ) ;


    // Take the next line from the input, split it by spaces to get an array of numbers (as strings),
    // build a max heap from this array, join the heapified array elements back with spaces,
    // prepend a single space, and then print the result to the console.
    console . log ( ' ' + buildMaxHeap ( lines . shift ( ) . split ( ' ' ) ) . join ( ' ' ) ) ;

} ) ( ) ; // End of the Immediately Invoked Function Expression for main execution.




// This function takes an array 'arr' and transforms it into a max heap in-place.
// The heap property is that for any node 'i', the value of arr[i] is greater than
// or equal to the values of its children.
function buildMaxHeap ( arr )
{
    // 'n' here represents the current size of the array, which is also the heap size.
    const n = arr . length ;

    // 'maxHeapify' is a helper arrow function that maintains the max-heap property
    // for a subtree rooted at index 'i'. It assumes its children's subtrees are already heaps.
    const maxHeapify = ( i ) =>
    {
        let left , right , largest = i ; // Initialize 'largest' with the current node's index.

        // Calculate the indices of the left and right children in a 0-indexed array.
        left = 2 * i + 1 ;
        right = 2 * i + 2 ;

        // Check if the left child exists and its value is greater than the current 'largest' element.
        // Note: Array elements are strings, so they are converted to Number for comparison.
        if ( left < n && Number ( arr [ left ] ) > Number ( arr [ largest ] ) )
        {
            largest = left ; // Update 'largest' to the left child's index.
        }

        // Check if the right child exists and its value is greater than the current 'largest' element.
        // This comparison is made against the *potentially updated* 'largest' index from the left child check.
        if ( right < n && Number ( arr [ right ] ) > Number ( arr [ largest ] ) )
        {
            largest = right ; // Update 'largest' to the right child's index.
        }

        // If 'largest' is no longer the current node 'i', it means a child is larger,
        // and a swap is necessary to maintain the max-heap property.
        if ( largest != i )
        {
            // Perform a swap between arr[i] and arr[largest] using a concise JavaScript idiom.
            arr [ largest ] = [ arr [ i ] , arr [ i ] = arr [ largest ] ] [ 0 ] ;

            // Recursively call 'maxHeapify' on the subtree where the swap occurred
            // to ensure the heap property is maintained down the tree.
            maxHeapify ( largest ) ;
        }
    } ; // End of maxHeapify helper function definition.


    // Build the max heap starting from the last non-leaf node and moving up to the root.
    // Nodes from Math.floor(arr.length / 2) to 0 are all internal nodes (parents).
    for ( let i = Math . floor ( arr . length / 2 ) ; i >= 0 ; i -- )
    {
        maxHeapify ( i ) ; // Apply maxHeapify to each parent node.
    }

    // Return the array, which is now a max heap.
    return arr ;
} // End of buildMaxHeap function.