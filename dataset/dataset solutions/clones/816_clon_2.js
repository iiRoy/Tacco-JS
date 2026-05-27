let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read all input from standard in
let linesOfInput = rawData.trim().split('\n'); // Split the raw input string into an array of lines
let currentLineIndex = 0; // Initialize a pointer to track the current line being processed

while (true) { // Loop indefinitely to process multiple test cases until a termination condition is met
    // Parse the first line of the current test case to get N (number of nodes) and M (number of transmissions)
    const dimensions = linesOfInput[currentLineIndex].split(' ').map(Number);
    currentLineIndex++; // Advance the line pointer to the next line

    const numNodes = dimensions[0]; // Extract N
    const numTransmissions = dimensions[1]; // Extract M

    // Check for the termination condition: N=0 and M=0
    if (numNodes === 0 && numTransmissions === 0) {
        break; // Exit the loop if both N and M are zero
    }

    // Initialize an array to keep track of the health status of each node
    // 'true' means potentially infected, 'false' means confirmed healthy
    let nodeHealthStatuses = [];
    for (let nodeIdx = 0; nodeIdx < numNodes; nodeIdx++) {
        nodeHealthStatuses[nodeIdx] = true; // Initially, assume all nodes could be infected
    }
    nodeHealthStatuses[0] = false; // Node 0 is explicitly stated to be healthy (not infected)

    // Array to store all transmission events
    let transmissionRecords = [];
    for (let transmissionIdx = 0; transmissionIdx < numTransmissions; transmissionIdx++) {
        // Parse each transmission event: T (time), S (source node), D (destination node)
        const transmissionData = linesOfInput[currentLineIndex].split(' ').map(Number);
        currentLineIndex++; // Move to the next line of input

        // Store the transmission data, adjusting node indices to be 0-based
        transmissionRecords.push([transmissionData[0], transmissionData[1] - 1, transmissionData[2] - 1]);
    }

    // Sort the transmission records chronologically based on their time (T)
    transmissionRecords.sort((firstEvent, secondEvent) => {
        return firstEvent[0] - secondEvent[0];
    });

    // Process each transmission event in chronological order
    transmissionRecords.forEach((currentTransmission) => {
        const sourceNode = currentTransmission[1]; // Get the 0-based index of the source node
        const destinationNode = currentTransmission[2]; // Get the 0-based index of the destination node

        // If the source node is confirmed healthy (not infected),
        // then the destination node also remains healthy, regardless of its previous status.
        if (!nodeHealthStatuses[sourceNode]) {
            nodeHealthStatuses[destinationNode] = false;
        }
    });

    // Count the total number of healthy nodes
    let healthyNodeCount = 0;
    nodeHealthStatuses.forEach((statusFlag) => {
        if (!statusFlag) { // If the status flag is 'false', it means the node is healthy
            healthyNodeCount++; // Increment the counter for healthy nodes
        }
    });

    console.log(healthyNodeCount); // Output the result for the current test case
}
