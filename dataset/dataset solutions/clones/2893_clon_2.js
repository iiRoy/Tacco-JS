var INPUT_PARSER_FACTORY = (
  function( ) {
  // Internal factory function to create a new processor
  function createStreamProcessor ( textualInput ) {
    return new StreamBuffer( textualInput ) ;
  }
  // Constructor for the stream buffer object
  function StreamBuffer ( textualInput ) {
    // Store lines after trimming and splitting
    this.bufferedTextLines = textualInput.trim().split("\n");
    // Initialize current reading position
    this.currentReadPosition = 0;
  }
  // Prototype method to extract a single numeric value
  StreamBuffer.prototype.extractNextNumber = function ( returnAsString ) {
    var lineContent = this.bufferedTextLines,
        linePosition = this.currentReadPosition,
        poppedToken;
    // If the current line hasn't been processed into tokens, do so now
    if ( typeof lineContent[linePosition] === "string" ) {
      lineContent[linePosition] = lineContent[linePosition].split(" ").reverse();
    }
    poppedToken = lineContent[linePosition].pop();
    // If the current line is exhausted, advance to the next line
    if ( !lineContent[linePosition].length ) {
      this.currentReadPosition++;
    }
    // Return token as string or number based on flag
    return returnAsString ? poppedToken : +poppedToken;
  };
  // Prototype method to read a full line of numbers
  StreamBuffer.prototype.readNumericLine = function ( returnAsString ) {
    // Fetch and split the current line, then advance the line pointer
    var lineTokens = this.bufferedTextLines[this.currentReadPosition++].split(" ");
    // Return tokens as strings or numbers based on flag
    return returnAsString ? lineTokens : lineTokens.map( tokenItem => +tokenItem );
  };
  // Prototype method to read a block of lines as a matrix of numbers
  StreamBuffer.prototype.readMatrixData = function ( numRowsToRead, returnAsString ) {
    // Extract a slice of lines and split each into tokens
    var matrixResult = this.bufferedTextLines.slice(this.currentReadPosition, this.currentReadPosition += numRowsToRead).map( line => line.split(" ") );
    // Return matrix as strings or numbers based on flag
    return returnAsString ? matrixResult : matrixResult.map( row => row.map( tokenItem => +tokenItem ) );
  };
  // Prototype method to read a block of raw lines
  StreamBuffer.prototype.readRawBlock = function ( numRowsToRead, returnAsString ) {
    // Extract a slice of lines
    var rawLines = this.bufferedTextLines.slice(this.currentReadPosition, this.currentReadPosition += numRowsToRead);
    // Return lines as strings or numbers (if applicable)
    return returnAsString ? rawLines : rawLines.map( tokenItem => +tokenItem );
  };
  return createStreamProcessor; // The public interface for creating a processor
})();

// Instantiate the input reader with content from standard input
var dataInputInstance = INPUT_PARSER_FACTORY(require("fs").readFileSync("/dev/stdin","utf8"));

// Function to create N-dimensional arrays
function buildMultiArray( initializerCode ) {
  var dimensions = arguments,
      dimCount = dimensions.length,
      arrayExpression = "Array(dimensions[" + --dimCount + "]).fill(0).map( _ => {return " + initializerCode + ";})";
  // Construct the nested array creation string
  while ( --dimCount ) {
    arrayExpression = "Array(dimensions[" + dimCount + "]).fill(0).map( _ => " + arrayExpression + ")";
  }
  // Evaluate the string to create the array
  return eval( arrayExpression );
}

// Execute the main algorithm and print its output
console.log(solveProblem());

// Main algorithm function
function solveProblem() {
  // Read the total number of vertices
  var vertexCount = dataInputInstance.extractNextNumber();
  // Initialize adjacency lists for each vertex, using Sets
  var adjLists = buildMultiArray("new Set()", vertexCount);
  // Keep track of vertices that are still active in the graph
  var remainingVertices = new Set();
  // Add the initial vertex (0) to the active set
  remainingVertices.add(0);

  // Loop to read all edges and build the graph
  for ( var vertexId = 1; vertexId < vertexCount; vertexId++ ) {
    // Read a pair of connected vertices
    var connectionPair = dataInputInstance.readNumericLine(),
        firstVertex = connectionPair[0] - 1,
        secondVertex = connectionPair[1] - 1;
    // Add bidirectional connections to adjacency lists
    adjLists[firstVertex].add(secondVertex);
    adjLists[secondVertex].add(firstVertex);
    // Add the current vertex to the set of remaining vertices
    remainingVertices.add(vertexId);
  }

  // Read the costs/values for each vertex and sort them
  var sortedValues = dataInputInstance.readNumericLine().sort((valA, valB) => valA - valB);

  // Initialize variables for total sum and final assignments
  var valueIndex = 0; // Pointer for the sorted values array
  var totalSumOfValues = 0,
      finalAssignment = Array(vertexCount); // Array to store assigned values

  // Main loop: continues until all vertices have been processed
  while ( valueIndex < vertexCount ) {
    // List to store vertices that will be removed in this iteration
    var verticesToProcess = [];
    // Iterate through all currently active vertices
    for ( var vertexId of remainingVertices ) {
      // If a vertex has more than one neighbor, it's not a leaf yet; skip it
      if ( adjLists[vertexId].size > 1 ) continue;
      // This vertex is a leaf (or isolated), add it to the removal list
      verticesToProcess.push(vertexId);
      // Assign the next smallest cost/value to this vertex
      finalAssignment[vertexId] = sortedValues[valueIndex++];
      // Add its assigned value to the running total sum
      totalSumOfValues += finalAssignment[vertexId];
    }
    // Process the vertices identified for removal
    for ( vertexId of verticesToProcess ) {
      // For each neighbor of the vertex being removed
      for ( var connectedVertex of adjLists[vertexId] ) {
        // Remove the current vertex from its neighbor's adjacency list
        adjLists[connectedVertex].delete(vertexId);
      }
      // Remove the current vertex from the set of active vertices
      remainingVertices.delete(vertexId);
    }
  }

  // The problem's specific result: total sum minus the largest assigned value
  console.log(totalSumOfValues - sortedValues[vertexCount - 1]);
  // Return the final assignments as a space-separated string
  return finalAssignment.join(" ");
}