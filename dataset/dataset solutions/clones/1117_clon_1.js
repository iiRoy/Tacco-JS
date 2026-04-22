/*
 * This file processes input lines to perform heap operations.
 * It reads commands from standard input and manipulates a max-heap structure.
 */
const line = require('fs') . readFileSync ( '/dev/stdin' , 'utf-8' ) . split ( '\n' ) ; // Read input from stdin, decode as UTF-8, and split by newline

/**
 * Performs max-heapify operation on a given array at a specific index.
 * Ensures that the subtree rooted at index 'i' satisfies the max-heap property.
 *
 * @param {Array<number>} arr - The array representing the heap.
 * @param {number} i - The 1-based index of the node to heapify.
 */
const maxHeapify = ( arr , i ) => {
    // Calculate 1-based indices for left and right children
    const l = i * 2 ; // Left child index
    const r = l + 1 ; // Right child index

    let max ; // Variable to store the index of the largest element among parent and children

    /*
     * Check if the left child exists and is greater than the current node.
     * Note: Array indices are 0-based, so we subtract 1.
     */
    if ( l <= arr . length && arr [ l - 1 ] > arr [ i - 1 ] ) {
        max = l ; // Left child is larger
    }
    else {
        max = i ; // Current node is larger or left child doesn't exist/is smaller
    }

    // Check if the right child exists and is greater than the current maximum (either parent or left child)
    if ( r <= arr . length && arr [ r - 1 ] > arr [ max - 1 ] ) {
        max = r ; // Right child is the largest
    }

    // If the largest element is not the current node, a swap is needed
    if ( max !== i ) {
        // Perform a swap to maintain the max-heap property
        const tmp = arr [ i - 1 ] ; // Temporarily store the current node's value
        arr [ i - 1 ] = arr [ max - 1 ] ; // Move the largest child's value to the current node's position
        arr [ max - 1 ] = tmp ; // Place the original current node's value into the child's position

        // Recursively call maxHeapify on the affected subtree
        maxHeapify ( arr , max ) ;
    }

} ;

/**
 * Builds a max-heap from an unsorted array.
 * It starts from the last non-leaf node and calls maxHeapify upwards.
 *
 * @param {Array<number>} arr - The array to be converted into a max-heap.
 * @returns {Array<number>} The array representing a max-heap.
 */
const buildMaxHeap = arr => {
    // Iterate from the last non-leaf node up to the root (index 1)
    for ( let i = Math . floor ( arr . length / 2 ) ; i > 0 ; i -- ) {
        // Apply maxHeapify to each node
        maxHeapify ( arr , i ) ;
    }

    return arr ; // Return the heapified array
} ;

/**
 * Inserts a new element into the max-heap.
 * If the heap is empty or the new element is smaller than the current root,
 * it's simply added. Otherwise, the heap is rebuilt to maintain the max-heap property.
 *
 * @param {Array<number>} arr - The current max-heap array.
 * @param {number} n - The number to be inserted.
 * @returns {Array<number>} The updated max-heap array.
 */
const insert = ( arr , n ) => {
    // If the new element is greater than the current root, it becomes the new root
    if ( arr . length === 0 || arr [ 0 ] < n ) {
        arr . unshift ( n ) ; // Add to the beginning
        return arr ; // No heapify needed if it's the new max or first element
    }
    else {
        // If the new element is not the largest, add it and then rebuild the heap
        arr . unshift ( n ) ; // Add to the beginning (temporarily breaking heap property)
        return buildMaxHeap ( arr ) ; // Rebuild the entire heap to incorporate the new element
    }
} ;

/**
 * Extracts the maximum element (root) from the max-heap.
 * The last element is moved to the root, and then max-heapify is called
 * to restore the heap property.
 *
 * @param {Array<number>} arr - The max-heap array.
 * @returns {number} The maximum element extracted from the heap.
 */
const extract = arr => {
    const n = arr . shift ( ) ; // Remove and store the first element (the maximum)

    // If the heap is not empty after removing the root
    if ( arr . length > 0 ) {
        arr . unshift ( arr . pop ( ) ) ; // Move the last element to the front
        buildMaxHeap ( arr ) ; // Rebuild the heap starting from the root
    }

    return n ; // Return the extracted maximum element
} ;

/*
 * Process commands from the input lines.
 * The 'data' variable acts as the accumulator (the heap array).
 */
const data = line . reduce ( ( acc , x ) => {
    const cmd = x . split ( ' ' ) ; // Split each line into command and argument

    // Use a switch statement to handle different commands
    switch ( cmd [ 0 ] ) {
        case 'insert' :
            // Insert a number into the heap
            return insert ( acc , Number ( cmd [ 1 ] ) ) ;

        case 'extract' :
            // Extract the maximum element and print it to console
            console . log ( extract ( acc ) ) ;
            return acc ; // The accumulator (heap) is modified in place by extract, so return it.

        default :
            // Handle unknown commands or empty lines (e.g., the last empty line from split)
            return acc ;
    }
} , [ ] ) ; // Initialize the accumulator as an empty array (our heap)