// This section handles input/output operations and utility functions.
// It's generally not part of the core algorithm logic.
// Don't have to see. start ------------------------------------------

// Initialize readline interface for standard input and output.
var read = require('readline') . createInterface(
  {
    input  :  process . stdin  ,
    output :  process . stdout
  }
) ;

// Declare variables to store the input lines and the parsed input object.
var obj ;
var inLine = [ ] ;

// Event listener for each line of input received.
// Pushes the input line into the 'inLine' array.
read . on( 'line' , function ( input ) {
  inLine . push( input ) ;
} ) ;

// Event listener for the 'close' event, indicating end of input.
// This is where the main processing begins after all input is gathered.
read . on( 'close' , function ( ) {
  // Initialize the input object with all collected lines.
  obj = init( inLine ) ;

  // Output a debug message to stderr indicating input/output flow.
  console . error( '\n↑入力 ↓出力' ) ;

  // Call the main function of the program.
  Main( ) ;
} ) ;

/**
 * Creates a deep clone of an object.
 * Handles Set objects specifically, otherwise uses JSON serialization for deep cloning.
 *
 * @param {any} obj The object to clone.
 * @returns {any} A deep clone of the input object.
 */
function makeClone( obj ) {
  return ( obj instanceof Set )
           ? new Set( Array . from( obj ) )
           : JSON . parse( JSON . stringify( obj ) ) ;
}

/**
 * Reads the next input token and converts it to an integer.
 * @returns {number} The next integer from input.
 */
function nextInt( ) {
  return myconv( next( ) , 1 ) ;
}

/**
 * Reads the next input token and converts it to an array of strings (split by space).
 * @returns {string[]} An array of strings.
 */
function nextStrArray( ) {
  return myconv( next( ) , 2 ) ;
}

/**
 * Reads the next input token and converts it to an array of integers (split by space).
 * @returns {number[]} An array of integers.
 */
function nextIntArray( ) {
  return myconv( next( ) , 4 ) ;
}

/**
 * Reads the next input token and converts it to an array of characters.
 * @returns {string[]} An array of characters.
 */
function nextCharArray( ) {
  return myconv( next( ) , 6 ) ;
}

/**
 * Retrieves the next token from the initialized input object.
 * @returns {string} The next input token.
 */
function next( ) {
  return obj . next( ) ;
}

/**
 * Checks if there are more tokens available in the input.
 * @returns {boolean} True if more input exists, false otherwise.
 */
function hasNext( ) {
  return obj . hasNext( ) ;
}

/**
 * Initializes an input object with methods for sequential access.
 *
 * @param {string[]} input An array of input lines.
 * @returns {object} An object with `list`, `index`, `max`, `hasNext`, and `next` properties.
 */
