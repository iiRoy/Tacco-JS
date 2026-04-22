'use strict';
// This script processes input to perform a Kruskal-like algorithm on a grid.
// The Main function orchestrates the entire process.

function Main(INPUT) {

    // Split the input string into an array of lines.
    let input = INPUT.split("\n");

    // Parse the first line to get grid dimensions W and H.
    let WH = input[0].split(" ");
    let W = parseInt(WH[0]); // Width of the grid
    let H = parseInt(WH[1]); // Height of the grid

    // Initialize arrays to store edge weights along horizontal and vertical paths.
    let p = []; // Stores weights for horizontal edges (p[x] represents cost along x-axis)
    let q = []; // Stores weights for vertical edges (q[y] represents cost along y-axis)

    // Populate array 'p' with horizontal edge weights.
    // These are read from input lines starting from index 1 up to W.
    for (let i = 0; i < W; i++) {
        p.push(input[1 + i]);
    }

    // Populate array 'q' with vertical edge weights.
    // These are read from input lines starting after 'p' values.
    for (let i = 0; i < H; i++) {
        q.push(input[1 + W + i]);
    }


    // Initialize a 2D array 'node' to represent grid cells and their properties.
    // Each node[y][x] will be an array containing:
    // [0]: The component ID (for Kruskal's algorithm, initially unique for each node)
    // [1]: Horizontal edge weight originating from this node (to node[y][x+1])
    // [2]: Vertical edge weight originating from this node (to node[y+1][x])
    let node = [];

    // Loop through rows (y-coordinate) to initialize grid nodes.
    for (let y = 0; y < H + 1; y++) {
        node.push([]); // Add a new row for the current y.

        // Loop through columns (x-coordinate) for the current row.
        for (let x = 0; x < W + 1; x++) {
            node[y][x] = []; // Initialize the node's properties array.

            // Assign a unique component ID to each node initially.
            // This is (W+1)*y + x to map 2D coordinates to a 1D index.
            node[y][x][0] = (W + 1) * y + x;

            // Assign horizontal edge weight. If p[x] is not a valid number, use a large default.
            // This represents the cost from (y,x) to (y,x+1).
            node[y][x][1] = parseInt(p[x]) || 100000001;

            // Assign vertical edge weight. If q[y] is not a valid number, use a large default.
            // This represents the cost from (y,x) to (y+1,x).
            node[y][x][2] = parseInt(q[y]) || 100000001;
        }
    }

    // The kruskal function implements a simplified Kruskal-like algorithm.
    // It finds the minimum edge not connecting two already connected components
    // and merges those components, accumulating the cost.
    function kruskal(cost) {
        // Initialize minimum edge weight to a very large value.
        let min = 100000001; // Represents 10^8 + 1, a value larger than any possible edge weight.

        // 'revise' array stores the component IDs of the two nodes to be merged.
        // revise[0] will be the target component ID, revise[1] will be the one merged into it.
        let revise = [];
        let x = 0,
            y = 0; // Loop counters

        // Iterate through the grid to find the minimum edge.
        // This loop checks both horizontal and vertical edges within the main grid area.
        for (y = 0; y < H; y++) {
            for (x = 0; x < W; x++) {
                // Check horizontal edge from (y,x) to (y,x+1).
                // Ensure nodes are in different components and the edge cost is less than current min.
                if (node[y][x][1] < min && node[y][x][0] != node[y][x + 1][0]) {
                    min = node[y][x][1]; // Update minimum cost.
                    revise[0] = node[y][x][0]; // Store component ID of the first node.
                    revise[1] = node[y][x + 1][0]; // Store component ID of the second node.
                }

                // Check vertical edge from (y,x) to (y+1,x).
                // Ensure nodes are in different components and the edge cost is less than current min.
                if (node[y][x][2] < min && node[y][x][0] != node[y + 1][x][0]) {
                    min = node[y][x][2]; // Update minimum cost.
                    revise[0] = node[y][x][0]; // Store component ID of the first node.
                    revise[1] = node[y + 1][x][0]; // Store component ID of the second node.
                }
            }
        }

        // Check horizontal edges in the last row (H) specifically.
        // These are edges from (H,x) to (H,x+1).
        for (x = 0; x < W; x++) {
            if (node[H][x][1] < min && node[H][x][0] != node[H][x + 1][0]) {
                min = node[H][x][1]; // Update minimum cost.
                revise[0] = node[H][x][0]; // Store component ID.
                revise[1] = node[H][x + 1][0]; // Store component ID.
            }
        }

        // Check vertical edges in the last column (W) specifically.
        // These are edges from (y,W) to (y+1,W).
        for (y = 0; y < H; y++) {
            if (node[y][W][2] < min && node[y][W][0] != node[y + 1][W][0]) {
                min = node[y][W][2]; // Update minimum cost.
                revise[0] = node[y][W][0]; // Store component ID.
                revise[1] = node[y + 1][W][0]; // Store component ID.
            }
        }

        // After finding the minimum edge, merge the components.
        // All nodes belonging to 'revise[1]' component are now assigned to 'revise[0]' component.
        for (y = 0; y < H + 1; y++) {
            for (x = 0; x < W + 1; x++) {
                if (node[y][x][0] == revise[1]) {
                    node[y][x][0] = revise[0]; // Perform the union operation.
                }
            }
        }

        // Add the cost of the chosen edge to the total accumulated cost.
        cost += min;

        // Check if all nodes are now connected into a single component.
        // This is done by comparing each node's component ID to the component ID of node[0][0].
        for (y = 0; y < H + 1; y++) {
            for (x = 0; x < W + 1; x++) {
                // If any node is not yet connected to the component of node[0][0],
                // it means the graph is not fully connected.
                // Recursively call kruskal to find the next minimum edge.
                if (node[0][0][0] != node[y][x][0]) {
                    return kruskal(cost); // Continue building the MST.
                }
            }
        }

        // If all nodes are connected (loop completed without returning),
        // then the minimum spanning tree is complete. Return the total cost.
        return cost;
    }

    // Start the Kruskal's algorithm with an initial cost of 0.
    let cost = kruskal(0);

    // Output the final calculated minimum spanning tree cost.
    console.log(cost);

}

// Read input from stdin and pass it to the Main function.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));