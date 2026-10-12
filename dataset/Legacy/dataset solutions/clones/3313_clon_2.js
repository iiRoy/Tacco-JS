'use strict';

// This script processes graph data from standard input to find a specific path-related metric.
console.log(
  (function(inputStr) {
    // Parse the raw input string into a structured array of numbers.
    // First, trim any leading/trailing whitespace.
    // Then, split the string into individual lines.
    // For each line, split it by spaces and convert each segment to an integer.
    const parsedData = inputStr
      .trim()
      .split('\n')
      .map((rowStr) => rowStr.split(' ').map((valStr) => valStr | 0));

    // Extract the number of nodes (N) and the number of edges (M) from the first line of input.
    const numNodes = parsedData[0][0];
    const numEdges = parsedData[0][1];

    // Initialize arrays to store the starting and ending nodes for each edge.
    const startNodes = [];
    const endNodes = [];

    // Populate the startNodes and endNodes arrays using the subsequent lines of input.
    // The input format assumes edges start from the second line (index 1).
    for (let edgeIdx = 0; edgeIdx < numEdges; edgeIdx++) {
      startNodes.push(parsedData[1 + edgeIdx][0]); // The first element of the line is the start node.
      endNodes.push(parsedData[1 + edgeIdx][1]); // The second element of the line is the end node.
    }

    // Initialize a 2D dynamic programming table.
    // The table dimensions are (numEdges + 1) by (numNodes + 1).
    // All cells are initially filled with zero.
    const dynamicProg = Array(numEdges + 1)
      .fill(0)
      .map((_unused) => Array(numNodes + 1).fill(0));

    // Iterate through the edges to populate the DP table.
    // The outer loop represents considering up to 'edgeIdx' edges.
    for (let edgeIdx = 1; edgeIdx <= numEdges; edgeIdx++) {
      // The inner loop iterates through all available edges in the input.
      for (let currentEdgeIdx = 0; currentEdgeIdx < numEdges; currentEdgeIdx++) {
        // Update the DP table:
        // dynamicProg[edgeIdx][endNodes[currentEdgeIdx]] represents the maximum value
        // reachable at 'endNodes[currentEdgeIdx]' using up to 'edgeIdx' edges.
        // It's updated by taking the maximum of its current value and
        // (the value at 'startNodes[currentEdgeIdx]' using 'edgeIdx - 1' edges, plus one).
        dynamicProg[edgeIdx][endNodes[currentEdgeIdx]] = Math.max(
          dynamicProg[edgeIdx][endNodes[currentEdgeIdx]],
          dynamicProg[edgeIdx - 1][startNodes[currentEdgeIdx]] + 1,
        );
      }
    }

    // After filling the DP table, the result is the maximum value in the last row (dynamicProg[numEdges]).
    // This maximum value is then converted to a string before being returned.
    return Math.max(...dynamicProg[numEdges]).toString();
  })(require('fs').readFileSync('/dev/stdin', 'utf8')),
);
