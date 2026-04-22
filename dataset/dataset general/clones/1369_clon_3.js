/*
 * This module provides utilities for parsing graph definitions and validating results
 * from a graph analysis algorithm, specifically for computing dominators and dominance frontiers.
 * It's designed to work with a graph algorithm library for strongly connected components (SCC)
 * or similar dominator tree computations.
 */

const { strictEqual: assertStrictEquality } = require('assert');
const sccAlgorithm = require('../path/to/scc'); // Adjusted path for Type III change

/**
 * Represents a vertex within a graph structure.
 * Each vertex has an identifier, a set of outgoing edges (adjacencies),
 * and properties for dominator tree computations.
 */
class GraphVertex {
  /**
   * Constructs a new GraphVertex.
   * @param {string} vertexId - A unique identifier for this vertex.
   */
  constructor(vertexId = 'UNKNOWN_ID') {
    this.vertexId = vertexId;
    this.adjacencies = new Set(); // Stores IDs of connected vertices. Using Set for uniqueness.

    // Properties related to dominator tree and frontier.
    this.immediateDominator = null;
    this.dominanceTreeChildren = null;
    this.dominanceFrontier = null;

    // Optional: A flag that could be used for traversal algorithms.
    this._visitedState = false;
  }
}

/**
 * Decodes a graph definition provided as a string into a list of GraphVertex objects.
 * The input string is expected to represent edges in the format "source -> target1, target2".
 *
 * @param {string} entryNodeId - The identifier of the graph's entry node.
 * @param {string} sourcePayload - The raw string input representing the graph.
 * @returns {Array<GraphVertex>} An array of GraphVertex objects, sorted with the entry node first.
 */
function decodeGraphInput(entryNodeId, sourcePayload) {
  // Basic input validation
  if (!sourcePayload || typeof sourcePayload !== 'string') {
    console.warn('Warning: Empty or invalid source payload provided for graph decoding.');
    return [];
  }

  // Clean the source string by removing common function wrapper artifacts.
  let cleanedSource = sourcePayload.toString()
                                   .replace(/^\s*function\s*[^\{]*\{\/\*|\*\/\}$/g, '')
                                   .trim();

  const inputLines = cleanedSource.split(/[\r\n]+/g); // Split by various newline types
  const vertexRegistry = new Map(); // Maps vertex ID to GraphVertex object

  /**
   * Retrieves an existing GraphVertex or creates a new one if it doesn't exist.
   * @param {string} identifier - The ID of the vertex.
   * @returns {GraphVertex} The GraphVertex object corresponding to the identifier.
   */
  const fetchOrCreateVertex = (identifier) => {
    if (!vertexRegistry.has(identifier)) {
      vertexRegistry.set(identifier, new GraphVertex(identifier));
    }
    return vertexRegistry.get(identifier);
  };

  const edgePattern = /^([\w\d]+)\s*->\s*((?:[\w\d]+(?:\s*,\s*)?)*)\s*$/;

  for (const currentLine of inputLines) {
    const trimmedLine = currentLine.trim();
    if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('#')) {
      // Skip empty lines or comment lines
      continue;
    }

    const lineMatch = trimmedLine.match(edgePattern);
    if (!lineMatch) {
      // console.warn(`Warning: Skipping malformed line in graph input: "${trimmedLine}"`);
      continue;
    }

    const currentVertexId = lineMatch[1];
    const successorIdsString = lineMatch[2];

    const currentVertex = fetchOrCreateVertex(currentVertexId);

    // Process successors, handling empty successor list gracefully
    if (successorIdsString) {
      const successorIdentifiers = successorIdsString.split(/\s*,\s*/g);
      for (const succId of successorIdentifiers) {
        if (succId) { // Ensure no empty strings from split
          currentVertex.adjacencies.add(succId);
        }
      }
    }
  }

  // Convert the map values to an array and sort them.
  const allVertices = Array.from(vertexRegistry.values());

  // Sort: entry node first, then by ID.
  allVertices.sort((vertexA, vertexB) => {
    if (vertexA.vertexId === entryNodeId) return -1;
    if (vertexB.vertexId === entryNodeId) return 1;
    return vertexA.vertexId.localeCompare(vertexB.vertexId);
  });

  return allVertices;
}

