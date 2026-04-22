/*
 * This section contains utility functions for input/output and data manipulation.
 * It's generally boilerplate for competitive programming setups.
 */
var read = require('readline') . createInterface ( {
  input : process. stdin , output : process. stdout
} );
// Declare global variables to store parsed input and the input handler object.
var obj ;
var inLine = [ ] ;

// Event listener for each line of input received.
read . on ( 'line' , function ( input ) {
  inLine . push ( input ) ;
} ) ;

// Event listener for when the input stream closes.
read . on ( 'close' , function ( ) {
  // Initialize the input handler object with all collected lines.
  obj = init ( inLine ) ;
  // Output a debug message to stderr indicating input/output flow.
  console . error ( '\n↑入力 ↓出力' ) ;
  // Call the main logic function.
  Main ( ) ;
} ) ;

/**
 * Creates a deep clone of an object. Handles Sets specifically.
 * @param {any} obj The object to clone.
 * @returns {any} A deep clone of the object.
 */
function makeClone ( obj ) {
  return ( obj instanceof Set )
           ? new Set ( Array . from ( obj ) )
           : JSON . parse ( JSON . stringify ( obj ) ) ;
}

/**
 * Reads the next input token and converts it to an integer.
 * @returns {number} The next input as an integer.
 */
function nextInt ( ) {
  return myconv ( next ( ) , 1 ) ;
}

/**
 * Reads the next input token and splits it into a string array by spaces.
 * @returns {string[]} The next input as an array of strings.
 */
function nextStrArray ( ) {
  return myconv ( next ( ) , 2 ) ;
}

/**
 * Reads the next input token, splits it by spaces, and converts elements to numbers.
 * @returns {number[]} The next input as an array of numbers.
 */
function nextIntArray ( ) {
  return myconv ( next ( ) , 4 ) ;
}

/**
 * Reads the next input token and splits it into a character array.
 * @returns {string[]} The next input as an array of characters.
 */
function nextCharArray ( ) {
  return myconv ( next ( ) , 6 ) ;
}

/**
 * Retrieves the next available input token from the global 'obj' handler.
 * @returns {string} The next input token.
 */
function next ( ) {
  return obj . next ( ) ;
}

/**
 * Checks if there are more input tokens available.
 * @returns {boolean} True if more input exists, false otherwise.
 */
function hasNext ( ) {
  return obj . hasNext ( ) ;
}

/**
 * Initializes an input handler object.
 * This object manages reading lines from the 'input' array.
 * @param {string[]} input An array of input strings.
 * @returns {object} An object with methods to manage input.
 */
function init ( input ) {
  return {
    list  : input ,
    index : 0 ,
    max   : input . length ,

    /**
     * Checks if there are more lines to read.
     * @returns {boolean} True if more lines exist, false otherwise.
     */
    hasNext : function ( ) {
      return ( this . index < this . max ) ;
    } ,

    /**
     * Retrieves the next line from the input list.
     * Throws an error if no more input is available.
     * @returns {string} The next input line.
     * @throws {string} 'ArrayIndexOutOfBoundsException ‚There is no more input' if no more input.
     */
    next : function ( ) {
      if ( this . hasNext ( ) ) {
        return this . list [ this . index ++ ] ;
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input' ;
      }
    }
  } ;
}

/**
 * Outputs a string to the console, followed by a newline.
 * @param {string} s The string to output.
 */
function myout ( s ) {
  console . log ( s ) ;
}

/**
 * Outputs a debug message to stderr, inspecting an object.
 * @param {any} s The object to inspect and output.
 */
function myerr ( s ) {
  console . error ( 'debug:' + require ( 'util' ) . inspect ( s , false , null ) ) ;
}

