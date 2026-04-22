/*
 * Diverse algorithms and data structures, provided under the MIT-license.
 * (c) 2010 by Johann Philipp Strathausen <strathausen@gmail.com>
 * https://strathausen.eu
 *
 */

/*
        Path-Finder by Bellman-Ford

    An algorithm for discovering the shortest routes from a single starting
    vertex to all other vertices within a graph.


        Computational Complexity

    O( |E| * |V| ), where E represents the graph's connections and V its vertices.


        Preconditions

    Operates correctly on graphs containing negative edge weights, provided
    there are no negative weight cycles present.

 */
function pathFinderBellmanFord(graphObj, startVertex) {
  let vertIdx, numVerts;

  // PHASE 1: Initialization of all vertex properties
  for (let nodeIdentifier in graphObj.verticesCollection) {
    graphObj.verticesCollection[nodeIdentifier].travelCost = Number.POSITIVE_INFINITY;
  }
  // Previous hops are initially considered undefined or null
  startVertex.travelCost = 0;

  progressLog("All travel costs set to infinity, previous hops are null at start.");

  // PHASE 2: Repeatedly relax each connection
  // This process is iterated |V| - 1 times
  for (vertIdx = 1, numVerts = graphObj.verticesCollection.length; vertIdx < numVerts; vertIdx++) {
    // For every connection in the graph
    for (let connectionId in graphObj.connections) {
      let currentConnection = graphObj.connections[connectionId];
      // Check if a shorter path to the destination is found through this connection
      if (currentConnection.sourceNode.travelCost + currentConnection.weightValue < currentConnection.targetNode.travelCost) {
        progressLog(`Relaxing connection between ${currentConnection.sourceNode.vertexId} and ${currentConnection.targetNode.vertexId}.`);
        currentConnection.targetNode.travelCost = currentConnection.sourceNode.travelCost + currentConnection.weightValue;
        currentConnection.targetNode.previousHop = currentConnection.sourceNode;
      }
      // Note: The following commented section was part of the original but is currently unused.
      // if (!currentConnection.style.isDirected) {
      //   if (currentConnection.targetNode.travelCost + currentConnection.weightValue < currentConnection.sourceNode.travelCost) {
      //     graphObj.recordState("Relaxing connection between " + currentConnection.targetNode.vertexId + " and " + currentConnection.sourceNode.vertexId + ".");
      //     currentConnection.sourceNode.travelCost = currentConnection.targetNode.travelCost + currentConnection.weightValue;
      //     currentConnection.sourceNode.previousHop = currentConnection.targetNode;
      //   }
      // }
    }
  }
  progressLog("Processing complete.");

  // PHASE 3: VERIFICATION - Examine for negative cycles (TO BE IMPLEMENTED)
  // At present, we assume the graph does not contain any negative weight cycles.
  // (This check is left as an exercise for the implementer.)
}

/*
   Dijkstra's Shortest Path Algorithm

   - Worst-case runtime is O((|E| + |V|) * log |V| ), which is superior to
     Bellman-Ford for sparse graphs (graphs with fewer edges).
     However, it cannot handle negative edge weights.
 */