/**
 * Formats the graph analysis results (dominator tree and dominance frontier)
 * into a human-readable string.
 *
 * @param {Array<GraphVertex>} processedVertices - An array of GraphVertex objects
 *                                                 after dominator analysis.
 * @returns {string} A formatted string representing the IDOM and DF results.
 */
function formatGraphResults(processedVertices) {
  if (!processedVertices || processedVertices.length === 0) {
    return 'IDOM:\n\nDF:\n';
  }

  const domTreeLines = [];
  const dfLines = [];

  for (const vert of processedVertices) {
    // Process Dominator Tree Children
    if (vert.dominanceTreeChildren && vert.dominanceTreeChildren.length > 0) {
      const sortedChildren = [...vert.dominanceTreeChildren].sort().join(', ');
      domTreeLines.push(`  ${vert.vertexId} -> ${sortedChildren}`);
    }

    // Process Dominance Frontier
    if (vert.dominanceFrontier && vert.dominanceFrontier.length > 0) {
      const sortedFrontier = [...vert.dominanceFrontier].sort().join(', ');
      dfLines.push(`  ${vert.vertexId} -> ${sortedFrontier}`);
    }
  }

  const dominatorTreeOutput = domTreeLines.join('\n');
  const dominanceFrontierOutput = dfLines.join('\n');

  return `IDOM:\n${dominatorTreeOutput}\nDF:\n${dominanceFrontierOutput}`;
}

/**
 * Normalizes a multi-line string for comparison by removing leading whitespace
 * from each line and filtering out empty lines.
 *
 * @param {string} inputString - The string to normalize.
 * @returns {string} The normalized string.
 */
function normalizeTextForComparison(inputString) {
  if (typeof inputString !== 'string') {
    return ''; // Handle non-string input gracefully
  }
  const lines = inputString.split(/[\r\n]+/g);
  const cleanedLines = [];
  for (const line of lines) {
    const trimmedLine = line.trimStart(); // Remove leading whitespace
    if (trimmedLine.length > 0) { // Keep only non-empty lines
      cleanedLines.push(trimmedLine);
    }
  }
  return cleanedLines.join('\n');
}

/**
 * Validates the output of a graph analysis algorithm against an expected result.
 * It parses the input graph, runs the analysis, formats the actual output,
 * and compares it to the cleaned expected output.
 *
 * @param {string} startNodeIdentifier - The ID of the graph's entry node.
 * @param {string} rawInputGraph - The raw string input defining the graph.
 * @param {string} expectedOutputText - The expected formatted output string.
 */
module.exports.validateResult = function validateResult(startNodeIdentifier, rawInputGraph, expectedOutputText) {
  // Guard clauses for essential inputs
  if (!startNodeIdentifier || !rawInputGraph || !expectedOutputText) {
    throw new Error('Missing essential parameters for result validation (startNodeIdentifier, rawInputGraph, or expectedOutputText).');
  }

  // Step 1: Parse the raw input graph into an array of GraphVertex objects.
  const graphStructure = decodeGraphInput(startNodeIdentifier, rawInputGraph);

  // Step 2: Create and execute the graph analysis algorithm.
  // The 'create' method typically returns a function that processes the graph.
  const graphProcessor = sccAlgorithm.create();
  graphProcessor(graphStructure); // This modifies the 'graphStructure' in place.

  // Step 3: Format the actual results obtained from the processed graph.
  const actualFormattedResult = formatGraphResults(graphStructure);

  // Step 4: Clean the expected output string for robust comparison.
  // This removes any function wrapper and normalizes line endings.
  const cleanedExpectedOutput = expectedOutputText.toString()
                                                  .replace(/^\s*function\s*[^\{]*\{\/\*|\*\/\}$/g, '')
                                                  .trim();

  // Step 5: Normalize both actual and expected outputs and assert their equality.
  const normalizedActual = normalizeTextForComparison(actualFormattedResult);
  const normalizedExpected = normalizeTextForComparison(cleanedExpectedOutput);

  assertStrictEquality(normalizedActual, normalizedExpected, 'Graph analysis result mismatch!');
};