"use strict";

// This module processes input data to count occurrences of node identifiers.
const processInputData = (inputStringData) => {
  // Split the entire input by newline characters to get individual lines.
  const lines = inputStringData.split("\n");

  // Parse the first line to extract the total number of nodes (N) and edges (M).
  // The first part of the first line represents the node count.
  const firstLineParts = lines[0].split(" ");
  const totalVertices = parseInt(firstLineParts[0]);
  // The second part of the first line represents the edge count.
  const totalConnections = parseInt(firstLineParts[1]);

  // Extract the connection definitions from the input.
  // These are lines from the second line up to M lines after the first.
  const connectionStrings = lines.slice(1, totalConnections + 1);

  // Process each connection string: remove spaces and then concatenate all into one long string.
  // This effectively creates a single string of all connected nodes.
  const combinedRoutes = connectionStrings
    .map((currentLine) => currentLine.split(" ").join(""))
    .join("");

  // Iterate from 1 up to the total number of vertices (nodes).
  // For each vertex, count its occurrences in the combined routes string.
  for (let vertexIdentifier = 1; vertexIdentifier <= totalVertices; vertexIdentifier++) {
    // Convert the combined routes string into an array of characters,
    // filter to find characters that match the current vertex identifier,
    // and then output the total count of such characters.
    console.log(
      combinedRoutes
        .split("")
        .filter((digitChar) => parseInt(digitChar) === vertexIdentifier)
        .length
    );
  }
};

// Execute the main processing function with data read from standard input.
// Utilize the Node.js 'fs' (file system) module to read the file contents.
const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const textEncoding = "utf8";

processInputData(fileSystemModule.readFileSync(standardInputPath, textEncoding));