/*
 * This `myconv` function is a utility for parsing and joining various input types.
 * The `no` parameter dictates the conversion or joining type:
 * -  1: Parse as integer.
 * -  2: Split by space into a string array.
 * -  4: Split by space and map to numbers.
 * -  6: Split by character into a character array.
 * -  7: Split by character and map to numbers.
 * -  8: Join array elements with spaces.
 * -  9: Join array elements with newlines.
 * -  0: Join array elements without any separator.
 * -  Default/Other: Return the input as is.
 */
function myconv ( i , no ) {
  try {
    switch ( no ) {
      case 1 : return parseInt ( i ) ;
      case 2 : return i . split ( ' ' ) ;
      case 4 : return i . split ( ' ' ) . map ( Number ) ;
      case 6 : return i . split ( '' ) ;
      case 7 : return i . split ( '' ) . map ( Number ) ;
      case 8 : return i . join ( ' ' ) ;
      case 9 : return i . join ( '\n' ) ;
      case 0 : return i . join ( '' ) ;
      default : return i ;
    }
  } catch ( e ) {
    return i ; // In case of error during conversion, return original input.
  }
}

/*
 * End of boilerplate utility functions.
 * The main program logic begins below.
 */
function Main ( ) {
  // Read the first line of input which contains N, K, and L.
  var one = nextIntArray ( ) ;
  var N = one [ 0 ] ; // Number of elements.
  var K = one [ 1 ] ; // Number of K-connections.
  var L = one [ 2 ] ; // Number of L-connections.

  // Initialize two Union-Find data structures, one for K-connections and one for L-connections.
  var ufk = unionFind ( N ) ;
  var ufl = unionFind ( N ) ;

  // Initialize an array to store the final output counts.
  // Each element initially represents a count of 1 (itself).
  var output = new Array ( N ) . fill ( 1 ) ;

  // Arrays to store the K-connections and L-connections.
  var klist = new Array ( K ) ;
  var llist = new Array ( L ) ;

  // Process K-connections.
  for ( var i = 0 ; i < K ; i ++ ) {
    var tmp = nextIntArray ( ) ; // Read a pair of connected nodes.
    tmp . sort ( ) ;             // Ensure consistent order (though not strictly necessary for union-find, good practice).
    tmp [ 0 ] -- ;               // Convert to 0-indexed.
    tmp [ 1 ] -- ;               // Convert to 0-indexed.
    klist [ i ] = tmp ;          // Store the connection.
    ufk . doUnion ( tmp [ 0 ] , tmp [ 1 ] ) ; // Union the two nodes in the K-Union-Find.
  }

  // Process L-connections.
  for ( var i = 0 ; i < L ; i ++ ) {
    var tmp = nextIntArray ( ) ; // Read a pair of connected nodes.
    tmp . sort ( ) ;             // Ensure consistent order.
    tmp [ 0 ] -- ;               // Convert to 0-indexed.
    tmp [ 1 ] -- ;               // Convert to 0-indexed.
    llist [ i ] = tmp ;          // Store the connection.
    ufl . doUnion ( tmp [ 0 ] , tmp [ 1 ] ) ; // Union the two nodes in the L-Union-Find.
  }

  // A Set to keep track of connections already processed to avoid double counting.
  var used = new Set ( ) ;

  // First pass: Check K-connections against L-Union-Find.
  for ( var i = 0 ; i < K ; i ++ ) {
    var tmp = klist [ i ] ;
    // If the two nodes connected by a K-connection are also in the same L-component,
    // then they contribute to the count for both nodes.
    if ( ufl . isSame ( tmp [ 0 ] , tmp [ 1 ] ) ) {
      output [ tmp [ 0 ] ] ++ ;
      output [ tmp [ 1 ] ] ++ ;
    }
    // Mark this K-connection as used to avoid re-processing in the next loop.
    used . add ( tmp . join ( ":" ) ) ;
  }

  // Second pass: Check L-connections against K-Union-Find.
  for ( var i = 0 ; i < L ; i ++ ) {
    var tmp = llist [ i ] ;
    // If this L-connection was already processed as a K-connection, skip it.
    if ( used . has ( tmp . join ( ":" ) ) ) {
      continue ;
    }
    // If the two nodes connected by an L-connection are also in the same K-component,
    // then they contribute to the count for both nodes.
    if ( ufk . isSame ( tmp [ 0 ] , tmp [ 1 ] ) ) {
      output [ tmp [ 0 ] ] ++ ;
      output [ tmp [ 1 ] ] ++ ;
    }
  }

  // Output the final counts, joined by spaces.
  myout ( myconv ( output , 8 ) ) ;
}


