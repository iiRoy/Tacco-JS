/**
 * Processes raw input data to find the maximum number of non-overlapping matches
 * between two sets of entities (red and blue points) based on specific coordinate conditions.
 * This algorithm employs a greedy strategy, iteratively selecting the match that
 * minimizes the sum of degrees (potential connections) of the involved entities.
 *
 * @param {string} rawDataString The raw input string, typically from stdin,
 *                                containing entity counts and their coordinates.
 */
function ProcessInputData(rawDataString) {
    // Helper function to safely parse integers, defaulting to 0 for invalid inputs.
    const safeParseInteger = (inputStr) => {
        const parsedValue = parseInt(inputStr, 10);
        return isNaN(parsedValue) ? 0 : parsedValue;
    };

    // Helper function to parse raw text into a structured array of string arrays.
    const parseStructuredInput = (textBlock) => {
        if (!textBlock) {
            // Log an error or return an empty structure if input is null/undefined.
            console.error("Input text block is empty or null.");
            return [];
        }
        // Trim leading/trailing whitespace, split into lines (handling different line endings),
        // then split each line by one or more whitespace characters.
        return textBlock.trim().split(/\r?\n/).map(line => line.split(/\s+/));
    };

    // Helper function to parse a pair of coordinates from a string array.
    const extractCoordinates = (coordinateStrings) => {
        if (!coordinateStrings || coordinateStrings.length < 2) {
            console.warn("Warning: Malformed coordinate string array provided. Defaulting to [0, 0].");
            return [0, 0];
        }
        return [safeParseInteger(coordinateStrings[0]), safeParseInteger(coordinateStrings[1])];
    };

    // Step 1: Parse the initial input data.
    const processedLines = parseStructuredInput(rawDataString);

    // Validate initial parsing results.
    if (!processedLines || processedLines.length === 0) {
        console.error("Error: Failed to parse any lines from the input data.");
        return; // Exit if no valid input.
    }

    // Extract the total number of entities (N).
    const totalEntityCount = safeParseInteger(processedLines[0][0]);

    // Validate the entity count.
    if (totalEntityCount <= 0 || totalEntityCount > 100) { // Assuming a reasonable upper bound for N
        console.error(`Error: Invalid entity count: ${totalEntityCount}. Must be a positive integer.`);
        return;
    }

    // Initialize arrays to store coordinates for red and blue points.
    // Red points are analogous to 'arr_ab', Blue points to 'arr_cd'.
    const redPointCoordinates = new Array(totalEntityCount);
    const bluePointCoordinates = new Array(totalEntityCount);

    // Populate coordinate arrays for all entities.
    // Red points are from line 1 to N, Blue points from N+1 to 2N.
    for (let currentIdx = 0; currentIdx < totalEntityCount; currentIdx++) {
        redPointCoordinates[currentIdx] = extractCoordinates(processedLines[currentIdx + 1]);
        bluePointCoordinates[currentIdx] = extractCoordinates(processedLines[currentIdx + totalEntityCount + 1]);
    }

    // Helper function to determine if a link can be formed between a red and a blue point.
    const canEstablishLink = (redPoint, bluePoint) => {
        // Validation for coordinate integrity.
        if (!redPoint || redPoint.length < 2 || !bluePoint || bluePoint.length < 2) {
            console.warn("Warning: Attempted to check link with incomplete coordinate data.");
            return false;
        }
        // The core condition: red's x < blue's x AND red's y < blue's y.
        return redPoint[0] < bluePoint[0] && redPoint[1] < bluePoint[1];
    };

    // Initialize data structures to track potential connections and their counts.
    // `outgoingLinksFromRed` maps a red node index to an array of blue node indices it can connect to.
    const outgoingLinksFromRed = Array.from({ length: totalEntityCount }, () => []);
    // `incomingLinksToBlue` maps a blue node index to an array of red node indices that can connect to it.
    const incomingLinksToBlue = Array.from({ length: totalEntityCount }, () => []);

    // `redNodeConnectionDegrees` stores the count of potential outgoing links for each red node.
    const redNodeConnectionDegrees = new Array(totalEntityCount).fill(0);
    // `blueNodeConnectionDegrees` stores the count of potential incoming links for each blue node.
    const blueNodeConnectionDegrees = new Array(totalEntityCount).fill(0);

    let totalPotentialMatches = 0; // Tracks the total count of all valid possible connections.

    // Step 2: Build the initial connection graph and calculate degrees.
    for (let rNodeIdx = 0; rNodeIdx < totalEntityCount; rNodeIdx++) {
        for (let bNodeIdx = 0; bNodeIdx < totalEntityCount; bNodeIdx++) {
            if (canEstablishLink(redPointCoordinates[rNodeIdx], bluePointCoordinates[bNodeIdx])) {
                // If a link is possible, record it in both directions.
                outgoingLinksFromRed[rNodeIdx].push(bNodeIdx);
                incomingLinksToBlue[bNodeIdx].push(rNodeIdx);

                // Increment degree counts for both nodes.
                redNodeConnectionDegrees[rNodeIdx]++;
                blueNodeConnectionDegrees[bNodeIdx]++;

                totalPotentialMatches++; // Increment total count of possible connections.
            }
        }
    }

    let finalMatchedPairsCount = 0; // Counter for the number of successful matches found.

    // `nodeExclusionStatus` tracks which nodes have already been matched and are thus unavailable.
    const nodeExclusionStatus = {
        redNodes: new Array(totalEntityCount).fill(false), // `true` if red node is matched.
        blueNodes: new Array(totalEntityCount).fill(false), // `true` if blue node is matched.
    };

    /**
     * Helper function to find the "best" candidate pair for matching.
     * The "best" pair is defined as the one with the minimum sum of degrees
     * (potential connections) of its constituent red and blue nodes.
     *
     * @returns {object} An object containing `found` (boolean), `redNode`, `blueNode`, and `combinedDegree`.
     */
    const identifyOptimalMatchCandidate = () => {
        let minimumCombinedDegreeSum = Number.MAX_SAFE_INTEGER; // Initialize with a very large number.
        let candidateRedNode = -1;
        let candidateBlueNode = -1;
        let candidateFound = false;

        // Iterate through all red nodes.
        for (let rIdx = 0; rIdx < totalEntityCount; rIdx++) {
            // Skip this red node if it has already been matched.
            if (nodeExclusionStatus.redNodes[rIdx]) continue;

            // Ensure `outgoingLinksFromRed[rIdx]` is still an array before iterating.
            // This implicitly handles cases where a node's connection list might have been
            // overwritten in a previous step (though `nodeExclusionStatus` should prevent access).
            if (!Array.isArray(outgoingLinksFromRed[rIdx])) {
                continue;
            }

            // Iterate through all blue nodes that this red node can potentially connect to.
            for (const bIdx of outgoingLinksFromRed[rIdx]) {
                // Skip this blue node if it has already been matched.
                if (nodeExclusionStatus.blueNodes[bIdx]) continue;

                // Calculate the sum of degrees for the current red and blue nodes.
                const currentCombinedDegree = redNodeConnectionDegrees[rIdx] + blueNodeConnectionDegrees[bIdx];

                // If this pair has a smaller combined degree sum, it's the new best candidate.
                // Or if equal, it keeps the first one found (implicit tie-breaking by iteration order).
                if (currentCombinedDegree < minimumCombinedDegreeSum) {
                    minimumCombinedDegreeSum = currentCombinedDegree;
                    candidateRedNode = rIdx;
                    candidateBlueNode = bIdx;
                    candidateFound = true;
                }
            }
        }
        return {
            found: candidateFound,
            redNode: candidateRedNode,
            blueNode: candidateBlueNode,
            combinedDegree: minimumCombinedDegreeSum
        };
    };

    /**
     * Helper function to update the graph state after a pair of nodes has been matched.
     * This involves marking nodes as excluded, removing their connections from other nodes,
     * and updating degree counts.
     *
     * @param {number} chosenRedIdx Index of the chosen red node.
     * @param {number} chosenBlueIdx Index of the chosen blue node.
     * @param {number} totalEntities The total number of entities.
     */
    const updateGraphAfterSuccessfulMatch = (chosenRedIdx, chosenBlueIdx, totalEntities) => {
        // Capture the original lists of connections for the chosen nodes *before* they are potentially
        // overwritten later in this function. This is critical for correctly updating other nodes.
        const redNodeOriginalOutgoingLinks = [...outgoingLinksFromRed[chosenRedIdx]];
        const blueNodeOriginalIncomingLinks = [...incomingLinksToBlue[chosenBlueIdx]];

        // Step 1: Update connections for *other* nodes.
        // For each blue node that was originally connected to `chosenRedIdx`:
        for (const connectedBlueIdx of redNodeOriginalOutgoingLinks) {
            // Only update if this blue node is not the one we just matched with `chosenRedIdx`
            // AND it hasn't been excluded by a previous match itself.
            if (connectedBlueIdx !== chosenBlueIdx && !nodeExclusionStatus.blueNodes[connectedBlueIdx]) {
                // Remove `chosenRedIdx` from `connectedBlueIdx`'s list of incoming links.
                incomingLinksToBlue[connectedBlueIdx] = incomingLinksToBlue[connectedBlueIdx].filter(
                    (nodeIndex) => nodeIndex !== chosenRedIdx
                );
                // Decrement the degree count for this blue node.
                blueNodeConnectionDegrees[connectedBlueIdx]--;
            }
        }

        // For each red node that was originally connected to `chosenBlueIdx`:
        for (const connectedRedIdx of blueNodeOriginalIncomingLinks) {
            // Only update if this red node is not the one we just matched with `chosenBlueIdx`
            // AND it hasn't been excluded by a previous match itself.
            if (connectedRedIdx !== chosenRedIdx && !nodeExclusionStatus.redNodes[connectedRedIdx]) {
                // Remove `chosenBlueIdx` from `connectedRedIdx`'s list of outgoing links.
                outgoingLinksFromRed[connectedRedIdx] = outgoingLinksFromRed[connectedRedIdx].filter(
                    (nodeIndex) => nodeIndex !== chosenBlueIdx
                );
                // Decrement the degree count for this red node.
                redNodeConnectionDegrees[connectedRedIdx]--;
            }
        }

        // Step 2: Mark the chosen nodes as matched (excluded from further consideration).
        nodeExclusionStatus.redNodes[chosenRedIdx] = true;
        nodeExclusionStatus.blueNodes[chosenBlueIdx] = true;

        // Step 3: Store the final match in the connection arrays for the chosen nodes.
        // This overwrites their lists of potential connections with the single actual match.
        // This specific data structure modification is a direct replication of the original code's behavior.
        outgoingLinksFromRed[chosenRedIdx] = chosenBlueIdx; // Red node's "connections" now stores its blue partner.
        redNodeConnectionDegrees[chosenRedIdx] = 1; // Its degree becomes 1 (representing the single match).

        incomingLinksToBlue[chosenBlueIdx] = chosenRedIdx; // Blue node's "connections" now stores its red partner.
        blueNodeConnectionDegrees[chosenBlueIdx] = 1; // Its degree becomes 1.
    };

    // Step 3: Main greedy matching loop. Continue as long as there are potential matches.
    while (totalPotentialMatches > 0) {
        // Find the next optimal pair to match.
        const bestCandidate = identifyOptimalMatchCandidate();

        // If no candidate is found, but `totalPotentialMatches` is still > 0,
        // it indicates an issue or that no more valid matches can be formed.
        if (!bestCandidate.found) {
            // This scenario should ideally not happen if `totalPotentialMatches` is correctly decremented.
            console.warn("Warning: No optimal match candidate found, but totalPotentialMatches is still positive. Breaking loop.");
            break;
        }

        const selectedRedNode = bestCandidate.redNode;
        const selectedBlueNode = bestCandidate.blueNode;
        const selectedCombinedDegree = bestCandidate.combinedDegree;

        // Decrement `totalPotentialMatches`. When a pair (A, B) is chosen,
        // `deg(A)` links from A and `deg(B)` links from B are removed.
        // The link (A, B) itself is counted in both `deg(A)` and `deg(B)`.
        // So, `deg(A) + deg(B) - 1` unique links are removed.
        totalPotentialMatches -= (selectedCombinedDegree - 1);
        finalMatchedPairsCount++; // Increment the count of successfully matched pairs.

        // Update the graph state to reflect the chosen match.
        updateGraphAfterSuccessfulMatch(selectedRedNode, selectedBlueNode, totalEntityCount);
    }

    // Step 4: Output the final count of matched pairs.
    console.log(finalMatchedPairsCount);
}

// Entry point for execution: Read input from stdin and pass it to the main processing function.
// This setup is common in competitive programming environments.
const standardInput = require("fs").readFileSync("/dev/stdin", "utf8");
ProcessInputData(standardInput);