'use strict' ;

  class Main {

    solve ( ) {

      // Retrieve the initial numbers from input.
      const nums = input . nextIntArr ( ) ;

      // Extract the value of 'k' from the second element.
      const k = nums [ 1 ] ;

      // Read a range of integers into 'table'.
      const table = input . nextIntRange ( nums [ 0 ] ) ;

      // Initialize an array to store scores.
      const score = [ ] ;

      /*
       * Sort the table by the second element (value) in ascending order,
       * then reverse it to get descending order.
       */
      table . sort ( e => e [ 1 ] ) . reverse ( ) ;

      // Select the first 'k' elements from the sorted table.
      const s = _ . first ( table , k ) ;

      // Initialize an object to count occurrences of each kind.
      const kinds = { } ;

      // Populate the 'kinds' object.
      s . forEach ( e => kinds [ e [ 0 ] ] = ( kinds [ e [ 0 ] ] ? kinds [ e [ 0 ] ] + 1 : 1 ) ) ;

      // Determine the initial number of unique kinds.
      let kind = Object . keys ( kinds ) . length ;

      // Calculate the initial score: sum of values in 's'.
      score [ kind ] = _ . sum ( s . map ( s => s [ 1 ] ) ) ;

      // Create a new BinaryHeap instance for managing elements.
      const heap = new BinaryHeap ( ) ;

      // Add elements from 's' to the heap if their kind count is greater than 1.
      s . forEach ( e => {
        if ( kinds [ e [ 0 ] ] > 1 ) {
          heap . push ( - e [ 1 ] , e ) ; // Store negative value for max heap behavior
        }
      } ) ;

      // Initialize a cursor for 'table'.
      let cur = s . length ;

      // Loop while the heap is not empty and we haven't processed all of 'table'.
      while ( heap . length > 0 && cur < table . length ) {

        // Pop the element with the highest priority (smallest value due to negation).
        const target = heap . pop ( ) ;

        // Check if the kind of the popped element still has duplicates.
        if ( kinds [ target [ 0 ] ] >= 2 ) {

          // Inner loop to find a suitable replacement.
          do {
            let next = table [ cur ] ; // Get the next element from the sorted table.

            // If the 'next' element's kind is not yet present.
            if ( ! kinds [ next [ 0 ] ] ) {

              heap . push ( - next [ 1 ] , next ) ; // Add the new element to the heap.
              ++ kind ; // Increment the count of unique kinds.
              -- kinds [ target [ 0 ] ] ; // Decrement the count for the target's kind.

              // Calculate the new score.
              score [ kind ] = score [ kind - 1 ] + next [ 1 ] - target [ 1 ] ;
              break ; // Exit the inner loop as a replacement is found.
            }

            ++ cur ; // Move to the next element in 'table'.
          } while ( cur < table . length ) ; // Continue if 'cur' is within bounds.
        }
        else {
          // If the kind count is 1, this element is no longer a candidate for replacement.
          // No action needed; it's effectively removed from consideration.
          // This path is taken when an element was pushed to heap, but its kind count
          // dropped below 2 due to other replacements.
        }
      }

      // Final scoring calculation: add square of kind count to each score.
      const scores = score . map ( ( e , i ) => e ? ( e + i * i ) : 0 ) ;

      // Print the maximum score found.
      console . log ( _ . max ( scores ) ) ;
    }
  }


  class Input {
    constructor ( ) {
      this . cursor = 0 ; // Initialize the cursor for reading input.
      this . inputAll ( ) ; // Read all input upon instantiation.
    }

    /*
     * Reads the entire standard input and splits it by newlines.
     * Stores the lines in this.data.
     */
    inputAll ( ) {
      this . data = ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) . split ( '\n' ) ;
      return this . data ;
    }

    /*
     * Retrieves the next 'n' lines or a single line if 'n' is not provided.
     * Advances the cursor accordingly.
     */
    nextLine ( n ) {
      if ( n ) {
        const ret = this . data . slice ( this . cursor , this . cursor + n ) ;
        this . cursor += n ;
        return ret ;
      }
      return this . data [ this . cursor ++ ] ;
    }

    // Reads the next line and splits it into an array of strings.
    nextStrArr ( ) {
      return this . nextLine ( ) . split ( ' ' ) ;
    }

    // Reads the next line, splits it, and parses each part as an integer.
    nextIntArr ( ) {
      return this . nextStrArr ( ) . map ( ( e ) => parseInt ( e ) ) ;
    }

    /*
     * Reads 'n' lines, and for each line, splits it into an array of strings.
     * Returns an array of these string arrays.
     */
    nextStrRange ( n ) {
      return this . nextLine ( n ) . map ( ( line ) => line . split ( ' ' ) ) ;
    }

    /*
     * Reads 'n' lines, and for each line, splits it and parses each part as an integer.
     * Returns an array of integer arrays.
     */
    nextIntRange ( n ) {
      return this . nextLine ( n ) . map ( ( line ) => line . split ( ' ' ) . map ( ( e ) => parseInt ( e ) ) ) ;
    }
  }

