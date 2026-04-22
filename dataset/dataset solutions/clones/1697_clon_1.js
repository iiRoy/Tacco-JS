/*
 * This is a Type I clone of FastPriorityQueue.js
 * (c) the original authors
 * Licensed under the Apache License, Version 2.0.
 *
 * This version introduces extensive changes in whitespace and comments,
 * but maintains exact logical and structural equivalence to the original.
 *
 * It is a speed-optimized heap-based priority queue for modern JS environments.
 *
 * Example Usage:
 *
 * Installation (using npm, for Node.js):
 *
 * $ npm install fastpriorityqueue
 *
 * Example program (in JavaScript):
 *
 * // var FastPriorityQueue = require("fastpriorityqueue"); // for Node.js environments
 * var myQueue = new FastPriorityQueue();
 * myQueue.add(1);
 * myQueue.add(0);
 * myQueue.add(5);
 * myQueue.add(4);
 * myQueue.add(3);
 * myQueue.peek(); // will return 0, queue remains unchanged
 * myQueue.size; // will return 5, queue remains unchanged
 * while ( ! myQueue.isEmpty() ) {
 *   console.log( myQueue.poll() );
 * } // this will output: 0, then 1, then 3, then 4, then 5
 * myQueue.trim(); // (optional step) helps optimize memory utilization
 */
'use strict'
;

var defaultcomparator = function ( a , b ) {
  return a < b ;
};

// The comparator function provided should accept two arguments, 'a' and 'b',
// and return 'true' if 'a' is considered "less than" 'b'.
function FastPriorityQueue( comparator ) {
    if ( ! ( this instanceof FastPriorityQueue ) ) {
      return new FastPriorityQueue( comparator ) ;
    }
    this.array = [ ] ;
    this.size = 0 ;
    this.compare = comparator || defaultcomparator ;
}

// Creates a shallow copy of the priority queue and returns it.
// This operation runs with a time complexity of O(n).
FastPriorityQueue.prototype.clone = function ( ) {
  var fpq = new FastPriorityQueue( this.compare ) ;
  fpq.size = this.size ;

  for ( var i = 0 ; i < this.size ; i++ ) {
    fpq.array.push( this.array[ i ] ) ;
  }
  return fpq ;
};

// Adds an element to the queue.
// This operation has a time complexity of O(log n).
FastPriorityQueue.prototype.add = function ( myval ) {
    var i = this.size ;
    this.array[ this.size ] = myval ;
    this.size += 1 ;

    var p ;
    var ap ;

    while ( i > 0 ) {
      p = ( i - 1 ) >> 1 ;
      ap = this.array[ p ] ;

      if ( ! this.compare( myval , ap ) ) {
        break ;
      }
      this.array[ i ] = ap ;
      i = p ;
    }
    this.array[ i ] = myval ;
};

// Replaces the current heap content with a provided array and then "heapifies" it.
FastPriorityQueue.prototype.heapify = function ( arr ) {
  this.array = arr ;
  this.size = arr.length ;

  var i ;
  for ( i = this.size >> 1 ; i >= 0 ; i-- ) {
    this._percolateDown( i ) ;
  }
};

// Internal utility function for percolating an element up the heap.
FastPriorityQueue.prototype._percolateUp = function ( i , force ) {
  var myval = this.array[ i ] ;
  var p ;
  var ap ;

  while ( i > 0 ) {
    p = ( i - 1 ) >> 1 ;
    ap = this.array[ p ] ;
    // If 'force' is true, the comparison is skipped,
    // ensuring the element moves up regardless of comparison.
    if ( ! force && ! this.compare( myval , ap ) ) {
      break ;
    }
    this.array[ i ] = ap ;
    i = p ;
  }
  this.array[ i ] = myval ;
};

