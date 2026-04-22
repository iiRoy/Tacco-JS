/* Entry point for the program's primary execution flow. */
function executeProgram() {
  const nodeCount = obtainValue();
  const relationCount = obtainValue();

  // Collection to store direct, unconditional graph edges.
  const directRelations = [];
  // Collection to store pairs of alternative graph edges, one of which must be chosen.
  const conditionalRelations = [];

  // Process each incoming line representing a relation.
  iterate(relationCount, function() {
    const expressionString = obtainValue('text');

    // Parse the input string into numerical components.
    const parsedComponents = expressionString.split(/<=|>=|\*|\+|-/);
    parsedComponents[0] = +parsedComponents[0] - 1; // Convert to number and adjust index.
    parsedComponents[1] = +parsedComponents[1] - 1; // Convert to number and adjust index.
    parsedComponents[2] = +parsedComponents[2];     // Convert to number.

    let comparisonCategory;
    // Determine the type of comparison operator used.
    if (expressionString.includes('*')) {
      comparisonCategory = 2; // Represents the multiplication operator.
    } else {
      comparisonCategory = +(expressionString.includes('<=') === false); // 0 for '<=', 1 for '>='
    }

    // Determine the sign of the arithmetic operator.
    const operatorSign = +(expressionString.includes('+') === false); // 0 for '+', 1 for '-'

    // Apply specific logic based on the identified comparison and operator types.
    if (comparisonCategory === 0) { // Corresponds to '<='
      if (operatorSign === 0) { // Corresponds to '+'
        directRelations.push([parsedComponents[1], parsedComponents[0], -parsedComponents[2]]);
      } else { // Corresponds to '-'
        directRelations.push([parsedComponents[1], parsedComponents[0], 0]);
        directRelations.push([parsedComponents[0], parsedComponents[1], parsedComponents[2]]);
      }
    } else if (comparisonCategory === 1) { // Corresponds to '>='
      if (operatorSign === 0) { // Corresponds to '+'
        directRelations.push([parsedComponents[0], parsedComponents[1], -parsedComponents[2]]);
      } else { // Corresponds to '-'
        directRelations.push([parsedComponents[1], parsedComponents[0], parsedComponents[2]]);
        directRelations.push([parsedComponents[0], parsedComponents[1], 0]);
      }
    } else { // Corresponds to '*'
      if (operatorSign === 0) { // Corresponds to '+'
        conditionalRelations.push([[parsedComponents[0], parsedComponents[1], -parsedComponents[2]], [parsedComponents[1], parsedComponents[0], -parsedComponents[2]]]);
      } else { // Corresponds to '-'
        directRelations.push([parsedComponents[1], parsedComponents[0], parsedComponents[2]]);
        directRelations.push([parsedComponents[0], parsedComponents[1], parsedComponents[2]]);
      }
    }
  });

  // Add a self-loop constraint for each node to ensure non-negativity.
  iterate(nodeCount, function(nodeIdx) {
    directRelations.push([nodeIdx, 0, 0]);
  });

  let optimalValue = Number.NEGATIVE_INFINITY; // Initialize the best result to the smallest possible number.

  // Iterate through all possible combinations for the conditional relations.
  // Each bit in 'choicePattern' selects one alternative from a conditional pair.
  iterate(1 << conditionalRelations.length, function(choicePattern) {
    // Create a new set of active constraints for the current combination.
    const activeConstraints = directRelations.slice(); // Shallow copy of direct relations.

    // Add the chosen alternative from each conditional relation.
    iterate(conditionalRelations.length, function(choiceIdx) {
      activeConstraints.push(conditionalRelations[choiceIdx][(choicePattern >> choiceIdx) & 1]);
    });

    // Initialize distances for a shortest path algorithm (Bellman-Ford-like).
    const pathWeights = new Array(nodeCount).fill(Number.POSITIVE_INFINITY);
    pathWeights[0] = 0; // Distance from source (node 0) to itself is zero.

    // Relax all edges 'nodeCount' times to find shortest paths.
    iterate(nodeCount, function() {
      iterate(activeConstraints.length, function(edgeIdx) {
        const currentEdge = activeConstraints[edgeIdx];
        const sourceNode = currentEdge[0];
        const targetNode = currentEdge[1];
        const edgeWeight = currentEdge[2];
        pathWeights[targetNode] = Math.min(pathWeights[sourceNode] + edgeWeight, pathWeights[targetNode]);
      });
    });

    // Check if the source node (node 0) can still reach itself with 0 cost,
    // indicating no negative cycles affecting it.
    if (pathWeights[0] === 0) {
      optimalValue = Math.max(optimalValue, Math.max(...pathWeights)); // Update the maximum distance found.
    }
  });

  // Output the final computed result.
  if (optimalValue === Number.POSITIVE_INFINITY) {
    outputResult('inf');
  } else if (optimalValue === Number.NEGATIVE_INFINITY) {
    outputResult(-1);
  } else {
    outputResult(optimalValue);
  }
}
 
/* Helper function for controlled iteration. */
function iterate(startBoundary, endBoundary, actionCallback) {
  if (actionCallback === undefined) { // If only two arguments are provided.
    actionCallback = endBoundary;
    endBoundary = startBoundary;
    startBoundary = 0;
  }
  for (let loopCounter = startBoundary; loopCounter < endBoundary; ++loopCounter) {
    actionCallback(loopCounter);
  }
}
 
process.stdin.resume();
process.stdin.setEncoding('utf8');
 
/* Stores the entire raw input as a string. */
let rawInputData = '';
/* Index to keep track of the current position in the parsed input array. */
let dataPointer = 0;
 
/* Reads the next token from the processed input array. */
function obtainValue(tokenType) {
  if (tokenType === 'text') {
    return rawInputData[dataPointer++];
  } else {
    return +rawInputData[dataPointer++]; // Convert to a numerical value.
  }
}
 
/* Outputs a given value to the console. */
function outputResult(outputValue) {
  console.log(outputValue);
}
 
/* Event listener for incoming data chunks from standard input. */
process.stdin.on('data', function(dataChunk) {
  rawInputData += dataChunk;
});

/* Event listener for the end of standard input. */
process.stdin.on('end', function() {
  rawInputData = rawInputData.split(/\s+/); // Split the accumulated input by whitespace.
  executeProgram(); // Initiate the main program execution.
});