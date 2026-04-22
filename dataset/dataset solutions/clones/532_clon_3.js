function executeMainProgram() {
  // Initialize graph parameters and data structures
  let numberOfVertices = obtainNumericalInput();
  let numberOfConstraints = obtainNumericalInput();

  // Standard edges for Bellman-Ford algorithm
  const graphEdges = [];
  // Special constraints that can be one of two forms
  const bifurcatedConstraints = [];

  // Process each incoming constraint string
  iterateOverRange(0, numberOfConstraints, (constraintIndex) => {
    const constraintExpression = obtainStringInput();

    // Regex to split the expression by operators
    const operatorRegex = /<=|>=|\*|\+|-/;
    const expressionParts = constraintExpression.split(operatorRegex);

    // Ensure we have enough parts for a valid constraint
    if (expressionParts.length < 3) {
      // Potentially log an error or skip invalid constraint
      // For this problem, we assume valid input format
      return;
    }

    // Convert string parts to numbers and adjust for 0-indexed nodes
    const firstNodeIdentifier = Number.parseInt(expressionParts[0], 10) - 1;
    const secondNodeIdentifier = Number.parseInt(expressionParts[1], 10) - 1;
    const edgeWeightValue = Number.parseInt(expressionParts[2], 10);

    // Determine the primary operator type
    let primaryOperatorCategory;
    if (constraintExpression.includes('*')) {
      primaryOperatorCategory = 2; // Represents '*' operator
    } else if (constraintExpression.includes('>=')) {
      primaryOperatorCategory = 0; // Represents '>=' operator
    } else if (constraintExpression.includes('<=')) {
      primaryOperatorCategory = 1; // Represents '<=' operator
    } else {
      // Default or error case, assuming valid operators based on problem context
      primaryOperatorCategory = -1; // Should not happen with given operators
    }

    // Determine the secondary operator (sign convention)
    const isSubtractionOperation = constraintExpression.includes('-');
    const isAdditionOperation = constraintExpression.includes('+');
    let signConventionFlag; // 0 for subtraction/negative, 1 for addition/positive
    if (isSubtractionOperation) {
      signConventionFlag = 0;
    } else if (isAdditionOperation) {
      signConventionFlag = 1;
    } else {
      // If neither + nor - is explicitly found, it usually implies positive or a different type
      // Based on original logic, it checks for '+' and if not found, it implies positive.
      signConventionFlag = constraintExpression.includes('+') ? 0 : 1;
    }


    // Based on operator categories, add edges to either graphEdges or bifurcatedConstraints
    switch (primaryOperatorCategory) {
      case 0: // Original: u == 0 (>= operator)
        if (signConventionFlag === 0) { // Original: v == 0 (contains '-') => X - Y >= Z -> Y <= X - Z -> (Y, X, -Z)
          graphEdges.push([secondNodeIdentifier, firstNodeIdentifier, -edgeWeightValue]);
        } else { // Original: v != 0 (contains '+') => X + Y >= Z -> Y >= Z - X -> (X, Y, -Z) AND X >= Z - Y -> (Y, X, -Z)
          // Simplified from original: x + y >= z
          // y >= z - x  =>  (x, y, -z)  -- this was not in original
          // x >= z - y  =>  (y, x, -z)  -- this was in original as (y, x, 0) and (x, y, z)
          // The original logic for u=0, v=1: e[e.length] = [p[1], p[0], 0]; e[e.length] = [p[0], p[1], p[2]];
          // This implies: y >= x + 0 (y, x, 0) and x >= y - z (x, y, z)
          // Let's stick to the original behavior for cloning purposes but make it explicit.
          graphEdges.push([secondNodeIdentifier, firstNodeIdentifier, 0]); // Represents y - x >= 0 => y >= x
          graphEdges.push([firstNodeIdentifier, secondNodeIdentifier, edgeWeightValue]); // Represents x - y >= -z => x + z >= y
        }
        break;
      case 1: // Original: u == 1 (<= operator)
        if (signConventionFlag === 0) { // Original: v == 0 (contains '-') => X - Y <= Z -> X <= Y + Z -> (Y, X, Z)
          graphEdges.push([firstNodeIdentifier, secondNodeIdentifier, edgeWeightValue]); // (X, Y, Z) implies Y - X >= -Z, so Y >= X - Z
          // The original was [p[0], p[1], -p[2]], which implies X - Y <= -Z, or X <= Y - Z.
          // This is a subtle difference. Let's re-evaluate the original's intent:
          // X - Y <= Z  =>  X <= Y + Z  =>  add edge (Y, X, Z)
          // Original: e[e.length] = [p[0], p[1], -p[2]];
          // This means X <= Y - Z or Y - X >= Z.
          graphEdges.push([firstNodeIdentifier, secondNodeIdentifier, -edgeWeightValue]); // x <= y - z implies y - x >= z
        } else { // Original: v != 0 (contains '+') => X + Y <= Z -> X <= Z - Y -> (Y, X, Z) AND Y <= Z - X -> (X, Y, Z)
          // Original logic for u=1, v=1: e[e.length] = [p[1], p[0], p[2]]; e[e.length] = [p[0], p[1], 0];
          // This implies: x + y <= z
          // y <= z - x => (x, y, z)
          // x <= z - y => (y, x, z)
          graphEdges.push([secondNodeIdentifier, firstNodeIdentifier, edgeWeightValue]); // y <= x + z implies x - y >= -z
          graphEdges.push([firstNodeIdentifier, secondNodeIdentifier, 0]); // x <= y + 0 implies y - x >= 0
        }
        break;
      case 2: // Original: u == 2 (* operator)
        if (signConventionFlag === 0) { // Original: v == 0 (contains '-') => X - Y * Z -> X - Y = -Z or X - Y = Z
          // This case implies an equality, X - Y = Z or Y - X = Z
          // So, X <= Y + Z and Y <= X + Z
          // Edge 1: (Y, X, Z) for X <= Y + Z
          // Edge 2: (X, Y, Z) for Y <= X + Z
          // Original: f[f.length] = [[p[0], p[1], -p[2]], [p[1], p[0], -p[2]]];
          // This means X - Y = -Z or Y - X = -Z
          // x - y = -z => x <= y - z and y <= x + z
          // y - x = -z => y <= x - z and x <= y + z
          // So the two options are:
          // 1. (x, y, -z) and (y, x, z)
          // 2. (y, x, -z) and (x, y, z)
          // The original code uses [p[0], p[1], -p[2]] and [p[1], p[0], -p[2]]
          // Let's maintain this structure for the clone.
          const optionOne = [firstNodeIdentifier, secondNodeIdentifier, -edgeWeightValue];
          const optionTwo = [secondNodeIdentifier, firstNodeIdentifier, -edgeWeightValue];
          bifurcatedConstraints.push([optionOne, optionTwo]);
        } else { // Original: v != 0 (contains '+') => X + Y * Z -> X + Y = Z
          // This implies X <= Z - Y and Y <= Z - X
          // Edge 1: (Y, X, Z) for X <= Y + Z
          // Edge 2: (X, Y, Z) for Y <= X + Z
          // Original: e[e.length] = [p[1], p[0], p[2]]; e[e.length] = [p[0], p[1], p[2]];
          // This means Y <= X + Z and X <= Y + Z
          graphEdges.push([secondNodeIdentifier, firstNodeIdentifier, edgeWeightValue]);
          graphEdges.push([firstNodeIdentifier, secondNodeIdentifier, edgeWeightValue]);
        }
        break;
      default:
        // Handle unexpected primary operator category, if necessary
        console.warn(`Unknown primary operator category: ${primaryOperatorCategory} for expression: ${constraintExpression}`);
        break;
    }
  });

  // Add implicit edges representing non-negative distances from a source (node 0)
  // This ensures all nodes are reachable from the source with non-negative path weights
  iterateOverRange(0, numberOfVertices, (vertexIndex) => {
    graphEdges.push([vertexIndex, 0, 0]); // Edge from any node 'i' to source '0' with weight 0
  });

  // Initialize the best result found so far
  let maximumAchievableValue = Number.NEGATIVE_INFINITY;

  // Iterate through all possible combinations of bifurcated constraints
  // (1 << N) is equivalent to Math.pow(2, N) for integer N
  const numBifurcatedConstraints = bifurcatedConstraints.length;
  const totalCombinations = 1 << numBifurcatedConstraints;

  iterateOverRange(0, totalCombinations, (combinationMask) => {
    // Create a temporary graph for the current combination
    const currentIterationGraph = Array.from(graphEdges); // Clone the standard edges

    // Add selected conditional edges based on the current combination mask
    iterateOverRange(0, numBifurcatedConstraints, (constraintIdx) => {
      // (combinationMask >> constraintIdx) & 1 extracts the bit at position constraintIdx
      const selectedOption = (combinationMask >> constraintIdx) & 1;
      currentIterationGraph.push(bifurcatedConstraints[constraintIdx][selectedOption]);
    });

    // Initialize distances for Bellman-Ford algorithm
    const distancesFromSource = new Array(numberOfVertices).fill(Number.POSITIVE_INFINITY);
    distancesFromSource[0] = 0; // Distance to source node (0) is 0

    // Perform Bellman-Ford relaxation 'numberOfVertices' times
    // This detects negative cycles or computes shortest paths
    for (let iteration = 0; iteration < numberOfVertices; ++iteration) {
      let relaxedInThisIteration = false; // Optimization: stop if no relaxation occurs
      for (const currentEdge of currentIterationGraph) {
        const [sourceNode, destinationNode, weight] = currentEdge;

        // Skip if sourceNode is unreachable or distance is still infinity
        if (distancesFromSource[sourceNode] === Number.POSITIVE_INFINITY) {
          continue;
        }

        // Relax the edge: if a shorter path to destinationNode is found
        const potentialNewDistance = distancesFromSource[sourceNode] + weight;
        if (potentialNewDistance < distancesFromSource[destinationNode]) {
          distancesFromSource[destinationNode] = potentialNewDistance;
          relaxedInThisIteration = true;
        }
      }
      // If no edges were relaxed in an iteration, paths are stable
      if (!relaxedInThisIteration && iteration > 0) {
        break;
      }
    }

    // Check for negative cycles (one more iteration would relax an edge)
    let hasNegativeCycle = false;
    for (const currentEdge of currentIterationGraph) {
      const [sourceNode, destinationNode, weight] = currentEdge;
      if (distancesFromSource[sourceNode] !== Number.POSITIVE_INFINITY &&
          distancesFromSource[sourceNode] + weight < distancesFromSource[destinationNode]) {
        hasNegativeCycle = true;
        break;
      }
    }

    // If there's a negative cycle, this combination is invalid or leads to infinite solutions
    if (hasNegativeCycle) {
      // In this problem context, a negative cycle involving node 0 means d[0] can become < 0,
      // but the check is d[0] == 0. If a cycle makes d[0] < 0, it won't pass the check.
      // If d[0] remains 0, it means no negative cycle affects the source.
      // The original code doesn't explicitly check for negative cycles,
      // it relies on d[0] == 0 after N relaxations.
      // We will keep the original check for d[0] == 0.
    }


    // If the distance to source node 0 is still 0 (no negative cycle affecting it)
    if (distancesFromSource[0] === 0) {
      // Find the maximum distance among all nodes.
      // Filter out non-finite values if any, though Bellman-Ford should produce finite or Infinity.
      const validDistances = distancesFromSource.filter(Number.isFinite);
      if (validDistances.length > 0) {
        const currentMaxDistance = Math.max(...validDistances);
        maximumAchievableValue = Math.max(maximumAchievableValue, currentMaxDistance);
      }
    }
  });

  // Output the final result based on the maximum distance found
  if (maximumAchievableValue === Number.POSITIVE_INFINITY) {
    emitResult('inf');
  } else if (maximumAchievableValue === Number.NEGATIVE_INFINITY) {
    emitResult(-1); // Indicates no valid path or solution found
  } else {
    emitResult(maximumAchievableValue);
  }
}

