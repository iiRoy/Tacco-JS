/*
 * This section contains boilerplate code for input/output handling.
 * It's generally not part of the core algorithm logic but provides necessary utilities.
 */
var read = require('readline')
  .createInterface(
    {
      input  : process.stdin, /* Standard input stream */
      output : process.stdout /* Standard output stream */
    }
  );

var obj; /* Object to hold parsed input data and utility methods for `next()` and `hasNext()` */
var inLine = [ ]; /* Array to store raw input lines as they are read */

// Event listener for each line of input
read.on ( 'line' ,  function(input) {
  inLine.push(input); // Add the current line to the collection
});

// Event listener for when the input stream closes
read.on( 'close' , function ( ) {
  obj = init( inLine ); // Initialize the input object with all collected lines
  console.error( '\n↑入力 ↓出力' ); /* Debug message indicating input/output flow */
  Main ( ); // Execute the main program logic after all input is processed
} );

/**
 * Creates a deep clone of the given object.
 * Handles Set objects specifically by creating a new Set from its elements.
 * For other objects, it uses JSON serialization/deserialization for a deep copy.
 * @param {any} obj - The object to be cloned.
 * @returns {any} A deep clone of the object.
 */
function makeClone ( obj ) {
  return ( obj instanceof Set ) ? new Set ( Array.from ( obj ) ) : JSON.parse ( JSON.stringify ( obj ) ) ;
}

/**
 * Reads the next input item and converts it to an integer.
 * @returns {number} The next input as an integer.
 */
function nextInt ( ) {
  return myconv( next ( ) , 1 ) ;
}

/**
 * Reads the next input item and converts it to an array of strings, split by spaces.
 * @returns {string[]} The next input as a string array.
 */
function nextStrArray ( ) {
  return myconv( next ( ) , 2 ) ;
}

/**
 * Reads the next input item and converts it to an array of numbers, split by spaces.
 * @returns {number[]} The next input as a number array.
 */
function nextIntArray ( ) {
  return myconv( next ( ) , 4 ) ;
}

/**
 * Reads the next input item and converts it to an array of characters.
 * @returns {string[]} The next input as a character array.
 */
function nextCharArray ( ) {
  return myconv( next ( ) , 6 ) ;
}

/**
 * Retrieves the next line of input from the initialized input object.
 * @returns {string} The next line of input.
 */
function next ( ) {
  return obj.next ( ) ;
}

/**
 * Checks if there are more lines of input available.
 * @returns {boolean} True if more input exists, false otherwise.
 */
function hasNext ( ) {
  return obj.hasNext ( ) ;
}

/**
 * Initializes the input reader object with the collected input lines.
 * Provides `hasNext` and `next` methods for sequential access.
 * @param {string[]} input - An array of all input lines.
 * @returns {object} An object with input management methods.
 */
function init ( input ) {
  return {
    list  :  input,          // The array containing all input lines
    index :  0,              // Current index for reading input
    max   :  input.length,   // Total number of input lines

    /**
     * Checks if there are more lines to read.
     * @returns {boolean} True if `index` is less than `max`, false otherwise.
     */
    hasNext : function ( ) {
      return ( this.index < this.max ) ;
    },

    /**
     * Returns the next line of input and advances the internal index.
     * Throws an error if no more input is available.
     * @returns {string} The next input line.
     * @throws {string} 'ArrayIndexOutOfBoundsException ‚There is no more input' if past end.
     */
    next : function ( ) {
      if ( this.hasNext ( ) ) {
        return this.list[ this.index ++ ] ;
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input' ;
      }
    }
  };
}

/**
 * Outputs a given string to the console, followed by a newline.
 * @param {string} s - The string to output.
 */
function myout ( s ) {
  console.log ( s ) ;
}

/**
 * Outputs a debug message to the standard error stream, including detailed inspection of an object.
 * @param {any} s - The object or value to debug.
 */
function myerr ( s ) {
  console.error ( 'debug:' + require ( 'util' ) .inspect ( s , false , null ) ) ;
}

/*
 * The 'myconv' function is a versatile utility for parsing and formatting input/output.
 * The 'no' parameter acts as a control code specifying the desired conversion type:
 *   - 1: Parses the input string 'i' into an integer.
 *   - 2: Splits the input string 'i' by spaces into an array of strings.
 *   - 4: Splits the input string 'i' by spaces and then maps each part to a Number.
 *   - 6: Splits the input string 'i' into an array of individual characters.
 *   - 7: Splits the input string 'i' into characters and then maps each character to a Number.
 *   - 8: Joins the elements of an array 'i' with spaces.
 *   - 9: Joins the elements of an array 'i' with newline characters.
 *   - 0: Joins the elements of an array 'i' without any separator.
 *   - Default: If 'no' does not match any known case, the original input 'i' is returned as-is.
 *   - Error Handling: If any conversion operation throws an error, the original input 'i' is returned.
 */
function myconv ( i , no ) {
  try {
    switch ( no ) {
      case 1 : return parseInt ( i ) ;
      case 2 : return i.split ( ' ' ) ;
      case 4 : return i.split ( ' ' ) .map ( Number ) ;
      case 6 : return i.split ( '' ) ;
      case 7 : return i.split ( '' ) .map ( Number ) ;
      case 8 : return i.join ( ' ' ) ;
      case 9 : return i.join ( '\n' ) ;
      case 0 : return i.join ( '' ) ;
      default: return i ;
    }
  } catch ( e ) {
    return i ; /* In case of any conversion error, return the original input */
  }
}