function init( input ) {
  // The input object structure.
  return {
    list  :  input ,
    index :  0     ,
    max   :  input . length ,

    /**
     * Checks if there are more elements in the input list.
     * @returns {boolean} True if `index` is less than `max`, false otherwise.
     */
    hasNext : function ( ) {
      return ( this . index < this . max ) ;
    } ,

    /**
     * Retrieves the next element from the input list and increments the index.
     * Throws an error if no more input is available.
     * @returns {string} The next input element.
     * @throws {string} 'ArrayIndexOutOfBoundsException ‚There is no more input' if no more input.
     */
    next : function ( ) {
      if ( this . hasNext( ) ) {
        return this . list[ this . index++ ] ;
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
function myout( s ) {
  console . log( s ) ;
}

/**
 * Outputs a debug message to stderr using `util.inspect`.
 * @param {any} s The object to inspect and output.
 */
function myerr( s ) {
  console . error( 'debug:' + require('util') . inspect( s , false , null ) ) ;
}

// param "no" is an indicator for conversion type.
// unknown or outlier : return i.
// 1: parseInt.
// 2: split by space.
// 4: split by space and parseInt (map to Number).
// 6: split by 1 character (into array of chars).
// 7: split by 1 character and parseInt (map to Number).
// 8: join by space.
// 9: join by newline.
// 0: join with no character (concatenate).

/**
 * Converts input `i` based on the specified `no` parameter.
 * Handles various parsing and joining operations.
 *
 * @param {string|string[]} i The input to convert.
 * @param {number} no The conversion type identifier.
 * @returns {any} The converted result.
 */
function myconv( i , no ) {
  try {
    switch ( no ) {
      case 1 :
        return parseInt( i ) ;
      case 2 :
        return i . split( ' ' ) ;
      case 4 :
        return i . split( ' ' ) . map( Number ) ;
      case 6 :
        return i . split( '' ) ;
      case 7 :
        return i . split( '' ) . map( Number ) ;
      case 8 :
        return i . join( ' ' ) ;
      case 9 :
        return i . join( '\n' ) ;
      case 0 :
        return i . join( '' ) ;
      default :
        return i ;
    }
  } catch ( e ) {
    // In case of conversion error, return the original input.
    return i ;
  }
}

// Don't have to see. end ------------------------------------------

/**
 * The main function where the problem's logic is implemented.
 * This function processes input, performs calculations using Union-Find,
 * and outputs the result.
 */
function Main( ) {
  // Read the first line of input which contains N, K, and L.
  var one = nextIntArray( ) ;

  // Extract N (number of nodes), K (number of K-roads), and L (number of L-roads).
  var N = one[ 0 ] ;
  var K = one[ 1 ] ;
  var L = one[ 2 ] ;

  // Initialize two Union-Find data structures, one for K-roads and one for L-roads.
  // Both are initialized with N elements.
  var ufk = unionFind( N ) ;
  var ufl = unionFind( N ) ;

  // Array to store the final output for each node.
  var output = new Array( N ) ;

  // Arrays to store the K-road and L-road connections (though not strictly used after Union-Find).
  var klist = new Array( K ) ;
  var llist = new Array( L ) ;

  // Process K-roads.
  // For each K-road, read the connection, adjust indices, and perform union in ufk.
  for ( var i = 0 ; i < K ; i++ ) {
    var tmp = nextIntArray( ) ; // Read a pair of connected nodes.
    tmp . sort( ) ;               // Sort them to ensure consistent order (though not strictly necessary for Union-Find).
    tmp[ 0 ] -- ;                 // Adjust to 0-based indexing.
    tmp[ 1 ] -- ;                 // Adjust to 0-based indexing.
    klist[ i ] = tmp ;            // Store the road (optional, for debugging/reference).
    ufk . doUnion( tmp[ 0 ] , tmp[ 1 ] ) ; // Union the two nodes in the K-road Union-Find.
  }

  // Process L-roads.
  // Similar to K-roads, but for L-roads and ufl.
  for ( var i = 0 ; i < L ; i++ ) {
    var tmp = nextIntArray( ) ; // Read a pair of connected nodes.
    tmp . sort( ) ;               // Sort them.
    tmp[ 0 ] -- ;                 // Adjust to 0-based indexing.
    tmp[ 1 ] -- ;                 // Adjust to 0-based indexing.
    llist[ i ] = tmp ;            // Store the road.
    ufl . doUnion( tmp[ 0 ] , tmp[ 1 ] ) ; // Union the two nodes in the L-road Union-Find.
  }

  // A map to store the count of nodes that belong to the same connected component
  // in both K-roads and L-roads.
  var map = { } ;

  // Iterate through each node from 0 to N-1.
  for ( var i = 0 ; i < N ; i++ ) {
    // Construct a unique key based on the root of the current node in ufl and ufk.
    // This key represents the combined connected component.
    var rt = ufl . getRootIndex( i ) + ":" + ufk . getRootIndex( i ) ;

    // If this combined component key is not yet in the map, initialize its count to 0.
    if ( map[ rt ] == null ) {
      map[ rt ] = 0 ;
    }

    // Increment the count for this combined component.
    map[ rt ] ++ ;
  }

  // Populate the output array.
  // For each node, find its combined component key and retrieve its count from the map.
  for ( var i = 0 ; i < N ; i++ ) {
    output[ i ] = map[ ufl . getRootIndex( i ) + ":" + ufk . getRootIndex( i ) ] ;
  }

  // Output the results, joining the numbers with spaces.
  myout( myconv( output , 8 ) ) ;
}


/**
 * Implements a Union-Find data structure.
 *
 * @param {number} n The number of elements to manage in the Union-Find structure.
 * @returns {object} An object containing Union-Find methods.
 */
function unionFind( n ) {
  var uf = {
    // The internal list representing the parent of each element.
    // All indices initially point to -1, indicating they are roots of their own set,
    // and the absolute value is the size of the set.
    "list" : new Array( n ) . fill( -1 ) ,

    /**
     * Checks if two elements belong to the same set (have the same root).
     *
     * @param {number} mae The index of the first element.
     * @param {number} ato The index of the second element.
     * @returns {boolean} True if `mae` and `ato` are in the same set, false otherwise.
     */
    "isSame" : function ( mae , ato ) {
      return this . getRootIndex( mae ) == this . getRootIndex( ato ) ;
    } ,

    /**
     * Finds the root of the set containing the given element and performs path compression.
     *
     * @param {number} index The element for which to find the root.
     * @returns {number} The index of the root of the element's set.
     */
    "getRootIndex" : function ( index ) {
      // If the element is a root (value is negative).
      if ( this . list[ index ] < 0 ) {
        return index ;
      } else {
        // Recursively find the root and perform path compression:
        // Set the parent of the current element directly to the root.
        this . list[ index ] = this . getRootIndex( this . list[ index ] ) ;
        return this . list[ index ] ;
      }
    } ,

    /**
     * Unites the sets containing two given elements.
     * Uses union by size/rank heuristic to keep the tree flat.
     *
     * @param {number} mae The index of the first element.
     * @param {number} ato The index of the second element.
     */
    "doUnion" : function ( mae , ato ) {
      var maeRoot = this . getRootIndex( mae ) ; // Find the root of the first element.
      var atoRoot = this . getRootIndex( ato ) ; // Find the root of the second element.

      // Only perform union if they are not already in the same set.
      if ( ! this . isSame( maeRoot , atoRoot ) ) {
        // Attach the smaller tree under the root of the larger tree.
        // The root's value is negative, so a smaller absolute value means a smaller size.
        // Or, in this implementation, if maeRoot is numerically greater (less negative), it's smaller in size.
        if ( maeRoot >= atoRoot ) {
          // maeRoot's tree is smaller or equal in rank/size.
          // Add atoRoot's size to maeRoot's size (both are negative, so sum them).
          this . list[ maeRoot ] += this . list[ atoRoot ] ;
          // Make atoRoot's parent maeRoot.
          this . list[ atoRoot ] = maeRoot ;
        } else {
          // atoRoot's tree is smaller.
          this . list[ atoRoot ] += this . list[ maeRoot ] ;
          this . list[ maeRoot ] = atoRoot ;
        }
      }
    } ,

    /**
     * Gets the size of the set containing the given element.
     * The size is stored as the negative value of the root element.
     *
     * @param {number} index The element whose set size is to be retrieved.
     * @returns {number} The size of the set.
     */
    "getSize" : function ( index ) {
      return - this . list[ this . getRootIndex( index ) ] ;
    }
  } ;
  return uf ;
}