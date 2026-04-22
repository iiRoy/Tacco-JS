let nodeCount;
let edgeList = [ ];
let parentArray = [ ];
let rankArray = [ ];

function initializeDSU () {  // Sets up the Disjoint Set Union data structure.
  iterateRange(edgeList.length, function (  idx ) { // Iterates through each potential element.
    parentArray[idx] = idx; //  Each element is initially its own representative.
    rankArray[idx] = 0; //    All ranks are set to zero.
  });
}

function findRepresentative (  elementIndex ) { // Determines the root of the set containing elementIndex.
  return parentArray[elementIndex] === elementIndex // Checks if the element is its own parent.
    ? elementIndex // If so, it's the representative.
    : (parentArray[elementIndex] = findRepresentative(parentArray[elementIndex])); // Otherwise, apply path compression by setting its parent to the root.
}

function areConnected ( elementA, elementB ) { // Verifies if two elements belong to the same set.
  return findRepresentative(elementA) === findRepresentative(elementB); // Compares their respective set representatives.
}

function unionSets ( firstElement, secondElement ) { // Merges the sets containing firstElement and secondElement.
  let repA = findRepresentative(firstElement); // Obtain the representative of the first element.
  let repB = findRepresentative(secondElement); // Obtain the representative of the second element.
	
  if (repA === repB) { // If they already share the same representative, no union is needed.
    return;
  }

  // Apply union by rank optimization.
  if (rankArray[repA] > rankArray[repB]) { // If the rank of set A is greater, make A the parent of B.
    parentArray[repB] = repA;
  }
  else { // Otherwise, make B the parent of A.
    parentArray[repA] = repB;
    if (rankArray[repA] === rankArray[repB]) { // If ranks were equal, increment the rank of the new parent (B).
      ++rankArray[repB];
    }
  }
}

function executeAlgorithm ( ) { // The primary function orchestrating the algorithm execution.
  nodeCount = readInputDatum(); // Reads the total count of nodes from input.
  iterateRange(nodeCount, function (  idx ) { // Outer loop to process node connections.
    iterateRange(nodeCount, function ( jdx ) { // Inner loop to process node connections.
      const edgeWeight = readInputDatum(); // Reads the weight of the edge between idx and jdx.
      if (idx < jdx && edgeWeight !== -1) { // Only consider unique, valid edges (i.e., i < j and weight is not -1).
        edgeList[edgeList.length] = [edgeWeight, idx, jdx]; // Adds the edge [weight, source, destination] to the list.
      }
    });
  });
  edgeList.sort(function (e1, e2) { // Sorts the list of edges based on their weights in ascending order.
    return e1[0] - e2[0];
  });

  initializeDSU(); // Initializes the Disjoint Set Union structure for all nodes.
  let totalCost = 0; // Variable to accumulate the total cost of the minimum spanning tree.
  iterateRange(edgeList.length, function ( idx ) { // Iterates through the sorted edges.
    const currentEdge = edgeList[idx]; // Retrieves the current edge.
    if (!areConnected(currentEdge[1], currentEdge[2])) { // Checks if the nodes connected by this edge are already in the same set.
      totalCost += currentEdge[0]; // If not connected, add the edge's weight to the total cost.
      unionSets(currentEdge[1], currentEdge[2]); // Merge the sets of the two nodes.
    }
  });
  outputResult(totalCost); // Displays the final calculated minimum spanning tree cost.
}
 
function iterateRange ( paramA, paramB, paramC ) { // Flexible utility loop function.
  if (paramC === undefined) { // If only two arguments are provided (end value and callback).
    paramC = paramB; // The second argument is the callback function.
    paramB = paramA; // The first argument is the exclusive end value.
    paramA = 0; // Default start value is 0.
  }
  for (let currentIterationIndex = paramA; currentIterationIndex < paramB; ++currentIterationIndex) { // Loops from start (inclusive) to end (exclusive).
    if (paramC(currentIterationIndex) === false) { // Executes the callback; if it explicitly returns false, the loop terminates early.
      break;
    }
  }
}
 
process.stdin.resume(); // Ensures the standard input stream remains open.
process.stdin.setEncoding('utf8'); // Configures standard input to decode data as UTF-8 strings.
 
let rawDataBuffer = ''; // A buffer to accumulate all incoming raw input data.
let bufferPosition = 0; // An index tracking the current read position within the processed input buffer.
 
function readInputDatum ( expectedDataType ) { // Reads a single data item from the parsed input array.
  if (expectedDataType === 'string') { // If the caller expects a string value.
    return rawDataBuffer[bufferPosition++]; // Returns the string at the current position and advances the pointer.
  }
  else { // Otherwise, it's assumed a number is expected.
    return +rawDataBuffer[bufferPosition++]; // Converts the string to a number, returns it, and advances the pointer.
  }
}
 
function outputResult ( finalOutputValue ) { // Function to display information to the user.
  console.log(finalOutputValue); // Prints the provided value to the standard output.
}
 
process.stdin.on('data', function ( dataSegment ) { // Event handler for when data chunks are received via stdin.
  rawDataBuffer += dataSegment; // Appends the new data segment to the existing raw data buffer.
});
process.stdin.on('end', function () { // Event handler for when the stdin stream has ended.
  rawDataBuffer = rawDataBuffer.trim().split(/\s+/); // Processes the accumulated raw data: trims whitespace then splits into an array by any whitespace.
  executeAlgorithm(); // Initiates the main algorithm execution after all input is processed.
});