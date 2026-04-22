// Helper function to determine the canonical representative of a set within a Union-Find structure.
// It applies path compression during the lookup to flatten the tree for future queries.
function findSetRepresentative(parentDataStore, elementId) {
    // Node IDs are typically 1-based, while array indices are 0-based.
    // Adjust elementId to array index.
    const arrayIndex = elementId - 1;

    // If an element's entry in the parent data store is itself, it means it's the root (representative)
    if (parentDataStore[arrayIndex] === elementId) {
        return elementId;
    }

    // Otherwise, recursively find the representative of its parent.
    // During the return, update the current element's parent directly to the ultimate representative (path compression).
    parentDataStore[arrayIndex] = findSetRepresentative(parentDataStore, parentDataStore[arrayIndex]);
    return parentDataStore[arrayIndex];
}

// Helper function to merge two sets in a Union-Find data structure.
// It connects the components of two elements by updating their representatives.
function uniteSets(parentDataStore, elementA, elementB) {
    // First, find the current representatives for both elements.
    let representativeA = findSetRepresentative(parentDataStore, elementA);
    let representativeB = findSetRepresentative(parentDataStore, elementB);

    // If the representatives are already the same, the elements are in the same set,
    // so no union operation is needed.
    if (representativeA !== representativeB) {
        // To maintain consistency and potentially optimize tree structure,
        // we can choose to make the representative with the smaller ID the new parent.
        // This is a simple form of union by rank/size where smaller ID is preferred.
        if (representativeA < representativeB) {
            parentDataStore[representativeB - 1] = representativeA;
        } else {
            parentDataStore[representativeA - 1] = representativeB;
        }
        return true; // Indicates that a successful union occurred.
    }
    return false; // Indicates no union was performed (elements were already connected).
}

// The primary function for analyzing interconnected transportation networks.
// It determines the size of combined connectivity components for each node.
function analyzeTransportationNetworks(inputDataLines) {
    // Parse the initial configuration parameters from the first line of input.
    // These parameters define the total number of nodes and the counts of railway and road connections.
    const configurationValues = inputDataLines[0].split(' ').map(Number);
    const totalNodes = configurationValues[0]; // N: The overall count of cities/nodes.
    const railwayConnectionCount = configurationValues[1]; // K: The number of railway links.
    const roadConnectionCount = configurationValues[2]; // L: The number of road links.

    // Implement basic input validation for robustness.
    // While competitive programming often assumes valid input, this is good practice.
    if (totalNodes < 1 || railwayConnectionCount < 0 || roadConnectionCount < 0) {
        // For a real-world scenario, one might throw an error or return a specific error code.
        // Here, an empty string is returned as a simple indication of invalid input.
        return "";
    }

    // Initialize two separate Union-Find data structures: one for railway connections and one for road connections.
    // Each node initially forms its own component, represented by itself (e.g., parent[i] = i + 1 for node i + 1).
    const railwayParentArray = Array.from({ length: totalNodes }, (_, index) => index + 1);
    const roadParentArray = Array.from({ length: totalNodes }, (_, index) => index + 1);

    // Process all railway connection data provided in the input lines.
    // The connections start from the second line (index 1) and continue for 'railwayConnectionCount' lines.
    for (let currentLineOffset = 1; currentLineOffset <= railwayConnectionCount; currentLineOffset++) {
        const connectionPair = inputDataLines[currentLineOffset].split(' ').map(Number);
        const cityOne = connectionPair[0]; // First city in the railway link.
        const cityTwo = connectionPair[1]; // Second city in the railway link.
        // Unite the components containing cityOne and cityTwo within the railway network.
        uniteSets(railwayParentArray, cityOne, cityTwo);
    }

    // Process all road connection data.
    // These connections follow the railway connections in the input, starting after 'railwayConnectionCount' lines.
    for (let currentLineOffset = railwayConnectionCount + 1; currentLineOffset <= railwayConnectionCount + roadConnectionCount; currentLineOffset++) {
        const connectionPair = inputDataLines[currentLineOffset].split(' ').map(Number);
        const cityOne = connectionPair[0]; // First city in the road link.
        const cityTwo = connectionPair[1]; // Second city in the road link.
        // Unite the components containing cityOne and cityTwo within the road network.
        uniteSets(roadParentArray, cityOne, cityTwo);
    }

    // A map to efficiently count the number of nodes belonging to each unique "combined" component.
    // A combined component is defined by the pair of its railway representative and its road representative.
    // The key for the map will be a string like "railRep_roadRep".
    const combinedComponentSizesMap = new Map();

    // Iterate through every node to determine its combined component and update counts.
    for (let nodeId = 1; nodeId <= totalNodes; nodeId++) {
        // Find the ultimate representative for the current node in both networks.
        const currentRailwayRepresentative = findSetRepresentative(railwayParentArray, nodeId);
        const currentRoadRepresentative = findSetRepresentative(roadParentArray, nodeId);

        // Construct a unique key for this specific combined component.
        const compositeComponentKey = `${currentRailwayRepresentative}-${currentRoadRepresentative}`;

        // Increment the count for this composite component.
        // If the key is not yet in the map, initialize its count to 0 before incrementing.
        combinedComponentSizesMap.set(compositeComponentKey, (combinedComponentSizesMap.get(compositeComponentKey) || 0) + 1);
    }

    // Prepare the final output array, where each element will store the size of
    // the combined component that the corresponding node belongs to.
    const finalResultArray = new Array(totalNodes);

    // Populate the result array by looking up the pre-calculated counts from the map.
    for (let nodeId = 1; nodeId <= totalNodes; nodeId++) {
        const currentRailwayRepresentative = findSetRepresentative(railwayParentArray, nodeId);
        const currentRoadRepresentative = findSetRepresentative(roadParentArray, nodeId);
        const compositeComponentKey = `${currentRailwayRepresentative}-${currentRoadRepresentative}`;
        // Store the size of the combined component for this node.
        finalResultArray[nodeId - 1] = combinedComponentSizesMap.get(compositeComponentKey);
    }

    // Return the final results as a space-separated string.
    return finalResultArray.join(' ');
}

// Standard entry point for competitive programming in Node.js.
// Reads the entire input from stdin, processes it, and prints the output.
const fullInputContent = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
console.log(analyzeTransportationNetworks(fullInputContent));