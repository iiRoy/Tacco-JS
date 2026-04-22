var DATA_PARSER = ( function ( ) {
  // Inner factory function to create an input reader instance
  function createInputReader ( inputSource ) {
    return new InputReader( inputSource ) ;
  }

  // Constructor for the input reader object
  function InputReader ( inputSource ) {
    this.lineBuffer = inputSource.trim( ).split( '\n' ) ;
    this.currentLineIndex = 0 ;
  }

  // Method to read a single value from the current line
  InputReader.prototype.readNextValue = function ( asString ) {
    var currentBuffer = this.lineBuffer ;
    var currentIndex = this.currentLineIndex ;
    var extractedValue ;

    // If the current line is still a string, process it
    if ( typeof currentBuffer[ currentIndex ] === 'string' ) {
      currentBuffer[ currentIndex ] = currentBuffer[ currentIndex ].split( ' ' ).reverse( ) ;
    }

    // Extract the last element (from the reversed array)
    extractedValue = currentBuffer[ currentIndex ].pop( ) ;

    // If the current line is exhausted, move to the next line
    if ( !currentBuffer[ currentIndex ].length ) {
      this.currentLineIndex ++ ;
    }

    // Return the value, optionally as a string
    return asString ? extractedValue : Number( extractedValue ) ;
  } ;

  // Method to read all values from the current line
  InputReader.prototype.readLineValues = function ( asString ) {
    var dataElements = this.lineBuffer[ this.currentLineIndex ++ ].split( ' ' ) ;
    return asString ? dataElements : dataElements.map( item => Number( item ) ) ;
  } ;

  // Method to read a matrix of 'count' lines
  InputReader.prototype.readMatrix = function ( count , asString ) {
    var resultCollection = this.lineBuffer
                               .slice( this.currentLineIndex , this.currentLineIndex += count )
                               .map( entry => entry.split( ' ' ) ) ;

    return asString ? resultCollection : resultCollection.map( row => row.map( cell => Number( cell ) ) ) ;
  } ;

  // Method to read 'count' raw lines
  InputReader.prototype.readRawLines = function ( count , asString ) {
    var resultCollection = this.lineBuffer.slice( this.currentLineIndex , this.currentLineIndex += count ) ;
    return asString ? resultCollection : resultCollection.map( entry => Number( entry ) ) ;
  } ;

  return createInputReader ;
} ) ( ) ;

// Initialize the input processor with data from stdin
var inputProcessor = DATA_PARSER( require( 'node:fs' ).readFileSync( '/dev/stdin' , 'utf8' ) ) ;

// Helper function to initialize multi-dimensional arrays
function initializeMultiDimensionalArray ( initialValue , ...dimensions ) {
  var dimensionList = dimensions ;
  var dimensionCount = dimensionList.length ;
  var expressionString = `Array(dimensionList[${--dimensionCount}]).fill(0).map(_ => { return ${initialValue}; })` ;

  while ( --dimensionCount ) {
    expressionString = `Array(dimensionList[${dimensionCount}]).fill(0).map(_ => ${expressionString})` ;
  }

  return eval( expressionString ) ;
}

// Declare global variables for graph dimensions and structure
var numNodes , numEdges , adjacencyList ;

// Execute the main program logic and print the result
console.log( executeProgram( ) ) ;

/**
 * Main function containing the primary logic of the program.
 * Reads graph input, constructs adjacency list, and finds the shortest cycle.
 * @returns {string|number} The length of the shortest cycle path or -1 if no cycle found.
 */
function executeProgram ( ) {
  numNodes = inputProcessor.readNextValue( ) ;
  numEdges = inputProcessor.readNextValue( ) ;

  // Read edge data: numEdges lines, each with two numbers (u, v)
  var edgeData = inputProcessor.readMatrix( numEdges ) ;

  // Initialize adjacency list for numNodes nodes
  adjacencyList = initializeMultiDimensionalArray( "[]" , numNodes ) ;

  // Populate the adjacency list based on edge data
  for ( var edgeIndex = 0 ; edgeIndex < numEdges ; edgeIndex ++ ) {
    adjacencyList[ edgeData[ edgeIndex ][ 0 ] - 1 ].push( edgeData[ edgeIndex ][ 1 ] - 1 ) ;
  }

  // Variable to store the shortest cycle path found
  var shortestCyclePath = new Array( numNodes + 1 ) ; // Initialize with a length greater than any possible cycle

  // Iterate through each node to find the shortest cycle starting from it
  for ( var nodeIndex = 0 ; nodeIndex < numNodes ; nodeIndex ++ ) {
    var currentCycle = findCycle( nodeIndex ) ;
    // Update shortestCyclePath if a shorter cycle is found
    if ( currentCycle && currentCycle.length < shortestCyclePath.length ) {
      shortestCyclePath = currentCycle ;
    }
  }

  // If shortestCyclePath is still its initial large size, no cycle was found
  if ( shortestCyclePath.length === numNodes + 1 ) {
    return -1 ;
  }

  // Output the length of the shortest cycle and the path itself
  console.log( shortestCyclePath.length ) ;
  return shortestCyclePath.join( '\n' ) ;
}

/**
 * Performs a Breadth-First Search (BFS) to find the shortest cycle starting from a given node.
 * This function also tracks parent nodes to reconstruct the path.
 * @param {number} startNode The node from which to start the BFS.
 * @returns {number[]|undefined} An array representing the cycle path (node indices + 1), or undefined if no cycle found from this startNode.
 */
function findCycle ( startNode ) {
  var parentTracker = initializeMultiDimensionalArray( -1 , numNodes ) ; // Stores parent of each node in BFS tree
  var currentLevelQueue = [ startNode ] ; // Queue for nodes to visit in the current BFS level

  while ( currentLevelQueue.length ) {
    var nextLevelQueue = [ ] ; // Queue for nodes in the next BFS level

    while ( currentLevelQueue.length ) {
      var currentNode = currentLevelQueue.pop( ) ; // Get a node from the current level

      // Iterate through all neighbors of the current node
      for ( var neighborNode of adjacencyList[ currentNode ] ) {
        // If a neighbor is the startNode, a cycle is found
        if ( neighborNode === startNode ) {
          var cyclePath = [ neighborNode + 1 ] ; // Start building the cycle path
          neighborNode = currentNode ; // Backtrack from currentNode to startNode

          // Reconstruct the path using parentTracker
          while ( neighborNode !== startNode ) {
            cyclePath.push( neighborNode + 1 ) ;
            neighborNode = parentTracker[ neighborNode ] ;
          }
          return cyclePath ; // Return the found cycle path
        }

        // If the neighbor has already been visited in this BFS, skip it
        if ( parentTracker[ neighborNode ] !== -1 ) {
          continue ;
        }

        // Mark the current node as parent of the neighbor and add to next level queue
        parentTracker[ neighborNode ] = currentNode ;
        nextLevelQueue.push( neighborNode ) ;
      }
    }
    // Move to the next level of the BFS
    currentLevelQueue = nextLevelQueue ;
  }
  // No cycle found from the startNode
  return undefined ;
}