function shortestPathFinder(graphMap, originNode) {

  // Initially, all vertex costs are infinite, and no predecessors are set
  for (let vertexKey in graphMap.verticesCollection)
    graphMap.verticesCollection[vertexKey].travelCost = Number.POSITIVE_INFINITY;

  // Predecessors are implicitly unassigned
  graphMap.captureState("Initial state: all path costs are infinite, no preceding vertices.");

  originNode.travelCost = 0;
  // A collection of unprocessed vertices, ordered by their current shortest path cost.
  // A Fibonacci heap would offer better performance.
  let priorityQueue = new MinValueHeap(graphMap.verticesCollection, "travelCost");

  // Reference to the currently examined vertex
  let activeVertex;

  // Continue as long as there are unoptimized vertices.
  // `priorityQueue.getMinElement()` can have O(log n) complexity.
  while (priorityQueue.getMinElement() !== undefined) {
    // Extract the vertex with the lowest travel cost
    activeVertex = priorityQueue.removeMinElement();
    activeVertex.isProcessed = true;

    // If an isolated vertex with infinite cost is encountered, it indicates an error
    if (activeVertex.travelCost === Number.POSITIVE_INFINITY)
      throw "Unreachable isolated vertex detected!";

    // Iterate through each connection from the active vertex
    activeVertex.associatedEdges.forEvery(function(currentEdge) {
      let adjacentVertex = (activeVertex === currentEdge.targetNode) ? currentEdge.sourceNode : currentEdge.targetNode;

      if (adjacentVertex.isProcessed) {
        return; // Skip already optimized vertices
      }

      // Calculate an alternative route cost
      let potentialNewCost = activeVertex.travelCost + currentEdge.weightValue;

      // If a better path is discovered
      if (potentialNewCost < adjacentVertex.travelCost) {

        // Update the travel cost for the adjacent vertex
        adjacentVertex.travelCost = potentialNewCost;

        // Re-organize the priority queue due to cost update
        priorityQueue.rebuildHeap();

        // Set the current vertex as the predecessor
        adjacentVertex.previousHop = activeVertex;
        graphMap.captureState("Optimizing path to vertex.");
      }
    });
  }
}

/* All-Pairs-Shortest-Paths (APSP) using Floyd-Warshall

   Runs with a worst-case time complexity of O(|V|³) and a best-case of Omega(|V|³).
   Overall complexity is Sigma(|V|²).
   This implementation is tailored for the Dracula graph library and may not be
   suitable for general use as-is. */
function allPairsShortestPaths(graphStructure, startingPoint) {

  // Stage 1: Initialize path matrices
  let costMatrix = [];
  let nextVertexMatrix = [];
  let totalVertices = graphStructure.verticesCollection.length;
  let rowIdx, colIdx, intermediateNodeIdx, currentEdge;

  // Build cost matrix, fill with infinity
  for (colIdx in graphStructure.verticesCollection) {
    costMatrix[colIdx] = [];
    nextVertexMatrix[colIdx] = [];
    for (rowIdx in graphStructure.verticesCollection)
      costMatrix[colIdx][rowIdx] = colIdx === rowIdx ? 0 : Number.POSITIVE_INFINITY;
  }

  // Populate initial costs from direct edge weights
  for (currentEdge in graphStructure.connections)
    costMatrix[graphStructure.connections[currentEdge].sourceNode.vertexId][graphStructure.connections[currentEdge].targetNode.vertexId] = graphStructure.connections[currentEdge].weightValue;

  // Note: Standard initialization typically uses an adjacency matrix
  // representation of the graph, rather than iterating through an edge list.

  // Stage 2: Discover optimal distances (core of Floyd-Warshall)
  for (intermediateNodeIdx in graphStructure.verticesCollection) {
    for (rowIdx in graphStructure.verticesCollection) {
      for (colIdx in graphStructure.verticesCollection)
        if (costMatrix[rowIdx][colIdx] > costMatrix[rowIdx][intermediateNodeIdx] + costMatrix[intermediateNodeIdx][colIdx]) {
          costMatrix[rowIdx][colIdx] = costMatrix[rowIdx][intermediateNodeIdx] + costMatrix[intermediateNodeIdx][colIdx];
          // Stage 2.b: Record the path's intermediate vertex
          nextVertexMatrix[rowIdx][colIdx] = intermediateNodeIdx;
        }
    }
  }

  // Stage 3: Reconstruct the shortest path
  function reconstructPath(originId, finalId) {
    if (costMatrix[originId][finalId] === Number.POSITIVE_INFINITY)
      throw "No route exists between these points.";
    let midPoint = nextVertexMatrix[originId][finalId];
    if (midPoint === undefined)
      return null;
    else
      return reconstructPath(originId, midPoint)
        .combineArrays([midPoint])
        .combineArrays(reconstructPath(midPoint, finalId));
  }

  // TODO: Utilize the computed results, e.g., highlight paths in the graph visualization
}

