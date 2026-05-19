"use strict";

// Primary function to process the given input data
const processInput = (inputDataString) => {
  // Normalize and split the input string into individual lines
  let processedLines = inputDataString.trim().split("\n");

  // Extract the number of graph vertices and queries from the first line
  const [vertexCountStr, queryCountStr] = processedLines[0].split(" ");
  const vertexCount = parseInt(vertexCountStr);
  const queryCount = parseInt(queryCountStr);

  // Parse the edge definitions (connections between vertices)
  const edgeDefinitions = processedLines.slice(1, vertexCount).map((line) => line.split(" "));
  // Parse the score query definitions (which vertex gets how many points)
  const scoreQueries = processedLines.slice(vertexCount, vertexCount + 1 + queryCount).map((line) => line.split(" "));

  // Initialize an array to hold all the graph's vertex objects
  const graphVertices = [];

  // Create and populate the graphVertices array with new GraphVertex instances
  for (let vertexIndex = 1; vertexIndex <= vertexCount; vertexIndex++) {
    graphVertices.push(new GraphVertex(vertexIndex));
  }

  // Establish the hierarchical parent-child relationships among vertices
  for (let edgeIdx = 0; edgeIdx < vertexCount - 1; edgeIdx++) {
    const parentVertexId = parseInt(edgeDefinitions[edgeIdx][0]) - 1;
    const childVertexId = parseInt(edgeDefinitions[edgeIdx][1]) - 1;
    graphVertices[parentVertexId].addChildVertex(graphVertices[childVertexId]);
  }

  // Apply initial scores to specific vertices based on the provided queries
  for (let queryIdx = 0; queryIdx < queryCount; queryIdx++) {
    const targetVertexId = parseInt(scoreQueries[queryIdx][0]) - 1;
    const scoreValue = scoreQueries[queryIdx][1];
    graphVertices[targetVertexId].addScore(scoreValue);
  }

  // Propagate scores from each parent vertex down to its immediate children
  for (let vertexIdx = 0; vertexIdx < vertexCount; vertexIdx++) {
    graphVertices[vertexIdx].propagateScoresToChildren();
  }

  // Collect the final accumulated scores for all vertices
  const finalScores = [];
  for (let vertexIdx = 0; vertexIdx < vertexCount; vertexIdx++) {
    finalScores.push(graphVertices[vertexIdx].currentScore);
  }

  // Output the final scores as a space-separated string
  console.log(finalScores.join(" "));
};

// Definition for a GraphVertex class, representing a node in the graph
class GraphVertex {
  // Constructor to set up a new vertex instance
  constructor(vertexIdentifier) {
    this.vertexIdentifier = vertexIdentifier; // A unique identifier for this vertex
    this.parentVertex = null; // Reference to this vertex's parent in the hierarchy
    this.childVertices = []; // An array to store references to this vertex's children
    this.currentScore = 0; // The accumulated score for this vertex
  }

  // Method to add another vertex as a child of this vertex
  addChildVertex(childVertexInstance) {
    this.childVertices.push(childVertexInstance);
    childVertexInstance.parentVertex = this; // Set this vertex as the child's parent
  }

  // Method to increment this vertex's score by a given amount
  addScore(scoreAmountToAdd) {
    this.currentScore += parseInt(scoreAmountToAdd);
  }

  // Method to distribute this vertex's current score to its direct children
  propagateScoresToChildren() {
    // Iterate through each child vertex
    for (let currentChild of this.childVertices) {
      // Add this vertex's score to the child's score
      currentChild.addScore(this.currentScore);
    }
  }
}

// Read input from standard input and initiate the processing
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