/*
 *  A simplified port of some Underscore.js utility methods
 *  and other useful helper functions.
 */
class Underscore {

  // Calculates the sum of all numbers in an array.
  sum ( arr ) {
    return arr . reduce ( ( a , b ) => a + b ) ;
  }

  /*
   * Finds the minimum element in an array.
   * An optional 'func' can be provided for custom comparison.
   */
  min ( arr , func ) {
    if ( func == null ) {
      func = ( a , b ) => a - b
    }
    return arr . reduce ( ( a , b ) => func ( a , b ) < 0 ? a : b ) ;
  }

  /*
   * Finds the maximum element in an array.
   * An optional 'func' can be provided for custom comparison.
   */
  max ( arr , func ) {
    if ( func == null ) {
      func = ( a , b ) => a - b
    }
    return arr . reduce ( ( a , b ) => func ( a , b ) > 0 ? a : b ) ;
  }

  /*
   * Generates a range of numbers.
   * Similar to Python's range function.
   */
  range ( start , stop , step ) {
    if ( stop == null ) {
      stop = start || 0 ;
      start = 0 ;
    }
    if ( ! step ) {
      step = stop < start ? - 1 : 1 ;
    }
    const length = Math . max ( Math . ceil ( ( stop - start ) / step ) , 0 ) ;
    const range = Array ( length ) ;

    for ( var idx = 0 ; idx < length ; idx ++ , start += step ) {
      range [ idx ] = start ;
    }
    return range ;
  }

  /*
   * Gets the first element or first 'n' elements of an array.
   */
  first ( array , n ) {
    if ( array == null || array . length < 1 ) return n == null ? void 0 : [ ] ;
    if ( n == null ) return array [ 0 ] ;
    return this . initial ( array , array . length - n ) ;
  } ;

  /*
   * Returns all but the last element (or last 'n' elements) of an array.
   */
  initial ( array , n ) {
    return array . slice . call ( array , 0 , Math . max ( 0 , array . length - ( n == null ? 1 : n ) ) ) ;
  }

  /*
   * Returns all but the first element (or first 'n' elements) of an array.
   */
  tail ( arr , n ) {
    return array . slice . call ( arr , n == null ? 1 : n ) ;
  }

  /*
   * Gets the last element or last 'n' elements of an array.
   */
  last ( array , n ) {
    if ( n == null ) return array [ array . length - 1 ] ;
    return this . tail ( array , Math . max ( 0 , array . length - n ) ) ;
  }

  /*
   * Performs a binary search on a sorted array.
   * 'iteratee' can be a property name if elements are objects.
   */
  binarySearch ( array , key , iteratee ) {
    const itr = ( obj ) => ( typeof obj === 'object' ) ? obj [ iteratee ] : obj ;
    const value = itr ( obj ) ;
    let low = 0 , high = array . length ;
    while ( low < high ) {
      let mid = Math . floor ( ( low + high ) / 2 ) ;
      if ( itr ( array [ mid ] ) < value ) low = mid + 1 ;
      else high = mid ;
    }
    return low ;
  } ;
}

// Instantiate the Underscore utility class.
const _ = new Underscore ( ) ;