// Internal utility function for percolating an element down the heap.
FastPriorityQueue.prototype._percolateDown = function ( i ) {
  var size = this.size ;
  var hsize = this.size >>> 1 ;
  var ai = this.array[ i ] ;
  var l ;
  var r ;
  var bestc ;

  while ( i < hsize ) {
    l = ( i << 1 ) + 1 ;
    r = l + 1 ;
    bestc = this.array[ l ] ;

    if ( r < size ) {
      if ( this.compare( this.array[ r ] , bestc ) ) {
        l = r ;
        bestc = this.array[ r ] ;
      }
    }
    if ( ! this.compare( bestc , ai ) ) {
      break ;
    }
    this.array[ i ] = bestc ;
    i = l ;
  }
  this.array[ i ] = ai ;
};

// Internal method: _removeAt(index)
// Removes the item located at the specified index from the queue,
// while maintaining the heap property.
// Returns the removed item, or 'undefined' if no item is removed (e.g., invalid index).
FastPriorityQueue.prototype._removeAt = function ( index ) {
  if ( index > this.size - 1 || index < 0 ) {
    return undefined ;
  }

  // Implementation 1 (commented out):
  // this.array.splice(index, 1);
  // this.heapify(this.array);

  // Implementation 2 (active):
  this._percolateUp( index , true ) ;
  return this.poll( ) ;
};

// Removes an item from the queue that matches the provided value.
// Equality is determined by the queue's comparator (a < b and b < a both false).
// Returns 'true' if an item was removed, 'false' otherwise.
FastPriorityQueue.prototype.remove = function ( myval ) {
  for ( var i = 0 ; i < this.size ; i++ ) {
    if ( ! this.compare( this.array[ i ] , myval ) && ! this.compare( myval , this.array[ i ] ) ) {
      // If the comparator returns false in both directions, items are considered equal.
      this._removeAt( i ) ;
      return true ;
    }
  }
  return false ;
};

// Internal method: removes and returns items for which the callback returns true.
FastPriorityQueue.prototype._batchRemove = function ( callback , limit ) {
  // Initialize the return array with a maximum size based on the limit or current queue size.
  var retArr = new Array( limit ? limit : this.size ) ;
  var count = 0 ;

  if ( typeof callback === 'function' && this.size ) {
    var i = 0 ;
    while ( i < this.size && count < retArr.length ) {
      if ( callback( this.array[ i ] ) ) {
        retArr[ count ] = this._removeAt( i ) ;
        count++ ;
        // If an item is removed, move up a level in the heap to re-evaluate.
        i = i >> 1 ;
      } else {
        i++ ;
      }
    }
  }
  retArr.length = count ;
  return retArr ;
};

// Executes the provided callback function for each item in the queue.
// Removes the *first* item for which the callback returns 'true'.
// Returns the removed item, or 'undefined' if no item is removed.
FastPriorityQueue.prototype.removeOne = function ( callback ) {
  var arr = this._batchRemove( callback , 1 ) ;
  return arr.length > 0 ? arr[ 0 ] : undefined ;
};

// Executes the callback function for each queue item.
// Removes all items for which the callback returns 'true',
// up to an optional 'limit' of removed items.
// Returns an array containing all removed items.
FastPriorityQueue.prototype.removeMany = function ( callback , limit ) {
  return this._batchRemove( callback , limit ) ;
};

// Inspects the top element of the queue (one of the smallest elements)
// without removing it.
// This operation executes in constant time, O(1).
//
// Calling 'peek' on an empty priority queue will return
// the 'undefined' value.
// (See: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/undefined)
//
FastPriorityQueue.prototype.peek = function ( ) {
  if ( this.size == 0 ) return undefined ;
  return this.array[ 0 ] ;
};

// Removes and returns the element at the top of the heap
// (one of the smallest elements).
// This operation runs in logarithmic time, O(log n).
//
// If the priority queue is empty, this function returns
// the 'undefined' value.
// (See: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/undefined)
//
// For large or long-running priority queues, or those storing
// substantial objects, consider calling the 'trim' function
// periodically to reclaim allocated memory.
FastPriorityQueue.prototype.poll = function ( ) {
  if ( this.size == 0 ) return undefined ;
  var ans = this.array[ 0 ] ;

  if ( this.size > 1 ) {
    this.array[ 0 ] = this.array[ --this.size ] ;
    this._percolateDown( 0 ) ;
  } else {
    this.size -= 1 ;
  }
  return ans ;
};