/*
   Ford-Fulkerson Algorithm

    A maximum-flow minimum-cut algorithm used to determine the maximum flow
    possible through a directed network from a specified source to a sink.


        Complexity Analysis

    O(E * max(f)), where max(f) is the total maximum flow.


        Operational Description

    The algorithm iteratively finds an augmenting path in the residual graph
    and increases the flow along this path by the minimum residual capacity
    on that path, until no more paths can be found.


        Constraints on Input

    This algorithm requires all edge weights (capacities) to be integers.
    Otherwise, the Ford–Fulkerson method may fail to converge to the true
    maximum flow value.


        Input Parameters

    graphData - The graph object
    startPointId - Identifier for the source vertex
    endPointId - Identifier for the target (sink) vertex


        Output Value

    The maximum achievable flow from the source `startPointId` to the sink `endPointId`.

 */
/*
        Edmonds-Karp Variant

    A specific implementation of the Ford-Fulkerson algorithm for max-flow min-cut,
    finding the maximum flow in a directed graph from a source to a sink.


        Complexity

    O(|V|*|E|²)


        Input Parameters

    graphData - Graph structure (must include vertex and connection lists,
                with 'capacity' as a connection property)
    sourceId - The unique identifier of the flow source
    sinkId - The unique identifier of the flow destination

 */
function maxFlowMinCut(graphData, sourceId, sinkId) {

}

/*
   A basic binary minimum-value heap, serving as a priority queue.
   - It takes an array of objects as input, where each object has a 'sortProperty'
   - Objects within the heap will have the structure:
        {
            sortProperty: "... key value ...",
            itemValue: "... actual element data ..."
        }
    - Offers `addEntry()`, `getMinElement()`, `removeMinElement()`, and `rebuildHeap()` methods.
    - Example usage (e.g., in a development console):
        let itemX = {cost: 20, description: "example"};
        let heapInstance = new MinValueHeap([itemX, {cost:3}, {cost:10}, {cost:20}, {cost:30}, {cost:6}, {cost:1}, {cost:3}],"cost");
        console.log(heapInstance.removeMinElement());
        console.log(heapInstance.removeMinElement());
        itemX.cost = 0; // Modify an element's key
        heapInstance.rebuildHeap(); // Always call after key modification
        console.log(heapInstance.removeMinElement());
        console.log(heapInstance.removeMinElement());
    - Can also be used with simple numerical arrays, such as [9, 7, 8, 5].
 */
