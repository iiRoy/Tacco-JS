function ProcessInput(rawData) {
    // Pre-process the raw input string: trim whitespace, split into lines, then split each line by space.
    rawData = rawData.trim().split("\n").map(function(lineStr) {
        return lineStr.split(" ");
    });

    // Extract the number of pairs (N) from the first element of the first line.
    var numPairs = parseInt(rawData[0][0], 10);

    // Initialize arrays to store the coordinates of red and blue points.
    // redPoints will store [a, b] pairs.
    var redPoints = [];
    // bluePoints will store [c, d] pairs.
    var bluePoints = [];

    // Populate the redPoints and bluePoints arrays by parsing integer coordinates.
    // The first N lines after the N value are for red points, the next N lines are for blue points.
    for (var pointIndex = 0; pointIndex < numPairs; pointIndex++) {
        redPoints.push(rawData[pointIndex + 1].map(coordinateStr => parseInt(coordinateStr, 10)));
        bluePoints.push(rawData[pointIndex + numPairs + 1].map(coordinateStr => parseInt(coordinateStr, 10)));
    }

    // Initialize data structures for representing the bipartite graph and its properties.
    // redConnections: Adjacency list for red points, storing indices of connected blue points.
    var redConnections = Array.from({
        length: numPairs
    }, () => []);
    // blueConnections: Adjacency list for blue points, storing indices of connected red points.
    var blueConnections = Array.from({
        length: numPairs
    }, () => []);

    // redDegreeCounts: Stores the number of connections (degree) for each red point.
    var redDegreeCounts = Array.from({
        length: numPairs
    }, () => 0);
    // blueDegreeCounts: Stores the number of connections (degree) for each blue point.
    var blueDegreeCounts = Array.from({
        length: numPairs
    }, () => 0);

    // totalAvailableLinks: Keeps track of the total number of possible connections in the graph.
    var totalAvailableLinks = 0;

    // Build the initial graph by checking the connection condition (a < c and b < d).
    for (var redPointIdx = 0; redPointIdx < numPairs; redPointIdx++) {
        for (var bluePointIdx = 0; bluePointIdx < numPairs; bluePointIdx++) {
            // Check if the current red point can connect to the current blue point.
            if (redPoints[redPointIdx][0] < bluePoints[bluePointIdx][0] && redPoints[redPointIdx][1] < bluePoints[bluePointIdx][1]) {
                // Add the connection to both adjacency lists.
                redConnections[redPointIdx].push(bluePointIdx);
                blueConnections[bluePointIdx].push(redPointIdx);

                // Increment degree counts for both connected points.
                redDegreeCounts[redPointIdx]++;
                blueDegreeCounts[bluePointIdx]++;

                // Increment the total count of available links.
                totalAvailableLinks++;
            }
        }
    }

    // Variables for the greedy matching algorithm.
    var currentMinDegreeSum; // Stores the minimum sum of degrees found for a potential match in an iteration.
    var selectedPairIndices = [-1, -1]; // Stores the indices [red_idx, blue_idx] of the chosen match.
    var matchCount = 0; // Counts the total number of successful matches.

    // matchedStatus: A 2D array to mark points that have already been matched.
    // matchedStatus[0] for red points, matchedStatus[1] for blue points.
    // Value 0 means not matched, 1 means matched.
    var matchedStatus = [Array.from({
        length: numPairs
    }, () => 0), Array.from({
        length: numPairs
    }, () => 0)];

    // Main loop for the greedy matching algorithm. Continues as long as there are potential links.
    while (totalAvailableLinks > 0) {
        // Reset currentMinDegreeSum for the new iteration.
        // Initialized to a value larger than any possible sum of degrees (max degree is N-1, so 2*(N-1) is max sum).
        currentMinDegreeSum = 2 * numPairs;

        // Iterate through all red points to find the "best" connection based on the degree sum heuristic.
        for (var redPointIdx = 0; redPointIdx < redConnections.length; redPointIdx++) {
            // Skip this red point if it has already been matched.
            if (matchedStatus[0][redPointIdx] === 1) continue;

            // Iterate through all blue points connected to the current red point.
            for (var connectedBlueIdx of redConnections[redPointIdx]) {
                // Skip this blue point if it has already been matched.
                if (matchedStatus[1][connectedBlueIdx] === 1) continue;

                // Calculate the sum of degrees for the current potential edge.
                // If this sum is less than or equal to the current minimum, update the minimum and the selected pair.
                if ((redDegreeCounts[redPointIdx] + blueDegreeCounts[connectedBlueIdx]) <= currentMinDegreeSum) {
                    currentMinDegreeSum = redDegreeCounts[redPointIdx] + blueDegreeCounts[connectedBlueIdx];
                    selectedPairIndices[0] = redPointIdx; // Store the red point index.
                    selectedPairIndices[1] = connectedBlueIdx; // Store the blue point index.
                }
            }
        }

        // Update the total available links. When an edge (u,v) is chosen, all edges incident to u or v are effectively removed.
        // The sum of degrees (deg(u) + deg(v)) counts the chosen edge twice, so we subtract (sum - 1).
        totalAvailableLinks -= (currentMinDegreeSum - 1);
        // Increment the count of successful matches.
        matchCount++;

        // Update the graph by removing the chosen points and their connections.
        // For each blue point that was connected to the chosen red point:
        for (var blueNeighborIdx of redConnections[selectedPairIndices[0]]) {
            // Remove the chosen red point from the blue point's connection list.
            blueConnections[blueNeighborIdx] = blueConnections[blueNeighborIdx].filter(neighborNode => neighborNode !== selectedPairIndices[0]);
            // Decrement the blue point's degree count.
            blueDegreeCounts[blueNeighborIdx]--;
        }
        // For each red point that was connected to the chosen blue point:
        for (var redNeighborIdx of blueConnections[selectedPairIndices[1]]) {
            // Remove the chosen blue point from the red point's connection list.
            redConnections[redNeighborIdx] = redConnections[redNeighborIdx].filter(neighborNode => neighborNode !== selectedPairIndices[1]);
            // Decrement the red point's degree count.
            redDegreeCounts[redNeighborIdx]--;
        }

        // Mark the chosen red and blue points as matched.
        matchedStatus[0][selectedPairIndices[0]] = 1;
        matchedStatus[1][selectedPairIndices[1]] = 1;

        // Overwrite the adjacency lists and degree counts for the matched nodes.
        // This is a specific way the original code handles marking matched nodes as "processed"
        // by replacing their connection arrays with a single integer (the index of their match)
        // and setting their degree count to 1. This effectively prevents further iteration over their
        // original connections and ensures they are skipped by the `matchedStatus` check.
        redConnections[selectedPairIndices[0]] = selectedPairIndices[1];
        redDegreeCounts[selectedPairIndices[0]] = 1;
        blueConnections[selectedPairIndices[1]] = selectedPairIndices[0];
        blueDegreeCounts[selectedPairIndices[1]] = 1;
    }

    // Output the final count of matches found.
    console.log(matchCount);
}

// Read the input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
