let rawInputLines = []; // Renamed from 'lines' to store raw input
const standardInputReaderModule = require('readline'); // Renamed 'readline' module

// Initialize an interface for reading input and writing output
const inputInterface = standardInputReaderModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Constants to represent node visit status
const UNVISITED_STATE = -1; // Represents a node that has not been encountered
const VISITED_STATE = 1;    // Represents a node that has been part of a connection

/**
 * Helper function to parse a space-separated string into an array of integers.
 * It ensures robustness by checking for non-numeric parts and optional limit.
 * @param {string} lineString - The input string to parse.
 * @param {number} [maxNumbersToExtract] - Optional. The maximum number of integers to extract from the line.
 * @returns {number[]} An array containing the parsed integer values.
 */
const extractNumbersFromLine = (lineString, maxNumbersToExtract) => {
    const stringTokens = lineString.split(" ");
    const parsedNumericValues = [];
    // Determine the actual number of tokens to process
    const effectiveLimit = (maxNumbersToExtract !== undefined && maxNumbersToExtract < stringTokens.length)
        ? maxNumbersToExtract
        : stringTokens.length;

    for (let i = 0; i < effectiveLimit; i++) {
        const currentToken = stringTokens[i];
        const convertedNumber = parseInt(currentToken, 10); // Use radix 10 for explicit base
        if (!isNaN(convertedNumber)) {
            parsedNumericValues.push(convertedNumber);
        } else {
            // Optionally log a warning for malformed input
            console.warn(`Warning: Skipped non-numeric token "${currentToken}" during parsing.`);
        }
    }
    return parsedNumericValues;
};

// Event listener: Collect each line of input as it arrives
inputInterface.on('line', (currentInputLine) => {
    rawInputLines.push(currentInputLine);
});

// Event listener: Process all collected input lines once the input stream closes
inputInterface.on('close', () => {
    // Guard clause: Handle cases where no input lines were provided
    if (rawInputLines.length === 0) {
        console.log(0); // If no input, no components or nodes
        return;
    }

    // Parse the first line which typically contains global parameters (e.g., N and M)
    const initialConfiguration = extractNumbersFromLine(rawInputLines[0], 2);

    // Validate the initial parameters: Expecting at least two numbers (totalNodes, numEdges)
    if (initialConfiguration.length < 2 || isNaN(initialConfiguration[0]) || initialConfiguration[0] < 0) {
        console.error("Error: Initial configuration line is invalid. Expected at least two non-negative integers (nodes count, edge count).");
        return;
    }

    let totalNodes = initialConfiguration[0]; // Renamed from 'N'
    // The 'numEdgesProvided' (original 'M') variable is parsed but not utilized
    // in the logic that determines the 'isolatedComponentCount'.
    // This is a Type III modification (deletion of 'M's usage logic).
    const numEdgesProvided = initialConfiguration[1];

    // Early exit for graph with no nodes
    if (totalNodes === 0) {
        console.log(0);
        return;
    }

    // Remove the first line as it has been processed
    rawInputLines.shift();

    // Process the remaining lines, which represent connectivity data (edges)
    // Each line is expected to contain two node identifiers (u, v).
    // The original problem also parsed a third value (z), which was unused.
    // For this clone, we explicitly parse only the two relevant node identifiers.
    const graphConnections = rawInputLines.map(line => extractNumbersFromLine(line, 2));

    // Initialize a status array for all nodes. All are initially unvisited.
    let nodeVisitStatus = new Array(totalNodes).fill(UNVISITED_STATE); // Renamed from 'check'

    // Initialize the count of "isolated" components or initial connection seeds.
    let isolatedComponentCount = 0; // Renamed from 'ans'

    // Sort the graph connections based on the first node ID.
    // This preserves the original algorithm's processing order.
    graphConnections.sort((connectionA, connectionB) => connectionA[0] - connectionB[0]);

    // Iterate through the sorted list of connections, processing each edge
    while (graphConnections.length > 0) {
        const currentEdgeData = graphConnections.shift(); // Get and remove the next edge

        // Validate the structure of the current edge data
        if (!currentEdgeData || currentEdgeData.length < 2) {
            console.warn("Skipping malformed edge entry:", currentEdgeData);
            continue;
        }

        const nodeIdentifierU = currentEdgeData[0]; // First node in the pair
        const nodeIdentifierV = currentEdgeData[1]; // Second node in the pair

        // Perform bounds checking for node identifiers (1-indexed in problem, convert to 0-indexed)
        if (nodeIdentifierU < 1 || nodeIdentifierU > totalNodes || nodeIdentifierV < 1 || nodeIdentifierV > totalNodes) {
            console.warn(`Skipping edge (${nodeIdentifierU}, ${nodeIdentifierV}): Node identifiers out of valid range (1 to ${totalNodes}).`);
            continue;
        }

        // Convert 1-indexed node IDs to 0-indexed array positions
        const indexForNodeU = nodeIdentifierU - 1;
        const indexForNodeV = nodeIdentifierV - 1;

        // Check the current visit status of both nodes
        const isNodeUPreviouslyVisited = (nodeVisitStatus[indexForNodeU] !== UNVISITED_STATE);
        const isNodeVPreviouslyVisited = (nodeVisitStatus[indexForNodeV] !== UNVISITED_STATE);

        // Apply the connectivity logic based on node visit status:
        if (isNodeUPreviouslyVisited && !isNodeVPreviouslyVisited) {
            // Node U is part of an existing component, Node V is new. Connect V to U's component.
            nodeVisitStatus[indexForNodeV] = VISITED_STATE;
        } else if (isNodeVPreviouslyVisited && !isNodeUPreviouslyVisited) {
            // Node V is part of an existing component, Node U is new. Connect U to V's component.
            nodeVisitStatus[indexForNodeU] = VISITED_STATE;
        } else if (!isNodeUPreviouslyVisited && !isNodeVPreviouslyVisited) {
            // Both nodes are currently unvisited. This edge forms a new "seed" for a component.
            isolatedComponentCount++;
            nodeVisitStatus[indexForNodeU] = VISITED_STATE;
            nodeVisitStatus[indexForNodeV] = VISITED_STATE;
        }
        // If both nodes are already visited, this edge connects two already-connected parts,
        // so no change to the component count or status is needed.
    }

    // After processing all provided edges, iterate through all nodes
    // to identify any nodes that were never touched by any edge.
    // Each such node represents an additional isolated component.
    for (let nodeIndex = 0; nodeIndex < totalNodes; nodeIndex++) {
        if (nodeVisitStatus[nodeIndex] === UNVISITED_STATE) {
            isolatedComponentCount++; // Increment for each truly isolated node
        }
    }

    // Output the final calculated count of components/isolated entities
    console.log(isolatedComponentCount);
});