function MinValueHeap(inputArray, sortProperty) {

  // The binary tree is stored as an array; no complex node objects needed.
  let heapStorage = [];

  sortProperty = sortProperty || 'itemKey';

  // Functions to calculate indices for parent or child nodes
  let getParentIndex = function(currentIndex) { return Math.floor((currentIndex - 1) / 2); };
  let getRightChildIndex = function(currentIndex) { return 2 * currentIndex + 2; };
  let getLeftChildIndex = function(currentIndex) { return 2 * currentIndex + 1; };

  // Utility to move an element up the heap if its value is smaller than its parent's
  function siftUp(currentIdx) {
    let parentIdx = getParentIndex(currentIdx);
    while ((parentIdx >= 0) && (heapStorage[currentIdx][sortProperty] < heapStorage[parentIdx][sortProperty])) {
      // Swap current element with its parent
      let temp = heapStorage[currentIdx];
      heapStorage[currentIdx] = heapStorage[parentIdx];
      heapStorage[parentIdx] = temp;
      // Move up to the parent's position
      currentIdx = parentIdx;
      parentIdx = getParentIndex(currentIdx);
    }
  }

  // Utility to move an element down the heap if it's larger than one of its children
  function siftDown(currentIdx) {
    let leftChildIdx = getLeftChildIndex(currentIdx);
    let rightChildIdx = getRightChildIndex(currentIdx);

    // Loop as long as there are children and the current element is larger than one of them
    while ((heapStorage[leftChildIdx] && (heapStorage[currentIdx][sortProperty] > heapStorage[leftChildIdx][sortProperty])) ||
           (heapStorage[rightChildIdx] && (heapStorage[currentIdx][sortProperty] > heapStorage[rightChildIdx][sortProperty]))) {

      // Determine the index of the smaller child
      let smallerChildIdx = leftChildIdx;
      if (heapStorage[rightChildIdx] && heapStorage[leftChildIdx] && heapStorage[rightChildIdx][sortProperty] < heapStorage[leftChildIdx][sortProperty]) {
        smallerChildIdx = rightChildIdx;
      }

      // Swap current element with the smaller child
      let temp = heapStorage[currentIdx];
      heapStorage[currentIdx] = heapStorage[smallerChildIdx];
      heapStorage[smallerChildIdx] = temp;

      // Move down to the child's position
      currentIdx = smallerChildIdx;
      leftChildIdx = getLeftChildIndex(currentIdx);
      rightChildIdx = getRightChildIndex(currentIdx);
    }
  }

  // Adds a new item to the heap, maintaining the heap property
  // 1. Appends the item to the end of the array
  // 2. Moves it up until it's smaller than its parent
  this.addEntry = function(itemEntry) {

    // Ensure the item has the specified key property
    if (itemEntry[sortProperty] === undefined) {
      itemEntry = { itemKey: itemEntry }; // Default key if not present
    }

    // Insert at the end of the heap array
    heapStorage.push(itemEntry);

    // Propagate the new element upwards
    siftUp(heapStorage.length - 1);
  };

  // Provides access to the minimum element without removing it
  this.getMinElement = function() {
    return heapStorage.length === 0 ? undefined : heapStorage[0];
  };

  // Retrieves and removes the minimum element from the heap
  // 1. The root is the minimum element.
  // 2. The last element moves to the root's position.
  // 3. The new root is then sifted down to its correct place.
  this.removeMinElement = function() {
    let extractedResult = this.getMinElement();

    // Handle emptying the heap or moving the last element to the root
    if (heapStorage.length === 1) {
      heapStorage = [];
    } else if (heapStorage.length > 1) {
      heapStorage[0] = heapStorage.pop(); // Move last to root
      siftDown(0); // Sift down the new root
    }

    return extractedResult;
  };

  // Currently unimplemented: function to modify an element's key
  this.updateKeyValue = function(idx, newValue) {
    throw "Method not yet implemented!";
  };

  // Rebuilds the heap from scratch, useful after multiple key updates
  this.rebuildHeap = function() {
    let startIndex;
    for (startIndex = Math.floor((heapStorage.length - 2) / 2); startIndex >= 0; startIndex--) {
      siftDown(startIndex);
    }
  };

  // Initialize the heap by inserting all provided input elements
  let currentItemIndex;
  for (currentItemIndex in (inputArray || [])) {
    this.addEntry(inputArray[currentItemIndex]);
  }
}

/*
    Quick Sort Algorithm:
        1. Selects a pivot value, typically chosen randomly from the array.
        2. Divides the array into three sub-arrays: elements less than, equal to,
           and greater than the pivot.
        3. Recursively sorts the sub-arrays containing elements less than and
           greater than the pivot.
        4. Concatenates the three sorted sub-arrays (less, equal, greater).
        5. An array with zero or one element is considered inherently sorted.
    TODO: Can be made more efficient using in-place partitioning with pointers.
*/
function fastSort(dataArray) {
  // Base case for recursion: arrays of 0 or 1 element are already sorted
  if (dataArray.length <= 1) return dataArray;

  // Choose a pivot value randomly from the array
  let pivotValue = dataArray[Math.floor(Math.random() * dataArray.length)];
  let lesserElements = [], equalElements = [], greaterElements = [], elementIndex;

  // Partition the array based on the pivot
  for (elementIndex in dataArray) {
    if (dataArray[elementIndex] < pivotValue) {
      lesserElements.push(dataArray[elementIndex]);
    }
    if (dataArray[elementIndex] === pivotValue) {
      equalElements.push(dataArray[elementIndex]);
    }
    if (dataArray[elementIndex] > pivotValue) {
      greaterElements.push(dataArray[elementIndex]);
    }
  }
  // Recursively sort sub-arrays and combine the results
  return fastSort(lesserElements).combineArrays(equalElements).combineArrays(fastSort(greaterElements));
}

