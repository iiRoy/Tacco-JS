/*
 * This file defines a priorityQueue class
 * and a main function to process commands.
 * It uses a max-heap implementation.
 */

class priorityQueue  {
  /* The main container for the heap elements. */
  constructor ( )  {
    // Initialize the array that will hold the heap keys.
    this . keys = [ ] ;

    /*
     * Extend the Number prototype with helper methods
     * for calculating parent, left, and right child indices.
     * This is a common pattern in heap implementations.
     */
    Number . prototype . parentIdx = function ( )  {
      // Calculate the index of the parent node.
      // Using Math.ceil((this/2) - 1) ensures correct integer division for indices.
      return Math . ceil ( this / 2 - 1 ) ;
    } ;
    Number . prototype . leftIdx = function ( )  {
      /*
       * Calculate the index of the left child.
       * `this << 1` is equivalent to `this * 2`,
       * providing a bitwise optimization for multiplication.
       */
      return this << 1 + 1 ;
    } ;
    Number . prototype . rightIdx = function ( )  {
      // Calculate the index of the right child.
      // Similar bitwise optimization for `this * 2 + 2`.
      return this << 1 + 2 ;
    } ;
  } // End of constructor

  // Inserts a new key into the priority queue.
  insert ( key )  {
    // Add the key to the end of the array and then heapify up.
    // keys.push(key) returns the new length, so -1 gives the index of the new element.
    this . heapIncrease ( this . keys . push ( key ) - 1 ) ;
  } // End of insert method

  /**
   * Restores the heap property by moving an element up the heap.
   * This is typically called after inserting a new element.
   * @param {number} idx - The index of the element to increase.
   */
  heapIncrease ( idx )  {
    // Get a reference to the keys array for easier access.
    const keys = this . keys ;

    // Loop while the current element is not the root and is greater than its parent.
    // The `p` variable holds the parent index.
    for ( let i = idx , p = idx . parentIdx ( ) ;
          i > 0 && keys [ i ] > keys [ p ] ;
          i = p , p = i . parentIdx ( ) )
    {
      // Swap the current element with its parent.
      // This is a concise way to perform a swap using array destructuring.
      keys [ p ] = [ keys [ i ] , keys [ i ] = keys [ p ] ] [ 0 ] ;
    }
  } // End of heapIncrease method

  /**
   * Extracts the maximum element (root) from the priority queue.
   * In a max-heap, this is always the first element.
   * @returns {*} The maximum element.
   */
  extract ( )  {
    // Store the result (the root element).
    const res = this . keys [ 0 ] ;

    // Move the last element to the root position.
    this . keys [ 0 ] = this . keys . pop ( ) ;

    // Restore the heap property by moving the new root down.
    this . maxHeapify ( 0 ) ;

    // Return the extracted maximum element.
    return res ;
  } // End of extract method

  /**
   * Restores the max-heap property starting from a given index.
   * This is typically called after extracting the max element.
   * @param {number} idx - The index to start heapifying from.
   */
  maxHeapify ( idx )  {
    // Get references to the keys array and its length.
    const keys = this . keys ,
          n    = keys . length ;

    // Define an inner recursive function to perform the actual heapify operation.
    const innerMaxHeapify = ( i ) => {
      let left ,
          right ,
          largest = i ; // Assume the current node is the largest initially.

      // Calculate indices of left and right children.
      left  = i . leftIdx ( ) ;
      right = i . rightIdx ( ) ;

      // Check if left child exists and is larger than the current largest.
      if ( left < n && keys [ left ] > keys [ largest ] )
      {
        largest = left ; // Update largest to be the left child.
      }

      // Check if right child exists and is larger than the current largest.
      if ( right < n && keys [ right ] > keys [ largest ] )
      {
        largest = right ; // Update largest to be the right child.
      }

      // If the largest is not the current node, a swap is needed.
      if ( largest != i )  {
        // Swap the current element with the largest child.
        keys [ largest ] = [ keys [ i ] , keys [ i ] = keys [ largest ] ] [ 0 ] ;
        // Recursively call maxHeapify on the affected subtree.
        innerMaxHeapify ( largest ) ;
      }
    } ; // End of innerMaxHeapify definition.

    // Start the heapify process from the given index.
    innerMaxHeapify ( idx ) ;
  } // End of maxHeapify method
} // End of priorityQueue class definition


// Self-executing anonymous function for the main program logic.
( function main ( )  {
  // Read input from stdin, trim whitespace, split into lines, and remove the last (empty) line.
  const lines = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) . split ( '\n' ) . slice ( 0 , -1 ) ;

  // Instantiate a new priority queue.
  const queue = new priorityQueue ( ) ;

  // Initialize an empty string to accumulate output.
  let str = '' ;

  // Process each command line.
  lines . forEach ( function ( cmd )  {
    // Use a switch statement to handle different command types.
    switch ( cmd . charAt ( 0 ) )  {
      case 'i' : // 'i' for insert
        // Extract the number from the command and insert it into the queue.
        queue . insert ( Number ( cmd . split ( ' ' ) [ 1 ] ) ) ;
        break ;
      case 'e' : // 'e' for extract
        // Extract the maximum element and append it to the output string with a newline.
        str += `${ queue . extract ( ) }\n` ;
        break ;
    } // End of switch statement
  } ) ; // End of forEach loop

  // Write the accumulated output string to stdout.
  process . stdout . write ( str ) ;
} ) ( ) ; // Invoke the main function immediately.