function EvaluateGameResult(data_string) {
    // Decompose the input string into individual lines
    data_string = data_string.split("\n");

    // Extract the total count of graph vertices
    let num_vertices = parseInt(data_string[0]);

    // Initialize distance array for the first player (Fennec), starting at vertex 0
    let distances_from_player_one = new Array(num_vertices).fill(num_vertices);
    distances_from_player_one[0] = 0; // Fennec starts at node 0 with distance 0

    // Initialize distance array for the second player (Snuke), starting at the last vertex
    let distances_from_player_two = new Array(num_vertices).fill(num_vertices);
    distances_from_player_two[num_vertices - 1] = 0; // Snuke starts at the last node with distance 0

    // This helper function computes shortest path distances from a specified origin vertex
    function calculateShortestPaths(origin_vertex_id, distance_tracker_array) {
        // Create a list of all vertices, initially marking them as unvisited
        let unvisited_set = new Array(num_vertices);
        for (let node_index = 0; node_index < num_vertices; node_index++) {
            unvisited_set[node_index] = node_index; // Populate the list with vertex identifiers
        }

        // The vertex currently being examined for its neighbors and distance updates
        let current_focus_vertex = origin_vertex_id;

        // Continue as long as there are unvisited vertices in the set
        while (unvisited_set.length !== 0) {
            // Iterate through all provided edge definitions to find connections to the current_focus_vertex
            for (let edge_iteration = 0; edge_iteration < num_vertices - 1; edge_iteration++) {
                // Parse the first vertex of an edge from the raw input
                let vertex_u = parseInt(data_string[edge_iteration + 1].split(" ")[0]) - 1;
                // Parse the second vertex of an edge from the raw input
                let vertex_v = parseInt(data_string[edge_iteration + 1].split(" ")[1]) - 1;

                // If vertex_u is the current focus and vertex_v's distance can be improved via vertex_u
                if (vertex_u === current_focus_vertex && distance_tracker_array[vertex_v] > distance_tracker_array[vertex_u]) {
                    distance_tracker_array[vertex_v] = distance_tracker_array[vertex_u] + 1; // Update vertex_v's distance
                }
                // If vertex_v is the current focus and vertex_u's distance can be improved via vertex_v
                if (vertex_v === current_focus_vertex && distance_tracker_array[vertex_u] > distance_tracker_array[vertex_v]) {
                    distance_tracker_array[vertex_u] = distance_tracker_array[vertex_v] + 1; // Update vertex_u's distance
                }
            }

            // Remove the current focus vertex from the set of unvisited vertices, as its neighbors have been processed
            unvisited_set.splice(unvisited_set.indexOf(current_focus_vertex), 1);

            // Initialize with a value guaranteed to be larger than any possible path length in the graph
            let smallest_known_distance = num_vertices;
            // Placeholder for the next vertex to focus on, initially set to an invalid index
            let next_focus_candidate = -1;

            // Find the unvisited vertex with the minimum distance from the origin among the remaining unvisited nodes
            for (let queue_element_idx = 0; queue_element_idx < unvisited_set.length; queue_element_idx++) {
                if (distance_tracker_array[unvisited_set[queue_element_idx]] < smallest_known_distance) {
                    next_focus_candidate = unvisited_set[queue_element_idx]; // Update next focus candidate
                    smallest_known_distance = distance_tracker_array[unvisited_set[queue_element_idx]]; // Update smallest distance
                }
            }
            // Set the next vertex to be processed in the subsequent iteration
            current_focus_vertex = next_focus_candidate;
        }
        return distance_tracker_array; // Return the array containing all calculated shortest distances
    }

    // Calculate distances from Fennec's starting point (node 0)
    distances_from_player_one = calculateShortestPaths(0, distances_from_player_one);
    // Calculate distances from Snuke's starting point (node num_vertices - 1)
    distances_from_player_two = calculateShortestPaths(num_vertices - 1, distances_from_player_two);

    // Counter for nodes where player one (Fennec) has an advantage (shorter or equal distance)
    let player_one_controlled_nodes = 0;
    // Loop through all vertices to determine which player controls each intermediate node
    for (let current_vertex_id = 0; current_vertex_id < num_vertices; current_vertex_id++) {
        // Exclude the starting and ending vertices from the comparison, as they are fixed start points
        if (current_vertex_id !== 0 && current_vertex_id !== num_vertices - 1) {
            // If player one's path to this vertex is shorter than or equal to player two's path
            if (distances_from_player_one[current_vertex_id] <= distances_from_player_two[current_vertex_id]) {
                player_one_controlled_nodes++; // Increment count for player one's controlled nodes
            }
        }
    }

    // Default winner is Fennec
    let final_winner_name = "Fennec";
    // Compare the number of controlled nodes to decide the actual winner
    // If player one's controlled nodes are less than or equal to player two's controlled nodes, Snuke wins.
    // The total number of intermediate nodes is (num_vertices - 2).
    // So, if player_one_controlled_nodes <= (num_vertices - 2) - player_one_controlled_nodes
    if (player_one_controlled_nodes <= (num_vertices - 2) - player_one_controlled_nodes) {
        final_winner_name = "Snuke"; // Player two (Snuke) wins
    }

    // Display the name of the winning player to standard output
    console.log('%s', final_winner_name);
}

// Execute the main processing function with input read from standard input using Node.js filesystem module
EvaluateGameResult(require("fs").readFileSync("/dev/stdin", "utf8"));