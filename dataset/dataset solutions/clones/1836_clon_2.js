function GraphVertex() {
  this.leftBranch = null; // Pointer to the left child vertex
  this.rightBranch = null; // Pointer to the right child vertex
  this.level = null; // The depth level of this vertex
  this.isLeaf = null; // Indicates if this vertex is a leaf node
}

let vertexCollection = []; // Global array to store all generated vertices

function appendVerticesRecursively(ancestor, targetLevel) {
  // This function adds new vertices from the ancestor's level up to the targetLevel.

  let currentAncestor = ancestor; // Start from the provided ancestor
  for (let idx = ancestor.level + 1; idx <= targetLevel; idx++) {
    let newVertex = new GraphVertex(); // Create a fresh vertex instance
    newVertex.level = idx; // Assign its hierarchical level
    newVertex.isLeaf = (idx === targetLevel); // Mark as leaf if it's the final level

    if (ancestor.leftBranch) { // If the original ancestor already has a left child
      currentAncestor.rightBranch = newVertex; // Attach new vertex to the right of the current parent
    } else { // Otherwise, attach to the left
      currentAncestor.leftBranch = newVertex;
    }
    vertexCollection.push(newVertex); // Add the newly created vertex to the global collection
    currentAncestor = newVertex; // Move the 'current parent' reference to the newly added vertex
  }

  // Sort the entire collection of vertices by their level for consistency
  vertexCollection.sort(function (first, second) {
    return first.level - second.level;
  });
}

function tryAddVertexAtLevel(targetLevel) {
  // Attempts to find an available parent vertex and add new vertices up to the specified level.
  for (let idx = 0; idx < vertexCollection.length; idx++) {
    let currentCandidate = vertexCollection[idx]; // Examine each vertex in the collection

    if (currentCandidate.isLeaf) { // If it's already a leaf, it cannot be a parent
      continue;
    }
    if (currentCandidate.leftBranch && currentCandidate.rightBranch) { // If both branches are occupied
      continue; // This vertex cannot accept new children
    }

    // If an eligible parent is found, proceed to add the new vertices
    appendVerticesRecursively(currentCandidate, targetLevel);
    return true; // Indicate successful addition
  }
  return false; // No suitable parent found for adding vertices
}

// The primary execution function, processing raw input data.
function ProcessInputData(rawData) {
  // Split the entire input string into individual lines.
  const dataRows = rawData.split("\n");
  const firstRow = dataRows[0]; // Get the first line of input.
  const secondRow = dataRows[1]; // Get the second line of input.
  const secondRowElements = secondRow.split(" "); // Split the second line by spaces.

  // Parse the first line as an integer, representing the total count.
  const totalCount = parseInt(firstRow, 10);
  // Parse elements of the second line into an array of integers, representing level counts.
  const levelCounts = secondRowElements.map(item => parseInt(item, 10));

  // Initial validation: the count for level 0 must be 0.
  if (levelCounts[0] !== 0) {
    console.log(-1); // Output error code if condition is not met.
    return; // Terminate execution.
  }

  // Initialize the root vertex for level 0.
  let rootVertex = new GraphVertex();
  rootVertex.level = 0; // Set its level to 0.
  rootVertex.isLeaf = false; // It's not a leaf initially.
  vertexCollection.push(rootVertex); // Add the root to the global collection.

  // Iterate through levels from 1 up to totalCount.
  for (let idx = 1; idx <= totalCount; idx++) {
    // For each level, add the specified number of vertices.
    for (let k = 0; k < levelCounts[idx]; k++) {
      let operationSuccess = tryAddVertexAtLevel(idx); // Attempt to add a vertex at the current level.
      if (!operationSuccess) { // If adding failed (no suitable parent found)
        console.log(-1); // Output error code.
        return; // Terminate execution.
      }
    }
  }

  // After processing all levels, output the total number of vertices created.
  console.log(vertexCollection.length);
}

// Do not modify the following lines; they handle standard input/output and invoke the main function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
