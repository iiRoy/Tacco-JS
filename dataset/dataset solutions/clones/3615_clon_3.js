const parseNumericLine = (lineContent) => {
    return lineContent.split(/\s+/).filter(Boolean).map(val => Number(val));
};

function ProcessGraphQueries(rawDataInput) {
    // Process the raw input string into an array of trimmed, non-empty lines.
    const inputLines = rawDataInput.split('\n').map(line => line.trim()).filter(Boolean);

    // The first line contains global parameters: total node count, total edge count, and total query count.
    const [totalNodeCount, totalEdgeCount, totalQueryCount] = parseNumericLine(inputLines[0]);

    // Initialize the graph's adjacency list. Using `Array.from` for explicit initialization
    // and making it 1-indexed to match problem statement (nodes from 1 to N).
    const graphAdjacencyList = Array.from({ length: totalNodeCount + 1 }, () => []);

    // Populate the adjacency list with edges defined in the input.
    // Each line from index 1 up to `totalEdgeCount` describes an edge.
    for (let currentEdgeIndex = 0; currentEdgeIndex < totalEdgeCount; currentEdgeIndex++) {
        const [sourceNode, destinationNode] = parseNumericLine(inputLines[currentEdgeIndex + 1]);
        graphAdjacencyList[sourceNode].push(destinationNode);
    }

    // After all edges are added, sort each node's adjacency list.
    // This is crucial for the binary search optimization used in query processing.
    for (let nodeIdentifier = 1; nodeIdentifier <= totalNodeCount; nodeIdentifier++) {
        graphAdjacencyList[nodeIdentifier].sort((nodeA, nodeB) => nodeA - nodeB);
    }

    // Array to store the computed results for each query.
    const collectedQueryResults = [];

    // Helper function to perform a binary search and count elements less than or equal to a target.
    // This is a re-implementation of the original `upper_bound` logic, made more explicit.
    const countElementsLessThanOrEqualTo = (
        sortedNumericArray, // The array to search within.
        targetThreshold     // The maximum value to count elements up to.
    ) => {
        let lowPointer = 0;
        let highPointer = sortedNumericArray.length; // Exclusive upper bound for binary search.

        while (lowPointer < highPointer) {
            const midPoint = Math.floor((lowPointer + highPointer) / 2);
            if (sortedNumericArray[midPoint] <= targetThreshold) {
                lowPointer = midPoint + 1; // Element is within or below threshold, potentially more to the right.
            } else {
                highPointer = midPoint; // Element is above threshold, search in the left half.
            }
        }
        // At this point, `lowPointer` (or `highPointer`) represents the count of elements
        // in `sortedNumericArray` that are less than or equal to `targetThreshold`.
        return lowPointer;
    };

    // Determine the starting index for query lines in the input.
    const querySectionStartIndex = totalEdgeCount + 1;

    // Iterate through each query and calculate its result.
    for (let currentQueryIndex = 0; currentQueryIndex < totalQueryCount; currentQueryIndex++) {
        const [queryRangeStartNode, queryRangeEndNode] = parseNumericLine(inputLines[querySectionStartIndex + currentQueryIndex]);

        let currentSumOfRelevantNeighbors = 0; // Accumulator for the current query's result.

        // Loop through each node within the specified query range [queryRangeStartNode, queryRangeEndNode].
        for (let nodeInQueryRange = queryRangeStartNode; nodeInQueryRange <= queryRangeEndNode; nodeInQueryRange++) {
            // Retrieve the sorted list of neighbors for the current node.
            const neighborsOfCurrentNode = graphAdjacencyList[nodeInQueryRange];

            // Use the binary search helper to count how many neighbors are within the query's end range.
            currentSumOfRelevantNeighbors += countElementsLessThanOrEqualTo(
                neighborsOfCurrentNode,
                queryRangeEndNode
            );
        }
        collectedQueryResults.push(currentSumOfRelevantNeighbors);
    }

    // Output the collected results, each on a new line.
    // Add a check for results existence before joining.
    if (collectedQueryResults.length > 0) {
        console.log(collectedQueryResults.join('\n'));
    } else {
        // Provide a message if no queries were processed or results were generated.
        console.log("No query results available for display.");
    }
}

// Self-executing anonymous function to handle file input and program execution.
(function executeGraphAnalysisProgram() {
    try {
        // Read input from standard input, typically a file in competitive programming environments.
        const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
        // Call the main processing function with the file content.
        ProcessGraphQueries(fileContent);
    } catch (fileReadError) {
        // Log an error if file reading fails, providing more context.
        console.error("Failed to read input from /dev/stdin:", fileReadError.message);
        // In a real application, you might want to exit the process or provide default behavior.
        // process.exit(1);
    }
})();