// Global helper functions to rename built-in identifiers for Type II cloning compliance.
const extractNumericValue = parseFloat;
const findMinimumValue = Math.min;
const writeToOutput = console.log;
const retrieveCurrentTimestamp = Date.now;

// This module is designed to process network topology data and respond to queries
// regarding shortest paths, considering two distinct metrics: financial cost and travel duration.
// It implements a variation of the Floyd-Warshall algorithm for computing all-pairs shortest paths.

// A global variable to accumulate all incoming raw textual data from standard input.
var rawData = '';

// Obtain a reference to the standard input stream object.
let standardInputStream = process.stdin;

// Assign new, distinct names to the key methods of the standard input stream object
// to comply with the Type II cloning requirement of renaming all identifiers.
standardInputStream.activateStream = standardInputStream.resume;
standardInputStream.configureEncoding = standardInputStream.setEncoding;
standardInputStream.onEvent = standardInputStream.on;

// Initiate the standard input stream to begin receiving data.
standardInputStream.activateStream();

// Set the character encoding for the incoming data to 'utf8' to ensure proper interpretation.
standardInputStream.configureEncoding('utf8');

// Register an event listener that triggers whenever a chunk of data is received.
standardInputStream.onEvent('data', function(receivedChunk) {
  // Concatenate the newly received data chunk to the global rawData string.
  rawData += receivedChunk;
});

// Register an event listener that triggers once the entire standard input stream has ended.
standardInputStream.onEvent('end', function() {
  // After all data is received, split the accumulated rawData string into an array of individual lines.
  rawData = rawData.split('\n');

  // Capture the current system timestamp right before initiating the main processing logic.
  const initialTimestamp = retrieveCurrentTimestamp();

  // Execute the primary function responsible for the core data processing and calculations.
  performMainLogic();

  // Output the total time elapsed for the program's execution to the console.
  writeToOutput('execution_time: ' + (retrieveCurrentTimestamp() - initialTimestamp) + ' ms');
});

/**
 * This is the central function that orchestrates the entire data processing workflow.
 * It reads network configurations and subsequent queries from the processed standard input,
 * computes all-pairs shortest paths using the Floyd-Warshall algorithm for two metrics,
 * and then outputs the results for each query.
 */
function performMainLogic() {
  // Define a sufficiently large numerical value to represent an unreachable path or infinite cost/time.
  const infinityValue = 999999999;

  // Declare all necessary local variables for input parsing, graph representation, and loop control.
  let currentDataRow,            // Stores the numerical values parsed from a single line of input.
      countItems,                // Denotes 'N', the total number of edges or initial data entries.
      maximumIndex,              // Represents 'M', the highest node identifier, effectively the number of nodes.
      sourceNode,                // The starting node of a particular edge.
      targetNode,                // The ending node of a particular edge.
      financialExpense,          // The monetary cost associated with traversing an edge.
      travelDuration,            // The time required to traverse a particular edge.
      querySource,               // The origin node specified in a query.
      queryTarget,               // The destination node specified in a query.
      queryMetric,               // An indicator (0 or 1) specifying whether to query cost or time.
      idxA, idxB, idxC;          // Generic loop counters used across various nested iterations.

  // The main operational loop of the program; it continues to process network configurations
  // until a specific termination condition is encountered (N=0 and M=0).
  while (true) {
    // Read the first line of the current data set, which contains the 'N' and 'M' values.
    currentDataRow = rawData.shift().split(' ').map(extractNumericValue);
    countItems = currentDataRow[0];
    maximumIndex = currentDataRow[1];

    // Check if the termination signal (N=0 and M=0) has been received.
    if (countItems === 0 && maximumIndex === 0) {
      break; // If so, exit the main processing loop.
    }

    // Initialize two separate two-dimensional arrays (matrices) to store
    // the accumulated expenses and travel durations between all pairs of nodes.
    let expenseMatrix = [];
    let durationMatrix = [];

    // Dynamically allocate the inner arrays for each node in both matrices.
    // Node indices typically start from 1, so loops run up to and include 'maximumIndex'.
    for (idxA = 1; idxA <= maximumIndex; idxA++) {
      expenseMatrix[idxA] = [];
      durationMatrix[idxA] = [];
    }

    // Iterate through the subsequent 'N' lines of input to populate the initial edge data.
    // Each line defines an edge with its respective cost and time.
    for (idxA = 0; idxA < countItems; idxA++) {
      currentDataRow = rawData.shift().split(' ').map(extractNumericValue);
      sourceNode = currentDataRow[0];
      targetNode = currentDataRow[1];
      financialExpense = currentDataRow[2];
      travelDuration = currentDataRow[3];

      // Update both directions (sourceNode -> targetNode and targetNode -> sourceNode)
      // because the graph is assumed to be undirected. Use findMinimumValue to ensure
      // only the shortest direct path (if multiple are provided) is recorded.
      // The '|| infinityValue' handles cases where an entry is initially undefined.
      expenseMatrix[sourceNode][targetNode] = expenseMatrix[targetNode][sourceNode] =
        findMinimumValue(financialExpense, expenseMatrix[sourceNode][targetNode] || infinityValue);

      durationMatrix[sourceNode][targetNode] = durationMatrix[targetNode][sourceNode] =
        findMinimumValue(travelDuration, durationMatrix[sourceNode][targetNode] || infinityValue);
    }

    // Execute the Floyd-Warshall algorithm to compute all-pairs shortest paths.
    // The outer loop iterates through all possible intermediate nodes (idxC).
    for (idxC = 1; idxC <= maximumIndex; idxC++) {
      // The middle loop iterates through all possible source nodes (idxA).
      for (idxA = 1; idxA <= maximumIndex; idxA++) {
        // The inner loop iterates through all possible destination nodes (idxB).
        for (idxB = 1; idxB <= maximumIndex; idxB++) {
          // Update the expense matrix: if a path from idxA to idxB via idxC is shorter, update it.
          expenseMatrix[idxA][idxB] = findMinimumValue(
            expenseMatrix[idxA][idxB] || infinityValue, // Current direct path (or assumed infinity)
            (expenseMatrix[idxA][idxC] || infinityValue) + (expenseMatrix[idxC][idxB] || infinityValue) // Path via intermediate node idxC
          );

          // Update the duration matrix in the same manner.
          durationMatrix[idxA][idxB] = findMinimumValue(
            durationMatrix[idxA][idxB] || infinityValue, // Current direct path (or assumed infinity)
            (durationMatrix[idxA][idxC] || infinityValue) + (durationMatrix[idxC][idxB] || infinityValue) // Path via intermediate node idxC
          );
        }
      }
    }

    // Read the total number of queries for the current network configuration.
    const numberOfQueries = extractNumericValue(rawData.shift());

    // Process each individual query.
    for (idxA = 0; idxA < numberOfQueries; idxA++) {
      currentDataRow = rawData.shift().split(' ').map(extractNumericValue);
      querySource = currentDataRow[0];
      queryTarget = currentDataRow[1];
      queryMetric = currentDataRow[2]; // 0 for expense, 1 for duration.

      // Use the queryMetric to dynamically select between the expenseMatrix and durationMatrix,
      // then retrieve and output the shortest path value for the specified source and target nodes.
      writeToOutput([expenseMatrix, durationMatrix][queryMetric][querySource][queryTarget]);
    }
  }
}