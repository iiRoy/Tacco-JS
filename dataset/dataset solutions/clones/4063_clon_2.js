// Function to process graph relationship data and check for consistency
function ProcessGraphData(rawInputData) {

  // Split the entire input string into an array of individual lines.
  // This prepares the data for line-by-line parsing.
  const parsedLines = rawInputData.split("\n");

  // The first line of input typically contains global parameters.
  // Here, it's split by spaces and each segment is converted to an integer.
  const globalDimensions = parsedLines[0].split(" ").map(strVal => parseInt(strVal));

  // The first value from the global dimensions represents the total number of nodes in the graph.
  const nodeCount = globalDimensions[0];
  // The second value represents the total number of relationships or edges provided.
  const relationCount = globalDimensions[1];

  // Initialize three dynamic arrays to store the components of each relationship:
  // `leftNodes`: Stores the starting node of each directed relation.
  // `rightNodes`: Stores the ending node of each directed relation.
  // `nodeDistances`: Stores the distance or difference value associated with each relation.
  let leftNodes = [];
  let rightNodes = [];
  let nodeDistances = [];

  // Iterate through the input lines, starting from the second line (index 1),
  // to populate the relationship arrays. Each line defines a single relation.
  for (let currentIdx = 0; currentIdx < relationCount; currentIdx++) {
    // Parse the current relationship line, splitting it by spaces and converting parts to integers.
    const currentRelationData = parsedLines[currentIdx + 1].split(" ").map(numStr => parseInt(numStr));
    // Assign the first integer as the left node.
    leftNodes[currentIdx] = currentRelationData[0];
    // Assign the second integer as the right node.
    rightNodes[currentIdx] = currentRelationData[1];
    // Assign the third integer as the distance/difference.
    nodeDistances[currentIdx] = currentRelationData[2];
  }

  // Create an array to hold the calculated position or coordinate for each node.
  // It's initialized with a size of `nodeCount + 1` to support 1-based indexing of nodes.
  // All elements are initially `undefined`.
  let positionMap = new Array(nodeCount + 1);

  // Initialize a string flag to "Yes", indicating that the graph is consistent by default.
  // This flag will be changed to "No" if any inconsistency is detected.
  let consistencyStatus = "Yes";

  // Declare variables for loop control within the main processing logic.
  // `outerLoopIdx`: Used for iterating through the main list of relations.
  // `innerLoopCounter`: Controls an inner processing loop, often related to queue size.
  // `currentCheckNode`: Holds the node currently being processed from the queue.
  let outerLoopIdx = leftNodes.length - 1; // Start processing from the last added relation.
  let innerLoopCounter;
  let currentCheckNode;

  // A queue (implemented as an array) to store nodes that need to be visited or re-evaluated
  // to propagate position information.
  let nodesToProcess = [];

  // This label allows for a multi-level `break` statement, enabling an immediate exit
  // from all nested loops if an inconsistency is found.
  mainProcessingLoop:
  while (outerLoopIdx >= 0) {
    // For the current relation `(leftNodes[outerLoopIdx], rightNodes[outerLoopIdx], nodeDistances[outerLoopIdx])`,
    // we establish a relative positioning. The left node's position is arbitrarily set to 0.
    positionMap[leftNodes[outerLoopIdx]] = 0;
    // The right node's position is then determined relative to the left node's position and their distance.
    positionMap[rightNodes[outerLoopIdx]] = nodeDistances[outerLoopIdx];

    // Add both nodes from the current relation to the queue for further processing.
    // These nodes will be used to explore connected relations.
    nodesToProcess = [leftNodes[outerLoopIdx], rightNodes[outerLoopIdx]];

    // Remove the relation that was just used to establish initial positions.
    // This prevents re-processing the same relation. `pop()` is efficient for removing from the end.
    leftNodes.pop();
    rightNodes.pop();
    nodeDistances.pop();

    // Initialize the inner loop counter based on the number of nodes just added to the queue.
    innerLoopCounter = 2;

    // This loop continues as long as there are nodes in the `nodesToProcess` queue.
    while (innerLoopCounter) {
      // Retrieve the last node from the queue for processing.
      currentCheckNode = nodesToProcess[innerLoopCounter - 1];
      // Remove the node from the queue as it's about to be processed.
      nodesToProcess.pop();

      // Search for any remaining relations where `currentCheckNode` acts as the left node.
      // `outerLoopIdx` is reused here to store the index of such a relation.
      outerLoopIdx = leftNodes.findIndex(itemVal => itemVal === currentCheckNode);

      // Process all relations where `currentCheckNode` is the left node.
      while (outerLoopIdx >= 0) {
        // Check if the position of the right node in this relation is already known.
        if (positionMap[rightNodes[outerLoopIdx]] !== undefined) {
          // If known, verify if its existing position is consistent with the current relation's data.
          // Consistency means `position(R) === position(L) + distance`.
          if (positionMap[rightNodes[outerLoopIdx]] !== positionMap[leftNodes[outerLoopIdx]] + nodeDistances[outerLoopIdx]) {
            // If an inconsistency is detected, set the status to "No" and break out of all loops.
            consistencyStatus = "No";
            break mainProcessingLoop;
          }
        } else {
          // If the right node's position is not yet known, calculate it based on the left node's position and the distance.
          positionMap[rightNodes[outerLoopIdx]] = positionMap[leftNodes[outerLoopIdx]] + nodeDistances[outerLoopIdx];
          // Add this newly positioned node to the queue, as its connections might need to be explored.
          nodesToProcess.push(rightNodes[outerLoopIdx]);
        }
        // Remove the relation that has just been processed to avoid re-evaluation.
        // `splice` is used as `findIndex` might return an index in the middle of the array.
        leftNodes.splice(outerLoopIdx, 1);
        rightNodes.splice(outerLoopIdx, 1);
        nodeDistances.splice(outerLoopIdx, 1);
        // Search for the next relation where `currentCheckNode` is still the left node.
        outerLoopIdx = leftNodes.findIndex(itemVal => itemVal === currentCheckNode);
      }

      // Now, search for any remaining relations where `currentCheckNode` acts as the right node.
      outerLoopIdx = rightNodes.findIndex(itemVal => itemVal === currentCheckNode);

      // Process all relations where `currentCheckNode` is the right node.
      while (outerLoopIdx >= 0) {
        // Check if the position of the left node in this relation is already known.
        if (positionMap[leftNodes[outerLoopIdx]] !== undefined) {
          // If known, verify if its existing position is consistent with the current relation's data.
          // Consistency means `position(L) === position(R) - distance`.
          if (positionMap[leftNodes[outerLoopIdx]] !== positionMap[rightNodes[outerLoopIdx]] - nodeDistances[outerLoopIdx]) {
            // If an inconsistency is detected, set the status to "No" and break out of all loops.
            consistencyStatus = "No";
            break mainProcessingLoop;
          }
        } else {
          // If the left node's position is not yet known, calculate it.
          positionMap[leftNodes[outerLoopIdx]] = positionMap[rightNodes[outerLoopIdx]] - nodeDistances[outerLoopIdx];
          // Add this newly positioned node to the queue for further exploration.
          nodesToProcess.push(leftNodes[outerLoopIdx]);
        }
        // Remove the processed relation.
        leftNodes.splice(outerLoopIdx, 1);
        rightNodes.splice(outerLoopIdx, 1);
        nodeDistances.splice(outerLoopIdx, 1);
        // Search for the next relation where `currentCheckNode` is still the right node.
        outerLoopIdx = rightNodes.findIndex(itemVal => itemVal === currentCheckNode);
      }
      // Update the `innerLoopCounter` based on the current number of nodes remaining in the queue.
      // This ensures the loop continues as long as there are nodes to process.
      innerLoopCounter = nodesToProcess.length;
    }
    // After processing all nodes reachable from the initial relation (and consuming its related edges),
    // move to the next unprocessed relation in the main list.
    // The main list shrinks as relations are processed and removed.
    outerLoopIdx = leftNodes.length - 1;
  }

  // Output the final consistency status to the console.
  console.log(consistencyStatus);
}

// This line executes the `ProcessGraphData` function, providing it with input
// read synchronously from standard input ("/dev/stdin") as a UTF-8 string.
ProcessGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));