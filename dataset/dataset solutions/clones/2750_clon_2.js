function displayMessage(contentString) {
    // Outputs the provided string to the standard console.
    console.log(contentString);
}

function executeGraphProcessing(rawInputData) {
    // Clean up leading/trailing whitespace from the raw input.
    rawInputData = rawInputData.trim();
    // rawInputData = rawInputData.split(" "); // Alternative splitting method, currently unused.
    rawInputData = rawInputData.split("\n"); // Split the input into an array of lines.

    // rawInputData = rawInputData.split(" ").map((itemVal) => Number(itemVal)); // Another mapping option, currently commented out.
    // rawInputData = rawInputData.split("\n").map((itemVal) => Number(itemVal)); // Mapping each line to a numerical value.

    var nodeCount = parseInt(rawInputData[0].split(" ")[0]);
    var connectionCount = parseInt(rawInputData[0].split(" ")[1]);

    // Remove the processed header line from the input array.
    rawInputData.shift();

    var adjacencyMap = {}; // Initialize an object to store graph connections.

    // Populate the adjacency map with empty arrays for each node.
    for (var vertexIdx = 1; vertexIdx <= nodeCount; vertexIdx++) {
        adjacencyMap[vertexIdx] = [];
    }

    // Process each connection (edge) and build the adjacency list.
    for (var edgeIdx = 0; edgeIdx < connectionCount; edgeIdx++) {
        var firstEndpoint = rawInputData[edgeIdx].split(" ")[0];
        var secondEndpoint = rawInputData[edgeIdx].split(" ")[1];

        adjacencyMap[firstEndpoint].push(secondEndpoint);
        adjacencyMap[secondEndpoint].push(firstEndpoint); // Add connections in both directions for an undirected graph.
    }

    // Check if every node has an even degree (number of connections).
    for (var currentVertex = 1; currentVertex <= nodeCount; currentVertex++) {
        if (adjacencyMap[currentVertex].length % 2 === 1) {
            // If any node has an odd degree, output -1 and terminate.
            console.log("-1");
            return;
        }
    }

    // This loop appears to be a placeholder or for future expansion.
    for (var placeholderIdx = 1; placeholderIdx <= connectionCount; placeholderIdx++) {
        /* No operations performed within this iteration cycle. */
    }
}

// Read input from standard input and pass it to the main processing function.
executeGraphProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));