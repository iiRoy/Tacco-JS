const processInputData = (rawDataBlock) => {
    // Split the entire input string into individual lines, removing any leading/trailing whitespace.
    const dataLines = rawDataBlock.trim().split('\n');

    // Basic validation: Ensure we have at least the parameter line and the heights line.
    if (dataLines.length < 2) {
        // In a production system, this might throw an error or handle a default case.
        console.error("Input data is insufficient. Expected at least two lines for problem parameters and heights.");
        return;
    }

    // Parse the first line to extract the number of locations (nodes) and connections (edges).
    const [rawLocationsCount, rawConnectionsCount] = dataLines[0].split(' ');
    const numLocations = parseInt(rawLocationsCount, 10);
    const numConnections = parseInt(rawConnectionsCount, 10);

    // Parse the second line to get the height values for each location.
    // These are 1-indexed in problem description but stored in a 0-indexed array.
    const locationElevations = dataLines[1].split(' ').map(valStr => parseInt(valStr, 10));

    // Extract the remaining lines which define the connections between locations.
    // The slice operation naturally handles cases where there might be an empty line at the end
    // (which `trim()` and `split('\n')` might still produce as an empty string element).
    const rawConnectionEntries = dataLines.slice(2);

    // Convert raw connection strings into an array of numeric pairs.
    const connectionPairs = rawConnectionEntries.map(line => {
        const parts = line.split(' ');
        // Validate each connection line to ensure it has two parts.
        if (parts.length !== 2) {
            console.warn(`Skipping malformed connection entry: "${line}". Expected two space-separated numbers.`);
            return null; // Mark invalid entries for filtering.
        }
        return parts.map(partStr => parseInt(partStr, 10));
    }).filter(entry => entry !== null); // Remove any invalid connection entries.

    // Call the core logic function with the parsed data and print its result.
    console.log(determineOptimalSpots(numLocations, numConnections, locationElevations, connectionPairs));
};

// This function identifies and counts "optimal" locations based on specific height and connectivity rules.
const determineOptimalSpots = (numLocations, numConnections, locationElevations, connectionPairs) => {
    // If there are no locations to check, the count of optimal spots is zero.
    if (numLocations <= 0) {
        return 0;
    }

    // Initialize an adjacency list to represent the road network.
    // We use `numLocations + 1` size to allow for 1-based indexing of locations directly.
    const networkGraph = Array.from({ length: numLocations + 1 }, () => []);

    // Populate the network graph with bidirectional connections.
    // Each entry in connectionPairs represents a direct link between two locations.
    for (const currentLink of connectionPairs) {
        // Ensure the link is a valid array of two numbers.
        if (!Array.isArray(currentLink) || currentLink.length !== 2) {
            console.warn("Encountered an invalid connection format in connectionPairs; skipping.");
            continue;
        }

        const [startNode, endNode] = currentLink;

        // Validate that node indices are within the expected range (1 to numLocations).
        const isValidStart = startNode > 0 && startNode <= numLocations;
        const isValidEnd = endNode > 0 && endNode <= numLocations;

        if (isValidStart && isValidEnd) {
            // Add the connection to both nodes' lists as roads are bidirectional.
            networkGraph[startNode].push(endNode);
            networkGraph[endNode].push(startNode);
        } else {
            console.warn(`Skipping connection [${startNode}, ${endNode}] due to out-of-bounds node index.`);
        }
    }

    let optimalLocationCounter = 0; // This variable will store our final result.

    // Iterate through each location, from 1 to numLocations, to assess its optimality.
    for (let currentLocId = 1; currentLocId <= numLocations; ++currentLocId) {
        const adjacentLocations = networkGraph[currentLocId];
        // Adjust for 0-based array indexing when accessing heights.
        const currentLocHeight = locationElevations[currentLocId - 1];

        // Criterion 1: If a location has no connections, it is considered optimal.
        if (adjacentLocations.length === 0) {
            optimalLocationCounter++;
            continue; // Move to the next location as this one is settled.
        }

        // Criterion 2: Find the maximum height among all directly connected neighbors.
        // Initialize with a value lower than any possible valid height (heights are positive).
        let highestNeighborElevation = -Infinity;
        let hasValidNeighbors = false; // Flag to confirm at least one valid neighbor exists.

        for (const neighborId of adjacentLocations) {
            // Ensure the neighbor's ID is valid before accessing its height.
            if (neighborId > 0 && neighborId <= numLocations) {
                const neighborHeight = locationElevations[neighborId - 1];
                if (neighborHeight > highestNeighborElevation) {
                    highestNeighborElevation = neighborHeight;
                }
                hasValidNeighbors = true;
            } else {
                console.warn(`Location ${currentLocId} has an invalid neighbor ID ${neighborId}. Ignoring this neighbor.`);
            }
        }

        // Only compare if there were actual valid neighbors found.
        // If the current location's height is strictly greater than its tallest neighbor, it's optimal.
        if (hasValidNeighbors && currentLocHeight > highestNeighborElevation) {
            optimalLocationCounter++;
        }
    }

    return optimalLocationCounter;
};

// --- Standard boilerplate for reading input from stdin ---
// This section should typically remain untouched to ensure compatibility with online judges.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));