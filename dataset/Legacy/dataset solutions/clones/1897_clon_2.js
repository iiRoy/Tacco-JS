const ProcessInput = (rawData) => {
    // Split the entire input string into individual lines
    const lineSegments = rawData.split('\n');

    // Extract the first line for N and M values
    const dimensions = lineSegments.shift().split(' ').map(element => parseInt(element, 10));

    // Extract the second line for tower heights
    const heights = lineSegments.shift().split(' ').map(element => parseInt(element, 10));

    // Remove the last line, which might be empty or a trailing newline
    lineSegments.pop();

    // Parse the remaining lines to get road connections
    const connections = lineSegments.map(segment => segment.split(' ').map(val => parseInt(val, 10)));

    // Call the core logic function and print its result
    console.log(CalculateGoodTowers(dimensions[0], dimensions[1], heights, connections));
};

/**
 * Determines the number of "good" towers based on their heights and connections.
 * A tower is "good" if its height is strictly greater than all its directly connected neighbors.
 *
 * @param {number} numTowers - The total number of towers (N).
 * @param {number} numRoads - The total number of roads (M).
 * @param {number[]} heights - An array of tower heights (H), 0-indexed.
 * @param {number[][]} connections - An array of road connections (A), where each sub-array [u, v] represents a road between tower u and tower v.
 * @returns {number} The count of good towers.
 */
const CalculateGoodTowers = (numTowers, numRoads, heights, connections) => {
    // Initialize an adjacency list to store connections for each tower.
    // The list is 1-indexed to match tower numbers.
    const adjacencyList = [];
    for (let k = 0; k <= numTowers; k++) {
        adjacencyList.push([]);
    }

    // Populate the adjacency list based on the provided road connections.
    // Roads are bidirectional.
    for (let k = 0; k < numRoads; k++) {
        const towerA = connections[k][0];
        const towerB = connections[k][1];
        adjacencyList[towerA].push(towerB);
        adjacencyList[towerB].push(towerA);
    }

    let goodTowerCount = 0; // Counter for towers that meet the "good" criteria.

    // Iterate through each tower from 1 to N.
    for (let k = 1; k <= numTowers; k++) {
        // If a tower has no roads connected to it, it's considered "good" by default.
        if (adjacencyList[k].length === 0) {
            goodTowerCount++;
            continue; // Move to the next tower.
        }

        let maxNeighborHeight = 0; // Track the maximum height among neighbors.

        // Check all neighbors of the current tower.
        adjacencyList[k].forEach(neighborTowerIndex => {
            // Heights array is 0-indexed, so adjust the neighbor index.
            if (heights[neighborTowerIndex - 1] > maxNeighborHeight) {
                maxNeighborHeight = heights[neighborTowerIndex - 1];
            }
        });

        // If the current tower's height is strictly greater than its tallest neighbor, it's "good".
        // Heights array is 0-indexed, so adjust the current tower's index.
        if (maxNeighborHeight < heights[k - 1]) {
            goodTowerCount++;
        }
    }

    return goodTowerCount; // Return the final count of good towers.
};

// This section handles standard input/output and should not be modified.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
