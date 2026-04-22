// This class provides methods to parse input data from a string, line by line.
function InputProcessor (sourceText) {
  // Internal storage for the input text, split into an array of individual lines.
  this._textFragments = sourceText . split ( "\n" ) ;
  // A pointer indicating the current line being processed.
  this._lineCursor = 0 ;
} ;

// Define the public methods available on instances of InputProcessor.
InputProcessor . prototype = {

  // Extracts a single value from the current line.
  // If 'asString' is true, the value is returned as a string; otherwise, it's converted to a number.
  extractValue : function ( asString ) {
    var currentFragments = this._textFragments , // Reference to the array of lines
        cursorPos = this._lineCursor ,          // Current line index
        extractedItem ;                         // Variable to hold the extracted value

    // If the current line hasn't been processed into an array of elements yet, do so.
    // It's split by spaces and then reversed to allow efficient 'pop' operations from the start.
    if ( typeof currentFragments [ cursorPos ] === "string" ) {
      currentFragments [ cursorPos ] = currentFragments [ cursorPos ] . split ( " " ) . reverse ( ) ;
    }

    // Retrieve the next value from the current line.
    extractedItem = currentFragments [ cursorPos ] . pop ( ) ;

    // If the current line is now empty after popping, advance the line cursor to the next line.
    if ( ! currentFragments [ cursorPos ] . length ) {
      this._lineCursor ++ ;
    }

    // Return the extracted item, optionally converted to a number.
    return asString ? extractedItem : + extractedItem ;
  },

  // Reads an entire line of values.
  // If 'asString' is true, returns an array of strings; otherwise, an array of numbers.
  fetchLineValues : function ( asString ) {
    // Get the current line, increment the cursor, and split it into individual elements.
    var lineElements = this._textFragments [ this._lineCursor ++ ] . split ( " " ) ;

    // Return the array of elements, with optional numeric conversion.
    return asString ? lineElements : lineElements . map ( elem => + elem ) ;
  },

  // Reads multiple lines of values.
  // 'lineCount' specifies how many lines to read.
  // 'asString' determines if values are returned as strings or numbers.
  fetchMultiLineValues : function ( lineCount , asString ) {
    var sourceFragments = this._textFragments , // Reference to all input lines
        cursorPos = this._lineCursor ,          // Starting line index
        resultBlock = [ ] ,                     // Array to store the results
        idx = 0 ;                               // Loop counter

    // Populate 'resultBlock' based on the 'asString' flag.
    if ( asString ) { // If values should remain strings
      for ( ; idx < lineCount ; idx ++ ) {
        resultBlock [ idx ] = sourceFragments [ cursorPos + idx ] . split ( " " ) ;
      }
    } else { // If values should be converted to numbers
      for ( ; idx < lineCount ; idx ++ ) {
        resultBlock [ idx ] = sourceFragments [ cursorPos + idx ] . split ( " " ) . map ( elem => + elem ) ;
      }
    }

    // Advance the line cursor by the number of lines processed.
    this._lineCursor += lineCount ;
    return resultBlock ;
  },
} ;

// A global array used for the Disjoint Set Union (DSU) data structure.
// Each index stores the parent of that element.
var parentSet = [ ] ;

// Finds the representative (root) of the set to which 'elementIndex' belongs.
// This function implements path compression for optimized performance.
function findSetRepresentative ( elementIndex ) {
  // If the element is its own parent, it is the representative of its set.
  if ( parentSet [ elementIndex ] === elementIndex ) return elementIndex ;
  // Otherwise, recursively find the representative and compress the path by
  // setting the element's parent directly to the representative.
  return parentSet [ elementIndex ] = findSetRepresentative ( parentSet [ elementIndex ] ) ;
}

// Checks if two elements, 'idxA' and 'idxB', belong to the same disjoint set.
function areConnected ( idxA , idxB ) {
  return findSetRepresentative ( idxA ) === findSetRepresentative ( idxB ) ;
}

// Merges the sets containing 'indexOne' and 'indexTwo'.
// It performs a union operation if they are not already in the same set.
function mergeSets ( indexOne , indexTwo ) {
  // Find the representatives of the sets for both elements.
  indexOne = findSetRepresentative ( indexOne ) ;
  indexTwo = findSetRepresentative ( indexTwo ) ;

  // If they are already in the same set (have the same representative), do nothing.
  if ( indexOne === indexTwo ) return ;

  // Otherwise, merge the two sets by making one representative a child of the other.
  parentSet [ indexOne ] = indexTwo ;
}

// Initialize the input data handler by reading the entire content of stdin.
var dataHandler = new InputProcessor ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

// Execute the main application logic and print its returned value to the console.
console . log ( runApplication ( ) ) ;

// The primary function containing the application's core logic.
function runApplication ( ) {
  // Read the number of nodes (N) and the number of operations/edges (M) from the input.
  var numNodes = dataHandler . extractValue ( ) ,
      numEdges = dataHandler . extractValue ( ) ;

  // Read a line of numbers representing a target permutation or sequence.
  var targetPermutation = dataHandler . fetchLineValues ( ) ;

  // Initialize the DSU structure: each node from 0 to numNodes is initially its own parent.
  for ( var loopVar = 0 ; loopVar <= numNodes ; loopVar ++ ) {
    parentSet [ loopVar ] = loopVar ;
  }

  // Process 'numEdges' union operations.
  // Each operation specifies two nodes to be merged into the same set.
  for ( loopVar = 0 ; loopVar < numEdges ; loopVar ++ ) {
    // Read a pair of node indices for the current edge/connection.
    var edgePair = dataHandler . fetchLineValues ( ) ;
    // Perform the union operation on these two nodes.
    mergeSets ( edgePair [ 0 ] , edgePair [ 1 ] ) ;
  }

  // Initialize a counter for the final result.
  var finalResult = 0 ;
  // Iterate through nodes from 1 to numNodes to check a specific condition.
  for ( loopVar = 1 ; loopVar <= numNodes ; loopVar ++ ) {
    // Check if the value at 'targetPermutation[loopVar - 1]' is in the same set as 'loopVar'.
    // This typically implies checking if a node is connected to its desired position or value.
    if ( areConnected ( targetPermutation [ loopVar - 1 ] , loopVar ) ) {
      finalResult ++ ; // Increment the counter if the condition is met.
    }
  }
  return finalResult ; // Return the total count.
}