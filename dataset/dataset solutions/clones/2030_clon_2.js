function ProcessInput(rawData) {
  // The input string is split into an array of lines.
  let lineData = rawData.split("\n");

  // The first line contains three space-separated numbers.
  let firstLineParts = lineData[0].split(" ");

  // Parse the numerical parameters from the first line.
  const nodeCount = Number(firstLineParts[0]);
  const firstSpecialNode = Number(firstLineParts[1]);
  const secondSpecialNode = Number(firstLineParts[2]);

  // Initialize an array to store the counts of each distance.
  // The array size is nodeCount - 1, as distances range from 1 to nodeCount - 1.
  let distanceCounts = [];
  for (let currentIdx = 0; currentIdx < nodeCount - 1; currentIdx++) {
    distanceCounts[currentIdx] = 0;
  }

  // Iterate through all possible pairs of distinct nodes (i, j) where i < j.
  for (let currentStartNode = 1; currentStartNode <= nodeCount - 1; currentStartNode++) {
    for (let currentEndNode = currentStartNode + 1; currentEndNode <= nodeCount; currentEndNode++) {
      let calculatedDistance; // Variable to hold the shortest path distance.

      // Case 1: Both nodes are before or at the first special node.
      if (currentStartNode <= firstSpecialNode && currentEndNode <= firstSpecialNode) {
        calculatedDistance = currentEndNode - currentStartNode;
      }
      // Case 2: Start node before or at first special, end node between first and second special.
      else if (currentStartNode <= firstSpecialNode && currentEndNode > firstSpecialNode && currentEndNode < secondSpecialNode) {
        calculatedDistance = firstSpecialNode - currentStartNode; // Distance to first special node.

        // Calculate two paths from first special node to end node: direct or via second special node.
        let pathOptionA = currentEndNode - firstSpecialNode;
        let pathOptionB = secondSpecialNode - currentEndNode + 1; // +1 for the edge between special nodes.

        if (pathOptionA < pathOptionB) {
          calculatedDistance += pathOptionA;
        } else {
          calculatedDistance += pathOptionB;
        }
      }
      // Case 3: Start node before or at first special, end node at or after second special.
      else if (currentStartNode <= firstSpecialNode && currentEndNode >= secondSpecialNode) {
        calculatedDistance = firstSpecialNode - currentStartNode + 1 + currentEndNode - secondSpecialNode;
      }
      // Case 4: Both nodes are between first and second special nodes.
      else if (currentStartNode > firstSpecialNode && currentStartNode < secondSpecialNode && currentEndNode > firstSpecialNode && currentEndNode < secondSpecialNode) {
        calculatedDistance = 0; // Initialize for this case.

        // Calculate two paths: direct or via the special node connection.
        let pathOptionA = currentEndNode - currentStartNode;
        let pathOptionB = currentStartNode - firstSpecialNode + 1 + secondSpecialNode - currentEndNode;

        if (pathOptionA < pathOptionB) {
          calculatedDistance += pathOptionA;
        } else {
          calculatedDistance += pathOptionB;
        }
      }
      // Case 5: Start node between first and second special, end node at or after second special.
      else if (currentStartNode > firstSpecialNode && currentStartNode < secondSpecialNode && currentEndNode >= secondSpecialNode) {
        calculatedDistance = currentEndNode - secondSpecialNode; // Distance from second special node to end.

        // Calculate two paths from start node to second special node: direct or via first special node.
        let pathOptionA = currentStartNode - firstSpecialNode + 1;
        let pathOptionB = secondSpecialNode - currentStartNode;

        if (pathOptionA < pathOptionB) {
          calculatedDistance += pathOptionA;
        } else {
          calculatedDistance += pathOptionB;
        }
      }
      // Case 6: Both nodes are at or after the second special node.
      else if (currentStartNode >= secondSpecialNode && currentEndNode >= secondSpecialNode) {
        calculatedDistance = currentEndNode - currentStartNode;
      }

      // Increment the count for the calculated distance.
      // Distances are 1-indexed, array is 0-indexed.
      distanceCounts[calculatedDistance - 1]++;
    }
  }

  // Format the result array into a newline-separated string.
  let finalOutput = distanceCounts.join("\n");

  // Output the result to the console.
  console.log('%s', finalOutput);
}

// This part of the code handles reading input and calling the main processing function.
// It should not be modified.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
