const processingOptions = { sourcePath: '/dev/stdin', lineSeparator: '\n' }; // Default configuration for standard input

let rawInputData = require('node:fs').readFileSync(processingOptions.sourcePath, 'utf8') // Acquire file data using UTF-8 encoding
    .trim() // Eliminate leading and trailing whitespace characters
    .split(processingOptions.lineSeparator); // Divide the content into an array of strings at each newline

const totalVertices = parseInt(rawInputData.shift(), 10); // Parse the first line to get the total number of graph nodes

let connectionMap = {}; // Initialize an empty object to represent the graph's adjacency structure

for (let lineIndex in rawInputData)
{
    let lineSegments = rawInputData[lineIndex].split(' '); // Split each subsequent line by space to get components
    let currentVertexId = lineSegments.shift(); // The first component is the current vertex's identifier
    lineSegments.shift(); // Discard the second component (often an empty string or redundant identifier)
    connectionMap[currentVertexId] = lineSegments; // Assign the remaining components as neighbors to the current vertex
}

for (const vertexKey in connectionMap) {
    connectionMap[vertexKey].sort(
        function (firstElement, secondElement)
        {
            return parseInt(firstElement, 10) - parseInt(secondElement, 10); // Sort neighbors numerically in ascending order
        }
    );
}

let entryTimestamps = {}; // Stores the time when a node is first visited (discovery time)
let exitTimestamps = {};  // Stores the time when all neighbors of a node have been visited (finish time)
let currentTimestamp = 1; // Global counter for tracking time during DFS traversal
let traversalPath = [];   // A stack to keep track of the current DFS path
let activeNode = '1';     // The starting node for the Depth-First Search

do {
    if (!Object.prototype.hasOwnProperty.call(entryTimestamps, activeNode)) {
        entryTimestamps[activeNode] = currentTimestamp; // If not visited, record discovery time
    }

    let nextNeighborIndex = null;
    let currentNeighbors = connectionMap[activeNode];

    for (let neighborIterator in currentNeighbors) {
        if (!Object.prototype.hasOwnProperty.call(entryTimestamps, currentNeighbors[neighborIterator])) {
            nextNeighborIndex = neighborIterator; // Find the index of the first unvisited neighbor
            break;
        }
    }

    if (nextNeighborIndex !== null) {
        traversalPath.push(activeNode); // Push the current node onto the stack to backtrack later
        activeNode = currentNeighbors[nextNeighborIndex]; // Move to the newly discovered neighbor
        currentTimestamp++; // Advance the global timer
    }
    else
    {
        currentTimestamp++; // Advance the global timer
        exitTimestamps[activeNode] = currentTimestamp; // Record the finish time for the current node
        activeNode = traversalPath.pop(); // Backtrack by popping the last node from the stack
    }
} while (traversalPath.length > 0); // Continue the DFS until the traversal stack is empty

currentTimestamp++; // Increment timer one last time for the final node
exitTimestamps[activeNode] = currentTimestamp; // Record finish time for the very last processed node

for (let vertexIterator = 1; vertexIterator <= totalVertices; vertexIterator++) {
    process.stdout.write(
        vertexIterator + ' ' +
        entryTimestamps[vertexIterator] + ' ' +
        exitTimestamps[vertexIterator] +
        '\n'
    ); // Output the vertex ID along with its discovery and finish times
}