/*
 *  Implementation of a Binary Max Heap data structure.
 *  It stores elements with a priority and a value.
 */
class BinaryHeap {
  constructor ( ) {
    this . _data = [ ] ; // Array to store the heap elements.
    this . _length = 0 ; // Current number of elements in the heap.
  }

  /*
   * Adds a new element with a given priority and value to the heap.
   * Maintains the heap property by performing an "up heap" operation.
   */
  push ( priority , value ) {
    const data = this . _data ;
    data . push ( { p : priority , v : value } ) ; // Add the new element to the end.
    let i = this . _length ; // Index of the newly added element.
    let p = ( i - 1 ) >> 1 ; // Calculate the parent's index.

    // Perform up heap: move the element up if its priority is greater than its parent's.
    while ( p >= 0 && data [ p ] . p < data [ i ] . p ) {
      // Swap child and parent.
      const tmp = data [ i ] ;
      data [ i ] = data [ p ] ;
      data [ p ] = tmp ;

      i = p ; // Update current index to parent's index.
      p = ( i - 1 ) >> 1 ; // Recalculate new parent's index.
    }
    ++ this . _length ; // Increment the heap length.
  }

  /*
   * Removes and returns the element with the highest priority (the root of the heap).
   * Maintains the heap property by performing a "down heap" operation.
   */
  pop ( ) {
    if ( this . length <= 0 ) {
      return null ; // Return null if the heap is empty.
    }
    const length = this . _length - 1 ; // New length after removal.
    const data = this . _data ;
    const _top = this . top ; // Store the value of the top element to return later.

    data [ 0 ] = data [ length ] ; // Move the last element to the root.
    data . pop ( ) ; // Remove the last element.

    let i = 0 ; // Current index, starting from the root.
    let c1 = ( i << 1 ) + 1 ; // Index of the left child.
    let c2 = ( i << 1 ) + 2 ; // Index of the right child.

    // Perform down heap: move the element down if it violates the heap property.
    let p0 , p1 , p2 ;
    while ( c1 < length ) { // While the left child is within bounds.
      if ( c2 < length ) {
        // Both children exist.
        p0 = data [ i ] . p ;
        p1 = data [ c1 ] . p ;
        p2 = data [ c2 ] . p ;

        if ( ( p1 < p2 ) && ( p0 < p2 ) ) {
          // If the right child has higher priority than both parent and left child, swap with right.
          const tmp = data [ i ] ;
          data [ i ] = data [ c2 ] ;
          data [ c2 ] = tmp ;
          i = c2 ; // Move to the right child's index.
        }
        else if ( p0 < p1 ) {
          // If the left child has higher priority than the parent (and potentially right child), swap with left.
          const tmp = data [ i ] ;
          data [ i ] = data [ c1 ] ;
          data [ c1 ] = tmp ;
          i = c1 ; // Move to the left child's index.
        } else {
          break; // Parent is already greater than both children, heap property maintained.
        }
        // Recalculate children indices for the new position.
        c1 = ( i << 1 ) + 1 ;
        c2 = ( i << 1 ) + 2 ;
      }
      else {
        // Only the left child exists (right child is out of bounds).
        p0 = data [ i ] . p ;
        p1 = data [ c1 ] . p ;
        if ( p0 < p1 ) {
          // If the left child has higher priority than the parent, swap.
          const tmp = data [ i ] ;
          data [ i ] = data [ c1 ] ;
          data [ c1 ] = tmp ;
        }
        break ; // No more children or heap property is maintained.
      }
    }

    this . _length = length ; // Update the heap's length.
    return _top ; // Return the value of the original top element.
  }

  /*
   * Getter for the element with the highest priority (the root's value).
   * Does not remove the element.
   */
  get top ( ) {
    return this . _data [ 0 ] . v ;
  }

  /*
   * Getter for the current number of elements in the heap.
   */
  get length ( ) {
    return this . _length ;
  }
}

// Instantiate the Input handler.
const input = new Input ( ) ;

// Create an instance of Main and execute its solve method.
( new Main ( ) ) . solve ( ) ;