/**
 * A flexible utility function for iterating over a range.
 * Can be used as `iterateOverRange(end, callback)` or `iterateOverRange(start, end, callback)`.
 * @param {number} arg1 - Start index or end index.
 * @param {number|function} arg2 - End index or callback function.
 * @param {function} [arg3] - Optional callback function.
 */
function iterateOverRange(arg1, arg2, arg3) {
  let startIndex = 0;
  let endIndex;
  let iterationCallback;

  if (arg3 === undefined) {
    endIndex = arg1;
    iterationCallback = arg2;
  } else {
    startIndex = arg1;
    endIndex = arg2;
    iterationCallback = arg3;
  }

  for (let counter = startIndex; counter < endIndex; ++counter) {
    iterationCallback(counter);
  }
}

// --- Input/Output Handling for Node.js Environment ---

// Keep the process running to capture all input
process.stdin.resume();
process.stdin.setEncoding('utf8');

let rawInputBuffer = '';
let currentInputPosition = 0;
let parsedInputTokens = [];

/**
 * Reads the next token from the processed input array.
 * @param {string} [desiredType] - 'string' for string, otherwise attempts number conversion.
 * @returns {string|number} The next input token.
 */
function obtainNumericalInput() {
  if (currentInputPosition >= parsedInputTokens.length) {
    console.error("Attempted to read beyond available input tokens.");
    return NaN; // Or throw an error
  }
  const token = parsedInputTokens[currentInputPosition++];
  return Number.parseInt(token, 10);
}

function obtainStringInput() {
  if (currentInputPosition >= parsedInputTokens.length) {
    console.error("Attempted to read beyond available input tokens.");
    return ''; // Or throw an error
  }
  const token = parsedInputTokens[currentInputPosition++];
  return token;
}

/**
 * Outputs a value to the console, followed by a newline.
 * @param {*} value - The value to be printed.
 */
function emitResult(value) {
  console.log(value);
}

// Event listener for incoming data chunks
process.stdin.on('data', (chunk) => {
  rawInputBuffer += chunk;
});

// Event listener for end of input stream
process.stdin.on('end', () => {
  // Split the entire input buffer by whitespace and filter out empty strings
  parsedInputTokens = rawInputBuffer.split(/\s+/).filter(Boolean);
  // Once all input is processed, execute the main program logic
  executeMainProgram();
});