/**
 * Implements a Union-Find data structure (also known as Disjoint Set Union).
 * This structure efficiently keeps track of a partitioning of a set into disjoint subsets.
 * @param {number} n The number of elements in the set (0 to n-1).
 * @returns {object} A Union-Find object with methods for union and find operations.
 */
function unionFind ( n ) {
  var uf = {
    // The `list` array stores the parent of each element.
    // If list[i] is negative, i is a root, and its absolute value is the size of the component.
    // Initially, each element is its own root with a size of 1 (represented as -1).
    "list" : new Array ( n ) . fill ( -1 ) ,

    /**
     * Checks if two elements belong to the same connected component.
     * @param {number} mae The index of the first element.
     * @param {number} ato The index of the second element.
     * @returns {boolean} True if elements are in the same component, false otherwise.
     */
    "isSame" : function ( mae , ato ) {
      return this . getRootIndex ( mae ) == this . getRootIndex ( ato ) ;
    } ,

    /**
     * Finds the root (representative) of the component that an element belongs to.
     * It also performs path compression: during traversal, it makes all visited nodes
     * point directly to the root, optimizing future lookups.
     * @param {number} index The index of the element.
     * @returns {number} The root index of the element's component.
     */
    "getRootIndex" : function ( index ) {
      // If the element is a root (value is negative), return its index.
      if ( this . list [ index ] < 0 ) {
        return index ;
      } else {
        // Otherwise, recursively find the root and compress the path.
        this . list [ index ] = this . getRootIndex ( this . list [ index ] ) ;
        return this . list [ index ] ;
      }
    } ,

    /**
     * Merges two components into a single component.
     * Uses union by size: the smaller component's root becomes a child of the larger component's root.
     * This keeps the tree depth small, optimizing future operations.
     * @param {number} mae The index of an element in the first component.
     * @param {number} ato The index of an element in the second component.
     */
    "doUnion" : function ( mae , ato ) {
      var maeRoot = this . getRootIndex ( mae ) ; // Get root of first element.
      var atoRoot = this . getRootIndex ( ato ) ; // Get root of second element.

      // If they are not already in the same component, perform the union.
      if ( ! this . isSame ( maeRoot , atoRoot ) ) {
        // Union by size heuristic: attach smaller tree to root of larger tree.
        // The root with the smaller (more negative) value is the larger tree.
        if ( maeRoot >= atoRoot ) {
          // maeRoot's tree is smaller or equal in size. Attach it to atoRoot.
          this . list [ maeRoot ] += this . list [ atoRoot ] ; // Update size of new root.
          this . list [ atoRoot ] = maeRoot ; // Make maeRoot the parent of atoRoot.
        } else {
          // atoRoot's tree is smaller. Attach it to maeRoot.
          this . list [ atoRoot ] += this . list [ maeRoot ] ; // Update size of new root.
          this . list [ maeRoot ] = atoRoot ; // Make atoRoot the parent of maeRoot.
        }
      }
    } ,

    /**
     * Returns the size of the component that an element belongs to.
     * The size is stored as the absolute value of the root's `list` entry.
     * @param {number} index The index of the element.
     * @returns {number} The size of the component containing the element.
     */
    "getSize" : function ( index ) {
      return - this . list [ this . getRootIndex ( index ) ] ;
    }
  }
  return uf ; // Return the initialized Union-Find object.
}