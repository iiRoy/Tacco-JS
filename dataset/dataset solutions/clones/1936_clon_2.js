function TokenStream( sourceData ) {
  var instanceRef = this; // Reference to the current object instance.
  instanceRef.currentIndex = 0; // Tracks the position of the next token to read.
  instanceRef.originalText = sourceData; // Stores the raw input string.
  instanceRef.tokenArray = ( function ( textToProcess ) {
    var tokenList = []; // Array to collect processed tokens.
    // Normalize whitespace: replace sequences of newlines, spaces, or tabs with a single space.
    var cleanedText = textToProcess.replace( /[\n \t]+/g, " " );
    // Split the normalized text into individual string parts based on single spaces.
    var splitParts = cleanedText.split( " " );
    // Populate the token list with each part from the split operation.
    for ( var idx = 0, count = splitParts.length; idx < count; idx++ ) {
      tokenList.push( splitParts[idx] );
    }
    return tokenList; // Return the array of tokens.
  }( sourceData ) ); // Immediately invoke this function with the initial source data.

  instanceRef.readNextToken = function() {
    // Fetch the string token at the current reading position.
    var currentSegment = instanceRef.tokenArray[ instanceRef.currentIndex ];
    instanceRef.currentIndex++; // Advance the internal index for subsequent reads.
    // Return the segment if it exists, otherwise return null.
    return ( currentSegment !== null ) ? currentSegment : null;
  };

  instanceRef.readInteger = function() {
    // Get the next token string, intended to be an integer.
    var currentSegment = instanceRef.tokenArray[ instanceRef.currentIndex ];
    instanceRef.currentIndex++; // Move the pointer forward.
    // Convert the segment to an integer (base 10) if not null, else return null.
    return ( currentSegment !== null ) ? parseInt( currentSegment, 10 ) : null;
  };

  instanceRef.readDecimal = function() {
    // Retrieve the next token string, expected to be a floating-point number.
    var currentSegment = instanceRef.tokenArray[ instanceRef.currentIndex ];
    instanceRef.currentIndex++; // Increment the token counter.
    // Parse the string to a float if valid, otherwise return null.
    return ( currentSegment !== null ) ? parseFloat( currentSegment ) : null;
  };
  
  instanceRef.readByteValue = function() {
    // Acquire the next token string.
    var currentSegment = instanceRef.tokenArray[ instanceRef.currentIndex ];
    instanceRef.currentIndex++; // Update the read position.
    // If the segment is not null, attempt to create an Int8Array from it.
    // Note: Creating Int8Array from a string (e.g., "123") results in an array
    // where each character's numeric value is stored (e.g., [1, 2, 3]).
    return ( currentSegment !== null ) ? new Int8Array( currentSegment ) : null;
  };
}

