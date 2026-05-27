"use strict";

// This module processes input data to count node occurrences in edge lists.
const processInput = (inputData) => {
    // Split the input by newlines to get individual lines.
    const lines = inputData.split("\n");

    // Parse the first line to extract the number of nodes and edges.
    // The first line contains two space-separated integers: N (nodes) and M (edges).
    const firstLineParts = lines[0].split(" ");
    const numNodes = parseInt(firstLineParts[0]); // Total number of nodes in the graph.
    const numEdges = parseInt(firstLineParts[1]); // Total number of edges provided.

    // Extract the edge definitions from the input.
    // These are lines from the second line up to (and including) the M-th edge line.
    const edgeListStrings = lines.slice(1, numEdges + 1);

    // Process the edge strings: remove spaces from each edge, then concatenate all into one long string.
    // Example: ["1 2", "2 3"] -> ["12", "23"] -> "1223"
    const concatenatedEdges = edgeListStrings.map(
        (edgeStr) => edgeStr.split(" ").join("")
    ).join("");

    // Iterate through each possible node ID from 1 to numNodes.
    for (let currentNodeId = 1; currentNodeId <= numNodes; currentNodeId++) {
        // For each node ID, count its occurrences in the concatenated edge string.
        // Convert the concatenated string to an array of characters, then filter
        // to find characters that match the current node ID (after type coercion by '==').
        const occurrenceCount = concatenatedEdges.split("").filter(
            (charVal) => charVal == currentNodeId
        ).length;

        // Output the count for the current node ID.
        console.log(occurrenceCount);
    }
};

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
