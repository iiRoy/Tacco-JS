function ProcessInput(rawData) {
  // Split the entire input string by newline characters to get individual lines.
  rawData = rawData.split('\n');

  // Parse the first line to get the number of points (N) and constraints (M).
  // The map function converts string parts to integers.
  const params = rawData[0].split(' ').map(val => parseInt(val, 10));
  const numPoints = params[0]; // N: Number of points
  const numConstraints = params[1]; // M: Number of constraints

  // Initialize arrays to store constraint details:
  // leftIndices: Stores the starting point index for each constraint.
  // rightIndices: Stores the ending point index for each constraint.
  // diffValues: Stores the required difference between pointValues[right] and pointValues[left].
  const leftIndices = [];
  const rightIndices = [];
  const diffValues = [];

  // Initialize an array to hold the calculated values for each point.
  // All points are initially set to 0.
  const pointValues = new Array(numPoints).fill(0);

  // Initialize an adjacency list-like structure for graph traversal.
  // Each element adjList[i] will store pairs [neighbor_index, difference_to_neighbor].
  const adjList = new Array(numPoints);
  for (let idx = 0; idx < numPoints; idx++) {
    adjList[idx] = []; // Ensure each entry is an empty array.
  }

  // The final result string, defaults to "Yes".
  let resultString = "Yes";

  // Process each constraint from the input.
  for (let idx = 0; idx < numConstraints; idx++) {
    // Parse the current constraint line.
    const currentConstraintLine = rawData[idx + 1].split(' ').map(val => parseInt(val, 10));

    // Store the original parsed values temporarily.
    // Note: The original code reuses L[i] for both the array and the final index.
    // We'll follow that pattern for Type II.
    leftIndices[idx] = currentConstraintLine; // Temporarily stores [L, R, D]
    rightIndices[idx] = leftIndices[idx][1] - 1; // R_i - 1
    diffValues[idx] = leftIndices[idx][2]; // D_i
    leftIndices[idx] = leftIndices[idx][0] - 1; // L_i - 1

    // Add edges to the adjacency list for both directions:
    // From L to R with difference D.
    adjList[leftIndices[idx]].push(rightIndices[idx], diffValues[idx]);
    // From R to L with difference -D (for reverse traversal).
    adjList[rightIndices[idx]].push(leftIndices[idx], -diffValues[idx]);
  }

  // Iterate through each point to initiate value calculations if it has neighbors.
  for (let idx = 0; idx < numPoints; idx++) {
    // The 'currentOffset' variable points to the last pair of [neighbor, diff] in the list.
    // We subtract 2 because each pair consists of two elements.
    let currentOffset = adjList[idx].length - 2;
    if (currentOffset >= 0) {
      // If there are neighbors, start calculating values recursively.
      calculatePointValue(adjList[idx], idx, currentOffset);
    }
  }

  // After calculating all possible point values, verify all constraints.
  for (let idx = 0; idx < numConstraints; idx++) {
    // Check if the difference between the calculated values of R and L matches the required D.
    if (pointValues[rightIndices[idx]] - pointValues[leftIndices[idx]] !== diffValues[idx]) {
      resultString = "No"; // If any constraint is violated, set result to "No".
      break; // No need to check further constraints.
    }
  }

  // Output the final result.
  console.log(resultString);

  /**
   * Recursively calculates point values based on known differences.
   * This function performs a depth-first traversal from a source point.
   *
   * @param {Array<number>} currentList - The adjacency list of the current source point.
   * @param {number} sourceIdx - The index of the current source point.
   * @param {number} currentOffset - The current position in `currentList` (points to a neighbor index).
   */
  function calculatePointValue(currentList, sourceIdx, currentOffset) {
    // Get the neighbor's index from the current position in the list.
    const neighborIdx = currentList[currentOffset];

    // Calculate the neighbor's value based on the source's value and the difference.
    pointValues[neighborIdx] = pointValues[sourceIdx] + currentList[currentOffset + 1];

    // "Remove" the processed pair from the current list by truncating its length.
    // This prevents reprocessing the same edge in the current path.
    currentList.length = currentOffset;

    // Move to the previous pair in the current list.
    currentOffset -= 2;

    // If there are more neighbors in the current list, continue processing them.
    if (currentOffset >= 0) {
      calculatePointValue(currentList, sourceIdx, currentOffset);
    }

    // Now, explore neighbors of the newly calculated point (neighborIdx).
    // Get the last pair in the neighbor's adjacency list.
    let nextOffset = adjList[neighborIdx].length - 2;
    if (nextOffset >= 0) {
      // If the neighbor has its own neighbors, recursively calculate their values.
      calculatePointValue(adjList[neighborIdx], neighborIdx, nextOffset);
    }
  }
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