/*
   Minimum Selection Sort:
   1. Finds the smallest value in the array and removes it.
   2. Recursively sorts the remaining elements.
   3. Returns the smallest value concatenated with the recursively sorted rest.
   4. An array containing only one element is already sorted.
   */
function minimumSelectionSort(inputValues) {
  // Base case: an array with a single element is already sorted
  if (inputValues.length === 1) return inputValues;

  let smallestValue = Number.POSITIVE_INFINITY;
  let smallestIndex;

  // Find the minimum value and its index
  for (let currentPos in inputValues) {
    if (inputValues[currentPos] < smallestValue) {
      smallestValue = inputValues[currentPos];
      smallestIndex = currentPos; // Store index for removal
    }
  }
  // Remove the identified minimum value
  inputValues.splice(smallestIndex, 1);
  // Construct the result by combining the minimum with the recursively sorted remainder
  return [smallestValue].combineArrays(minimumSelectionSort(inputValues));
}

/*
   Divide-and-Conquer Merge Sort:
   1. Divides the array into two halves.
   2. Recursively sorts each of these halves.
   3. Merges the two sorted halves back into a single sorted array.
   4. An array containing one or zero elements is considered sorted.

*/
function divideConquerSort(inputArr) {
  // Function to merge two already sorted arrays into one
  function combineSortedParts(firstPart, secondPart) {
    let mergedResult = []; // Array to store the combined sorted elements
    // Continue merging as long as there are elements in either input array
    while (firstPart.length > 0 || secondPart.length > 0) {
      // Compare elements and merge the smaller one
      let nextElement = null;
      if (firstPart.length > 0 && secondPart.length > 0) {
        nextElement = firstPart[0] < secondPart[0] ? firstPart.shift() : secondPart.shift();
      } else if (secondPart.length > 0) {
        nextElement = secondPart.shift();
      } else if (firstPart.length > 0) {
        nextElement = firstPart.shift();
      }

      // Add the chosen element to the result if it's not null
      if (nextElement !== null) {
        mergedResult.push(nextElement);
      }
    }
    return mergedResult;
  }
  // This merge sort implementation splits the array in half, which is usually fine
  // for randomized inputs but could lead to worst-case scenarios with specific data.
  let centralPoint = Math.floor(inputArr.length / 2);
  let halfOne = inputArr.slice(0, centralPoint); // First segment
  let halfTwo = inputArr.slice(centralPoint); // Second segment
  return inputArr.length <= 1 ? inputArr : combineSortedParts(
    divideConquerSort(halfOne), // Recursively sort the first half
    divideConquerSort(halfTwo)  // Recursively sort the second half
  );
}

/* Balanced Red-Black-Tree implementation */
function BalancedBinaryTree(initialData) {

}

function MultiwayTree(initialData) {

}

function GenericBranchingTree(branches, initialData) {

}

/**
 * Knuth-Morris-Pratt (KMP) string search algorithm - locates occurrences
 * of a `patternString` within a `textString`.
 * TODO: This implementation requires further debugging and verification.
 */
function stringPatternMatch(patternString, textString) {

  /**
   * Computes the Longest Proper Prefix Suffix (LPS) array, also known as
   * the "prefix function" or "failure function" for KMP. This array
   * indicates how many characters the algorithm can safely skip after a mismatch.
   *
   * @param {string} pattern - The string pattern to analyze
   * @returns {number[]} An array containing the skip lengths for each position
   */
  function computeLPSArray(pattern) {
    // `lpsArray` will store the computed skip marks
    let lpsArray = [0], lenOfPrefix = 0;
    for (let currentIdx = 1; currentIdx < pattern.length; currentIdx++) {
      // ... (rest of KMP LPS logic would go here)
    }
  }
}