function ExecuteProgram( dataStream ) {

  var nodeCount = dataStream.readInteger(); // Read the total number of nodes from the input.
  var finalResults = []; // Array to store the computed results for each node.
  
  // Map node IDs (1-based) to their associated integer values.
  var nodeValuesMap = {}; 
  for ( var loopIndex = 0; loopIndex < nodeCount; loopIndex++ ) {
    nodeValuesMap[ loopIndex + 1 ] = dataStream.readInteger();
  }
  
  // Adjacency list representation of the graph (tree).
  var adjacencyList = {}; 
  for ( var loopIndex = 0; loopIndex < nodeCount - 1; loopIndex++ ) {
    var nodeA = dataStream.readInteger(); // Read the first connected node.
    var nodeB = dataStream.readInteger(); // Read the second connected node.
    // Establish bidirectional connections in the adjacency list.
    if ( !adjacencyList[ nodeA ] ) adjacencyList[ nodeA ] = [ nodeB ];
    else adjacencyList[ nodeA ].push( nodeB );
    if ( !adjacencyList[ nodeB ] ) adjacencyList[ nodeB ] = [ nodeA ];
    else adjacencyList[ nodeB ].push( nodeA );
  }
  
  // Stores lists of values encountered on paths from the root to each node.
  var pathValueLists = {};
  // Recursive function for depth-first traversal of the graph.
  var traverseGraph = function ( currentNodeId, parentId, currentPathValues ) {
    // Create a new array for the current path to avoid modifying shared references.
    var extendedPath = currentPathValues.slice(); 
    // Add the value of the current node to the path.
    extendedPath.push( nodeValuesMap[currentNodeId] );
    // Store the finalized path for this node ID.
    pathValueLists[currentNodeId] = extendedPath;
    
    // Get all neighboring nodes for the current node.
    var neighbors = adjacencyList[currentNodeId];
    if ( neighbors ) { // Check if the current node has any neighbors.
      for ( var neighborIndex = 0; neighborIndex < neighbors.length; neighborIndex++ ) {
        var neighborId = neighbors[neighborIndex];
        // Only proceed if the neighbor is not the parent (to avoid going back up the tree).
        if ( parentId !== neighborId ) {
          traverseGraph( neighborId, currentNodeId, extendedPath ); // Recursively call for the neighbor.
        }
      }
    }
  };
  // Initiate the graph traversal starting from node 1, with no initial parent (-1) and an empty path.
  traverseGraph( 1, -1, [] );
  
  // For each node, calculate the length of the longest increasing subsequence (LIS) within its path values.
  for ( var nodeId = 1; nodeId <= nodeCount; nodeId++ ) {
    
    var currentPath = pathValueLists[nodeId]; // Retrieve the path values for the current node.
    var increasingSubsequence = []; // This array will hold the LIS.
    // Iterate through each value in the node's path.
    for ( var pathValIndex = 0; pathValIndex < currentPath.length; pathValIndex++ ) {
      var currentValue = currentPath[pathValIndex];
      // If the LIS is empty, add the first value.
      if ( increasingSubsequence.length === 0 ) {
        increasingSubsequence.push( currentValue );
      }
      // If the current value is greater than the last element of the LIS, extend the LIS.
      else if ( currentValue > increasingSubsequence[ increasingSubsequence.length - 1 ] ) {
        increasingSubsequence.push( currentValue );
      }
      // If the current value is less than or equal to the first element of the LIS, replace the first element.
      else if ( currentValue <= increasingSubsequence[0] ) {
        increasingSubsequence[0] = currentValue;
      }
      // If the current value falls somewhere in the middle, find the appropriate element to replace.
      else {
        // Find the smallest element in LIS that is greater than or equal to currentValue and replace it.
        for ( var subSeqIndex = 1; subSeqIndex < increasingSubsequence.length; subSeqIndex++ ) {
          if ( increasingSubsequence[ subSeqIndex - 1 ] < currentValue && currentValue <= increasingSubsequence[ subSeqIndex ] ) {
            increasingSubsequence[ subSeqIndex ] = currentValue;
            break; // Found the spot, exit inner loop.
          }
        }
      }
    }
    finalResults.push( increasingSubsequence.length ); // Store the length of the LIS for this node.
  }
  
  // Print all calculated LIS lengths, each on a new line.
  console.info( finalResults.join("\n") );
}

// Entry point: Create a token stream from standard input and execute the main program logic.
ExecuteProgram( new TokenStream( require("fs").readFileSync("/dev/stdin", "utf8") ) );
// Example: ExecuteProgram( new TokenStream( "33" ) ); // A commented-out line for local testing.

// These are illustrative comments, not part of the core logic:
// var stringVal = dataStream.readNextToken(); // How to retrieve a simple string.
// var integerVal = dataStream.readInteger(); // How to get an integer.
// var decimalVal = dataStream.readDecimal(); // How to obtain a floating-point number.
// var byteArr = dataStream.readByteValue(); // How to get an Int8Array from a string.
// for ( var delayIterator = 0; delayIterator < 1000000000; delayIterator++ ) var tempVar = "delay"; // A placeholder loop to simulate work.
// console.debug( pathValueLists ); // For debugging: print the collected path lists and then terminate.