/* This is a Type I clone of the original priority queue implementation.
 * It maintains the exact same logic, identifiers, and structure,
 * but varies in whitespace and comments to appear visually different. */
class priorityQueue { // Defines the priorityQueue class
  // Constructor for initializing the priority queue
  constructor( ) {
    this.keys = [ ]; // Array to store the heap elements


    /* Extend Number.prototype to add helper methods for
     * calculating parent, left child, and right child indices.
     * These methods are crucial for heap operations. */
    Number.prototype.parentIdx = function ( ) {
      return ( this - 1 ) >> 1;
    };


    Number.prototype.leftIdx = function ( ) {
      return ( this << 1 ) + 1;
    };


    Number.prototype.rightIdx = function ( ) {
      return ( this << 1 ) + 2;
    };
  } /* End of constructor */


  // Inserts a new key into the priority queue
  insert ( key ) {
    // Add the key to the end and then fix its position by increasing its heap property
    this.heapIncrease( this.keys.push( key ) - 1 );
  } // End of insert method


  /* Restores the heap property by moving an element up the heap
   * if it is greater than its parent. This is used after insertion. */
  heapIncrease ( idx ) {
    const keys = this.keys; // Cache the keys array for performance

    /* Loop while the current element is not the root (i > 0)
     * and is greater than its parent. */
    for ( let i = idx, p = idx.parentIdx( );
          i > 0 && keys[ i ] > keys[ p ];
          i = p, p = i.parentIdx( ) )
    {
      // Swap keys[p] and keys[i] using a destructuring assignment trick
      keys[ p ] = [ keys[ i ], keys[ i ] = keys[ p ] ][ 0 ];
    }
  } // End of heapIncrease method


  // Extracts the maximum element from the priority queue (the root)
  extract ( ) {
    const res = this.keys[ 0 ]; // Store the root (max element)

    this.keys[ 0 ] = this.keys.pop( ); // Move the last element to the root position

    this.maxHeapify( 0 ); // Restore the max-heap property starting from the root

    return res; // Return the extracted maximum element
  } // End of extract method


  /* Restores the max-heap property for a subtree rooted at 'idx'.
   * This is typically used after extraction or deletion. */
  maxHeapify ( idx ) {
    const keys = this.keys, // Reference to the heap array
          n = keys.length; // Current size of the heap


    // Inner recursive function to perform the actual heapify operation
    const innerMaxHeapify = ( i ) => {
      let left, // Index of the left child
          right, // Index of the right child
          largest = i; // Assume current node is the largest initially

      left = i.leftIdx( ); // Calculate left child index
      right = i.rightIdx( ); // Calculate right child index

      // Check if left child exists and is greater than the current largest
      if ( left < n && keys[ left ] > keys[ largest ] ) {
        largest = left;
      }

      // Check if right child exists and is greater than the current largest
      if ( right < n && keys[ right ] > keys[ largest ] ) {
        largest = right;
      }

      // If the largest is not the current node, a swap is needed
      if ( largest != i ) {
        // Swap keys[largest] and keys[i]
        keys[ largest ] = [ keys[ i ], keys[ i ] = keys[ largest ] ][ 0 ];

        // Recursively call maxHeapify on the affected subtree
        innerMaxHeapify( largest );
      }
    }; // End of innerMaxHeapify

    innerMaxHeapify( idx ); // Start the heapify process from the given index
  } // End of maxHeapify method
} // End of priorityQueue class


// Self-executing anonymous function (IIFE) to run the main logic
( function main ( ) {
  // Read input from stdin, decode as utf8, trim whitespace,
  // split into lines, and remove the last (empty) line.
  const lines = require( 'fs' )
                  .readFileSync( '/dev/stdin', 'utf8' )
                  .trim( )
                  .split( '\n' )
                  .slice( 0, -1 );

  const queue = new priorityQueue( ); // Create a new priority queue instance

  let str = ''; // Initialize an empty string to accumulate output

  // Process each command line
  lines.forEach( function ( cmd ) {
    // Determine action based on the first character of the command
    switch ( cmd.charAt( 0 ) ) {
      case 'i': // 'insert' command
        queue.insert( Number( cmd.split( ' ' )[ 1 ] ) ); // Extract number and insert
        break;

      case 'e': // 'extract' command
        str += `${ queue.extract( ) }\n`; // Extract max and append to output string
        break;
    }
  } ); // End of forEach loop

  process.stdout.write( str ); // Write the accumulated output to stdout
} )( ); // Immediately invoke the main function