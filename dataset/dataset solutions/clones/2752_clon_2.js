function displayMessage(messageContent) {
  console.log(messageContent);
} // Utility routine for console output

function ProcessData(rawData)
{

  rawData = rawData.trim(); // Remove leading/trailing whitespace from the input string.
  // rawData = rawData.split(" "); // Example: Split by spaces (commented out)
  rawData = rawData.split("\n"); // Divide the input into an array of lines.
  // rawData = rawData.split(" ").map( (item) => Number(item) ); // Example: Split by space and convert to numbers (commented out)
  // rawData = rawData.split("\n").map( (item) => Number(item) ); // Example: Split by newline and convert to numbers (commented out)

  // Parse the first line to extract two integer values
  var firstCount = parseInt(rawData[0].split(" ")[0]);
  var secondCount = parseInt(rawData[0].split(" ")[1]);

  // Check a condition based on the second parsed count
  if (secondCount % 2 === 1)
  {
    console.log("-1"); // Output an error code
    return; // Terminate execution early
  }

  // Remove the first line of the raw data as it has been processed
  rawData.shift();

  // Initialize an object to store adjacency lists for a graph
  var adjacencyMap = {};

  // Populate the adjacency map with empty arrays for each node
  for (var idx = 1; idx <= firstCount; idx++)
  {
    adjacencyMap[idx] = [];
  }

  // Process the remaining lines to build the graph's connections
  for (var loopVar = 0; loopVar < secondCount; loopVar++)
  {
    var nodeAIdentifier = rawData[loopVar].split(" ")[0];
    var nodeBIdentifier = rawData[loopVar].split(" ")[1];

    // Add bidirectional connections to the adjacency map
    adjacencyMap[nodeAIdentifier].push(nodeBIdentifier);
    adjacencyMap[nodeBIdentifier].push(nodeAIdentifier);
  }

  // Verify another condition based on the degree of each node in the graph
  for (var nodeIndex = 1; nodeIndex <= firstCount; nodeIndex++)
  {
    if (adjacencyMap[nodeIndex].length % 2 === 1)
    {
      console.log("-1"); // Output an error code
      return; // Exit the function if the condition is not met
    }
  }

  // An empty loop, potentially for future processing or placeholder
  for (var iterationCounter = 1; iterationCounter <= secondCount; iterationCounter++)
  {
    // No operations within this loop in the current implementation
  }
}

// Invoke the main data processing function with input read from standard input
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));