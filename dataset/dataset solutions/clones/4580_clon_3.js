const fileSystem = require("fs");

// Utility function to robustly convert a string to an integer.
// Includes basic error handling for non-numeric input.
const obtainNumericValue = (inputStringRepresentation) => {
    const processedValue = parseInt(inputStringRepresentation, 10);
    // Validation: Check if the parsing resulted in a valid number.
    if (isNaN(processedValue)) {
        console.error(`Runtime Error: Encountered invalid numerical input: '${inputStringRepresentation}'.`);
        // In a production system, one might throw an error or exit.
        // For this clone, we'll let subsequent operations potentially fail or handle it.
        return 0; // Return a default value or handle more gracefully.
    }
    return processedValue;
};

// Read all incoming data from the standard input stream.
// The data is decoded as UTF-8 and then segmented into an array of strings,
// where each string represents a line from the input.
const receivedInputDataLines = fileSystem.readFileSync("/dev/stdin", "utf8").split("\n");

// Perform an initial check to ensure there's at least one line of configuration data.
if (receivedInputDataLines.length === 0 || receivedInputDataLines[0].trim().length === 0) {
    console.error("Input Processing Error: No configuration line detected or first line is empty. Cannot proceed.");
    process.exit(1); // Terminate execution due to critical input error.
}

// The first line of input provides the configuration: total number of vertices (N)
// and the total number of edges (M) in the graph, separated by a space.
const graphConfigurationTokens = receivedInputDataLines[0].split(" ");

// Validate that both N and M were provided in the configuration line.
if (graphConfigurationTokens.length < 2) {
    console.error("Input Format Error: Configuration line must specify both vertex count (N) and edge count (M).");
    process.exit(1);
}

// Extract and parse the total number of vertices and edges.
const countOfGraphVertices = obtainNumericValue(graphConfigurationTokens[0]);
const countOfGraphEdges = obtainNumericValue(graphConfigurationTokens[1]);

// Initialize a data structure to store the degree (number of connected edges)
// for each vertex. The array is sized according to the total number of vertices.
// Explicitly populating the array with zeros for a structural modification.
const vertexConnectionDegrees = [];
for (let vertexIdentifier = 0; vertexIdentifier < countOfGraphVertices; ++vertexIdentifier) {
    vertexConnectionDegrees.push(0);
}

// Begin iterating through the input lines that define the edges.
// Each line from the second line onwards (index 1) up to 'countOfGraphEdges'
// represents a single connection between two vertices.
for (let currentEdgeDefinitionIndex = 1; currentEdgeDefinitionIndex <= countOfGraphEdges; ++currentEdgeDefinitionIndex) {
    const edgeDescriptionLine = receivedInputDataLines[currentEdgeDefinitionIndex];

    // Guard clause: Check if the current edge definition line is valid and not empty.
    if (!edgeDescriptionLine || edgeDescriptionLine.trim().length === 0) {
        console.warn(`Data Warning: Edge definition missing or empty on line ${currentEdgeDefinitionIndex + 1}. This edge will be skipped.`);
        continue; // Move to the next edge if the current one is invalid.
    }

    // Split the edge definition line to get the two vertex IDs that it connects.
    const connectedVertexIdStrings = edgeDescriptionLine.split(" ");

    // Validate that exactly two vertex IDs were provided for the current edge.
    if (connectedVertexIdStrings.length < 2) {
        console.warn(`Data Warning: Incomplete edge definition on line ${currentEdgeDefinitionIndex + 1}. Expected two vertex IDs.`);
        continue;
    }

    // Parse the 1-based vertex IDs for the current edge.
    const firstEndpointVertex = obtainNumericValue(connectedVertexIdStrings[0]);
    const secondEndpointVertex = obtainNumericValue(connectedVertexIdStrings[1]);

    // Comprehensive bounds checking for vertex IDs.
    // Vertex IDs are typically 1-based in problem descriptions but 0-based in arrays.
    const isFirstVertexValid = firstEndpointVertex >= 1 && firstEndpointVertex <= countOfGraphVertices;
    const isSecondVertexValid = secondEndpointVertex >= 1 && secondEndpointVertex <= countOfGraphVertices;

    if (!isFirstVertexValid || !isSecondVertexValid) {
        console.warn(`Data Warning: Edge on line ${currentEdgeDefinitionIndex + 1} connects to out-of-bounds vertex ID(s) (${firstEndpointVertex}, ${secondEndpointVertex}). Skipping this edge.`);
        continue;
    }

    // Increment the degree count for both vertices involved in this edge.
    // Adjusting from 1-based vertex IDs to 0-based array indices.
    vertexConnectionDegrees[firstEndpointVertex - 1]++;
    vertexConnectionDegrees[secondEndpointVertex - 1]++;
}

// Prepare the final output by joining the calculated vertex degrees.
// Each degree count will be presented on a new line.
const finalOutputString = vertexConnectionDegrees.join("\n");

// Display the computed degree of each vertex to the standard output.
console.log(finalOutputString);