/* End of boilerplate input/output utility functions. */

/**
 * This is the primary execution function for the program.
 * It reads initial parameters, initializes a Union-Find data structure,
 * and then processes a series of queries (union or same-set checks).
 */
function Main ( ) {
  var one = nextIntArray ( ); // Read the first line, expecting two integers (N and Q)
  var N = one [ 0 ] ;         // N: Number of elements for the Union-Find structure
  var Q = one [ 1 ] ;         // Q: Number of queries to process

  var uf = unionFind ( N ) ;  // Initialize a Union-Find data structure with N elements

  // Loop through each of the Q queries
  for ( var i = 0 ; i < Q ; i ++ ) {
    var tmp = nextIntArray ( ) ; // Read the current query line, expecting three integers (t, u, v)
    var t = tmp [ 0 ] ;          // t: Query type (0 for union, 1 for check if same set)
    var u = tmp [ 1 ] ;          // u: The first element involved in the query
    var v = tmp [ 2 ] ;          // v: The second element involved in the query

    if ( t == 0 ) {
      // If query type is 0, perform a union operation on elements u and v
      uf.doUnion ( u , v ) ;
    } else {
      // If query type is 1, check if elements u and v are in the same set
      // Output 1 if they are, 0 otherwise
      myout ( ( uf.isSame ( u , v ) ) ? 1 : 0 ) ;
    }
  }
}

/**
 * Constructs a Union-Find (Disjoint Set Union) data structure.
 * This structure efficiently manages a collection of disjoint sets and supports
 * two primary operations: uniting two sets, and finding which set an element belongs to.
 * @param {number} n - The initial number of disjoint sets (elements).
 * @returns {object} An object representing the Union-Find data structure with its methods.
 */
function unionFind ( n ) {
  var uf = {
    /*
     * The 'list' array stores parent pointers or set sizes.
     * If list[i] < 0, then i is a root, and its absolute value represents the size of the set.
     * If list[i] >= 0, then list[i] is the parent of element i.
     * Initially, each element is its own root, with a set size of 1 (represented as -1).
     */
    "list" : new Array ( n ) .fill ( -1 ) ,

    /**
     * Checks if two elements 'mae' and 'ato' belong to the same set.
     * This is determined by comparing the root representatives of their respective sets.
     * @param {number} mae - The index of the first element.
     * @param {number} ato - The index of the second element.
     * @returns {boolean} True if 'mae' and 'ato' have the same root, false otherwise.
     */
    "isSame" : function ( mae , ato ) {
      return this.getRootIndex ( mae ) == this.getRootIndex ( ato ) ;
    } ,

    /**
     * Finds the root (representative) of the set containing 'index'.
     * This method implements path compression optimization:
     * during traversal from 'index' to its root, it makes every node on the path
     * point directly to the root, flattening the tree structure for faster future lookups.
     * @param {number} index - The element's index for which to find the root.
     * @returns {number} The index of the root of the set containing 'index'.
     */
    "getRootIndex" : function ( index ) {
      if ( this.list [ index ] < 0 ) {
        return index ; /* If list[index] is negative, 'index' itself is a root */
      } else {
        /* Recursively find the root and apply path compression */
        this.list [ index ] = this.getRootIndex ( this.list [ index ] ) ;
        return this.list [ index ] ;
      }
    } ,

    /**
     * Merges the sets containing elements 'mae' and 'ato'.
     * This operation performs a union by size heuristic (or union by rank, depending on interpretation of `maeRoot >= atoRoot` comparison):
     * the root of the smaller tree is attached as a child to the root of the larger tree.
     * The size of the combined set is updated at the new root.
     * If 'mae' and 'ato' are already in the same set, no action is taken.
     * @param {number} mae - The index of the first element.
     * @param {number} ato - The index of the second element.
     */
    "doUnion" : function ( mae , ato ) {
      var maeRoot = this.getRootIndex ( mae ) ; // Find the root of 'mae'
      var atoRoot = this.getRootIndex ( ato ) ; // Find the root of 'ato'

      /* Only unite the sets if they are currently disjoint (i.e., have different roots) */
      if ( ! this.isSame ( maeRoot , atoRoot ) ) {
        /*
         * Union by size (or rank heuristic):
         * The root with the "larger" (or "higher rank") index becomes the parent.
         * The original code uses `maeRoot >= atoRoot` for this decision.
         * The size of the new combined set is updated at the new root.
         */
        if ( maeRoot >= atoRoot ) {
          this.list [ maeRoot ] += this.list [ atoRoot ] ; /* Update size of maeRoot's set */
          this.list [ atoRoot ] = maeRoot ;               /* Make maeRoot the parent of atoRoot */
        } else {
          this.list [ atoRoot ] += this.list [ maeRoot ] ; /* Update size of atoRoot's set */
          this.list [ maeRoot ] = atoRoot ;               /* Make atoRoot the parent of maeRoot */
        }
      }
    } ,

    /**
     * Returns the size of the set containing the given 'index'.
     * The size is stored as a negative value at the root of the set.
     * @param {number} index - The element's index.
     * @returns {number} The size of the set to which 'index' belongs.
     */
    "getSize" : function ( index ) {
      return - this.list [ this.getRootIndex ( index ) ] ; // Get root, then take absolute value of its list entry
    }
  } ; /* End of unionFind object definition */

  return uf ; /* Return the initialized Union-Find object */
}