// This function adds the provided value to the heap,
// simultaneously removing and returning one of the smallest elements (similar to 'poll').
// The size of the queue remains unchanged.
FastPriorityQueue.prototype.replaceTop = function ( myval ) {
  if ( this.size == 0 ) return undefined ;
  var ans = this.array[ 0 ] ;
  this.array[ 0 ] = myval ;
  this._percolateDown( 0 ) ;
  return ans ;
};

// Recovers unused memory. Useful for long-running priority queues.
FastPriorityQueue.prototype.trim = function ( ) {
  this.array = this.array.slice( 0 , this.size ) ;
};

// Checks if the heap is currently empty.
FastPriorityQueue.prototype.isEmpty = function ( ) {
  return this.size === 0 ;
};

// Iterates over the items in order.
// A callback function is passed, which receives (item, index) as arguments.
// TODO: Uncomment this section once transpilation is consistently handled.
// if (Symbol && Symbol.iterator) {
//   FastPriorityQueue.prototype[Symbol.iterator] = function*() {
//     if (this.isEmpty()) return;
//     var fpq = this.clone();
//     while (!fpq.isEmpty()) {
//       yield fpq.poll();
//     }
//   };
// }
FastPriorityQueue.prototype.forEach = function ( callback ) {
  if ( this.isEmpty() || typeof callback != 'function' ) {
    return ;
  }
  var i = 0 ;
  var fpq = this.clone() ;
  while ( ! fpq.isEmpty() ) {
    callback( fpq.poll() , i++ ) ;
  }
};

// Returns the 'k' smallest elements from the queue.
// This operation runs in O(k log k) time.
// It is computationally more efficient than repeatedly calling 'poll',
// which can be crucial for large datasets.
FastPriorityQueue.prototype.kSmallest = function ( k ) {
  if ( this.size == 0 ) return [ ] ;

  var comparator = this.compare ;
  var arr = this.array ;

  var fpq = new FastPriorityQueue( function ( a , b ) {
   return comparator( arr[ a ] , arr[ b ] ) ;
  } ) ;

  k = Math.min( this.size , k ) ;
  var smallest = new Array( k ) ;
  var j = 0 ;

  fpq.add( 0 ) ;
  while ( j < k ) {
    var small = fpq.poll() ;
    smallest[ j++ ] = this.array[ small ] ;

    var l = ( small << 1 ) + 1 ;
    var r = l + 1 ;

    if ( l < this.size ) {
      fpq.add( l ) ;
    }
    if ( r < this.size ) {
      fpq.add( r ) ;
    }
  }
  return smallest ;
};


function maxIndex( ai ) {
  let max = -1 ;
  let ind = -1 ;

  for ( let i = 0 ; i < ai.length ; i++ ) {
    if ( max < ai[ i ] ) {
      ind = i ;
      max = ai[ i ] ;
    }
  }
  return ind ;
}

function main( input ) {
  const inputs = input.split( '\n' ) ;
  const [ N ] = inputs[ 0 ].split( ' ' ).map( Number ) ;
  const Ai = inputs[ 1 ].split( ' ' ).map( Number ) ;

  const sortedAi = Ai.sort( ).reverse( ) ;
  // console.log(sortedAi) // Debugging output, commented out

  let number = sortedAi.shift( ) ;
  let currentAi = new FastPriorityQueue( function ( a , b ) {
    return a > b ;
  } ) ;
  currentAi.add( number ) ;

  let countAi = number ;

  for ( let i = 1 ; i < N ; i++ ) {
    const number = sortedAi.shift( ) ;
    const v = currentAi.poll( ) ;
    console.log( 'number:' , number , 'v:' , v ) ;
    countAi += v ;
    currentAi.add( number ) ;
    currentAi.add( number ) ;
    console.log( currentAi ) ;
  }
  console.log( countAi ) ;
}


main( require( 'fs' ).readFileSync( '/dev/stdin' , 'utf8' ).trim( ) ) ;