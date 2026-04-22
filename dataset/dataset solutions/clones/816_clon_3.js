let rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Function to parse a line containing space-separated numbers
const extractNumericValues = (lineString) => {
    // Ensure the input is a string and trim any extra whitespace
    if (typeof lineString !== 'string') {
        throw new Error('Input for numeric value extraction must be a string.');
    }
    return lineString.trim().split(" ").map(val => {
        const num = Number(val);
        if (isNaN(num)) {
            // As a Type III addition, handle potential non-numeric input gracefully
            // For this problem, we assume valid input, but this shows a validation point.
            console.warn(`Warning: Non-numeric value encountered: ${val}. Coercing to 0.`);
            return 0; // Or throw an error, depending on desired robustness
        }
        return num;
    });
};

// Main processing unit
const processSimulationRounds = (fullInputContent) => {
    // Split the entire input content into individual lines for easier processing
    let processedLines = fullInputContent.trim().split("\n");
    let currentLineIndex = 0; // Pointer to the current line being read

    // Helper to safely read and parse a line
    const getNextLineAndParse = () => {
        if (currentLineIndex >= processedLines.length) {
            // Guard against reading beyond the end of the input
            throw new Error("Attempted to read past end of input data.");
        }
        const lineContent = processedLines[currentLineIndex];
        currentLineIndex++;
        return extractNumericValues(lineContent);
    };

    // Begin the simulation loop for multiple test cases
    for (;;) { // An alternative to while(true)
        // Read the dimensions (number of nodes and number of transmissions) for the current round
        const dimensions = getNextLineAndParse();
        const nodeCount = dimensions[0];
        const transmissionCount = dimensions[1];

        // Check for termination condition: both nodeCount and transmissionCount are zero
        if (nodeCount === 0 && transmissionCount === 0) {
            break; // Exit the loop
        }

        // --- Initialize the immunity status of nodes ---
        // We'll use a Set to store the indices of nodes that are 'immune' (unaffected).
        // Initially, only node 0 is immune. All other nodes are susceptible.
        let immuneNodesSet = new Set();
        immuneNodesSet.add(0); // Node 0 is initially immune (unaffected)

        // --- Process transmission records ---
        // Store transmission events as objects for better readability and extensibility
        let eventLog = [];
        for (let k = 0; k < transmissionCount; k++) {
            const rawRecord = getNextLineAndParse();
            // Validate the structure of the record
            if (rawRecord.length < 3) {
                console.error(`Error: Incomplete transmission record on line ${currentLineIndex - 1}. Skipping.`);
                continue; // Skip malformed records
            }
            // Adjust node indices from 1-based (input) to 0-based (array/Set)
            eventLog.push({
                timestamp: rawRecord[0],
                sourceNodeId: rawRecord[1] - 1,
                destinationNodeId: rawRecord[2] - 1
            });
        }

        // Sort the transmission events chronologically
        eventLog.sort((evtA, evtB) => evtA.timestamp - evtB.timestamp);

        // --- Simulate the spread of immunity ---
        // Iterate through the sorted events and update immunity status
        for (const currentTransmission of eventLog) {
            const { sourceNodeId, destinationNodeId } = currentTransmission;

            // Ensure node IDs are within valid bounds (0 to nodeCount-1)
            const isValidSource = sourceNodeId >= 0 && sourceNodeId < nodeCount;
            const isValidDestination = destinationNodeId >= 0 && destinationNodeId < nodeCount;

            if (!isValidSource || !isValidDestination) {
                // As a Type III addition, handle invalid node IDs gracefully
                console.warn(`Warning: Invalid node ID in transmission (src: ${sourceNodeId}, dest: ${destinationNodeId}). Skipping event.`);
                continue;
            }

            // If the source node is currently immune, then the destination node also becomes immune.
            // This models the spread of an 'unaffected' status.
            if (immuneNodesSet.has(sourceNodeId)) {
                immuneNodesSet.add(destinationNodeId);
            }
        }

        // --- Calculate and output the final count of immune nodes ---
        // The size of the set directly gives us the number of unique immune nodes.
        const finalImmuneNodeCount = immuneNodesSet.size;
        console.log(finalImmuneNodeCount);
    }
};

// Execute the main processing function with the read input data
processSimulationRounds(rawInputData);