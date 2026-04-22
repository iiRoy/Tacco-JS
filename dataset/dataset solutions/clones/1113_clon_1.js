/*
 * This JavaScript file implements a max heap construction algorithm.
 * It reads an array of numbers from standard input, builds a max heap,
 * and then prints the heapified array to standard output.
 * This is an example of a Type I code clone, where only whitespace and comments
 * have been altered from an original source.
 */

( function main ( )
{ // The main function, immediately invoked, encapsulates the primary logic.

    // Retrieve the 'fs' module for file system operations.
    // Read the entire content of '/dev/stdin' as a UTF-8 string.
    // Then, trim any leading/trailing whitespace and split the content by newlines
    // to get an array of lines.
    const lines = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) . split ( '\n' ) ;


    // The first line of input is expected to be a number 'n'.
    // Remove it from the 'lines' array and convert it to a numeric type.
    const n = Number ( lines . shift ( ) ) ;


    // The second line of input contains space-separated numbers that form the array.
    // Remove this line and split it by spaces to get the array elements.
    const arr = lines . shift ( ) . split ( ' ' ) ;


    // Invoke the 'buildMaxHeap' function to transform the 'arr' into a max heap.
    buildMaxHeap ( arr ) ;


    // After heapification, print the elements of the array.
    // The 'reduce' method concatenates each element with a preceding space,
    // starting with an empty string, effectively joining them with spaces.
    console . log ( arr . reduce ( ( s , e ) => s += ' ' + e , '' ) ) ;

} ) ( ) ; // End of the immediately invoked function expression.



/**
 * Transforms the given array into a max heap in-place.
 * A max heap is a complete binary tree where the value of each node is greater
 * than or equal to the value of its children.
 *
 * @param {Array<string>} arr - The array of numbers (represented as strings) to be heapified.
 *                              The function modifies this array directly.
 */
function buildMaxHeap ( arr )
{
    // Store the length of the array for frequent access, enhancing readability and performance.
    const n = arr . length ;

    // Declare variables that will be used within the maxHeapify closure and the loop.
    let left , right , largest ;


    /**
     * Performs the max-heapify operation on a subtree rooted at index 'i'.
     * This function assumes that the left and right subtrees of 'i' are already max heaps,
     * and it ensures that the subtree rooted at 'i' also satisfies the max-heap property.
     *
     * @param {number} i - The index of the root of the subtree to heapify.
     */
    const maxHeapify = ( i ) =>
    {
        // Calculate the 0-based indices of the left and right children.
        left = 2 * i + 1 ;
        right = 2 * i + 2 ;

        // Initialize 'largest' as the current root's index.
        // Then, compare with the left child.
        if ( ( left < n ) && ( Number ( arr [ left ] ) > Number ( arr [ i ] ) ) )
        {
            largest = left ; // If left child exists and is greater, it's the largest so far.
        }
        else
        {
            largest = i ; // Otherwise, the current node is (still) the largest.
        }

        // Now, compare the current 'largest' (either root or left child) with the right child.
        if ( ( right < n ) && ( Number ( arr [ right ] ) > Number ( arr [ largest ] ) ) )
        {
            largest = right ; // If right child exists and is greater, it becomes the largest.
        }

        // If 'largest' is not the original root 'i', a swap is necessary.
        // This means one of the children was larger than the root.
        if ( largest != i )
        {
            // Perform a swap between arr[i] and arr[largest] using a destructuring assignment trick.
            // This is equivalent to:
            // let temp = arr[i];
            // arr[i] = arr[largest];
            // arr[largest] = temp;
            arr [ largest ] = [ arr [ i ] , arr [ i ] = arr [ largest ] ] [ 0 ] ;

            // Recursively call maxHeapify on the subtree that was affected by the swap.
            // This ensures that the max-heap property is maintained down the tree.
            maxHeapify ( largest ) ;
        }
    } ; // End of the 'maxHeapify' arrow function definition.


    // The main loop for building the max heap.
    // It iterates from the last non-leaf node up to the root (index 0).
    // The last non-leaf node is typically at index `floor(n/2 - 1)`.
    for ( let i = Math . floor ( arr . length / 2 - 1 ) ; i >= 0 ; i -- )
    {
        maxHeapify ( i ) ; // Apply maxHeapify to each subtree, starting from the bottom up.
    }
} // End of the 'buildMaxHeap' function definition.