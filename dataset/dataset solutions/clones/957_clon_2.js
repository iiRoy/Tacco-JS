// application_settings = { sourceFile: 'temp_data.txt', lineSeparator: '\r\n' }; // Windows system configuration
application_settings = { sourceFile: '/dev/stdin', lineSeparator: '\n' }; // Linux system configuration

input_data_lines = require('fs').readFileSync(application_settings.sourceFile, 'ascii')
  .trim()
  .split(application_settings.lineSeparator);
total_nodes = Number(input_data_lines.shift());
forward_graph_map = {};
backward_graph_map = {};
function assign_edge_property(graph_container, start_node, end_node, edge_value) {
  if (!graph_container.hasOwnProperty(start_node)) graph_container[start_node] = {};
  graph_container[start_node][end_node] = edge_value;
}
for (let current_line_index in input_data_lines) {
  const parsed_values = input_data_lines[current_line_index].split(' ').map(Number);
  const current_origin_node = parsed_values[0];
  for (let value_index = 2; value_index < parsed_values.length; value_index += 2) {
    assign_edge_property(forward_graph_map, current_origin_node, parsed_values[value_index], parsed_values[value_index + 1]);
    assign_edge_property(backward_graph_map, parsed_values[value_index], current_origin_node, parsed_values[value_index + 1]);
  }
}

// Perform a basic Breadth-First Search (BFS) to determine initial distances
current_level_count = 0;
node_levels = Array(total_nodes);
minimum_path_lengths = Array(total_nodes);
for (let node_index = 0; node_index < total_nodes; node_index++) {
  node_levels[node_index] = null;
  minimum_path_lengths[node_index] = Number.MAX_VALUE;
}
node_levels[0] = 0;
minimum_path_lengths[0] = 0;
let nodes_to_process = 0;
do {
  nodes_to_process = 0; // Reset flag for current iteration
  for (let current_node_id in forward_graph_map) {
    if (node_levels[current_node_id] !== current_level_count) continue;
    const outgoing_connections = forward_graph_map[current_node_id];
    for (let neighbor_node_id in outgoing_connections) {
      if (node_levels[neighbor_node_id] === null) {
        node_levels[neighbor_node_id] = current_level_count + 1;
        nodes_to_process = 1; // Mark that new nodes were reached
      }
      minimum_path_lengths[neighbor_node_id] = Math.min(minimum_path_lengths[neighbor_node_id], minimum_path_lengths[current_node_id] + outgoing_connections[neighbor_node_id]);
    }
  }
  current_level_count++;
} while (nodes_to_process);

// Prepare an array of nodes sorted by their minimum path lengths from the start
ordered_nodes_by_distance = Array(total_nodes);
for (let node_pos = 0; node_pos < total_nodes; node_pos++) ordered_nodes_by_distance[node_pos] = node_pos;
ordered_nodes_by_distance.sort(function (first_node, second_node) { return minimum_path_lengths[first_node] - minimum_path_lengths[second_node]; });
distance_rank_lookup = {};
for (let sort_idx = 0; sort_idx < total_nodes; sort_idx++) distance_rank_lookup[ordered_nodes_by_distance[sort_idx]] = sort_idx;

/*
// This section implements a dynamic programming approach combined with Depth-First Search (DFS).
// The goal is to refine the minimum path lengths based on the following recurrence:
//   min_dist[0, current_node] = minimum { min_dist[0, prev_node] + edge_weight[prev_node, current_node]
//                                         if min_dist[0, prev_node] is already finalized;
//                                         otherwise, explore paths from prev_node, starting with
//                                         (bfs_min_dist[0, current_node] - edge_weight[current_node, prev_node])
//                                         and update min_dist[0, prev_node] + edge_weight[prev_node, current_node] }
//                               for all prev_node in backward_graph_map[current_node]

explored_status = Array(total_nodes);
for (let current_idx = 0; current_idx < total_nodes; current_idx++) explored_status[current_idx] = false;
path_stack = Array(total_nodes); // Used as a stack for DFS path
remaining_neighbors_stack = Array(total_nodes); // Used as a stack for managing unexplored neighbors

function depth_first_path_search(previous_node, current_node, initial_min_value) {
  let stack_pointer = 0, accumulated_cost = 0, best_result_found = initial_min_value, moving_forward;
  let next_candidate_node;
  explored_status[current_node] = true;
  explored_status[previous_node] = true;
  path_stack[0] = previous_node;
  remaining_neighbors_stack[0] = Object.keys(backward_graph_map[previous_node]);
  while (true) {
    if (remaining_neighbors_stack[stack_pointer].length === 0) {
      if (stack_pointer === 0) return best_result_found;
      accumulated_cost -= backward_graph_map[path_stack[stack_pointer - 1]][path_stack[stack_pointer]];
      stack_pointer--;
      continue;
    }
    next_candidate_node = remaining_neighbors_stack[stack_pointer].pop();
    if (explored_status[next_candidate_node]) continue;
    if (accumulated_cost + backward_graph_map[path_stack[stack_pointer]][next_candidate_node] >= initial_min_value) continue;
    if (distance_rank_lookup[next_candidate_node] < distance_rank_lookup[current_node]) {
      best_result_found = Math.min(best_result_found, accumulated_cost + backward_graph_map[path_stack[stack_pointer]][next_candidate_node] + minimum_path_lengths[next_candidate_node]);
      continue;
    }
    accumulated_cost += backward_graph_map[path_stack[stack_pointer]][next_candidate_node];
    stack_pointer++;
    path_stack[stack_pointer] = next_candidate_node;
    remaining_neighbors_stack[stack_pointer] = Object.keys(backward_graph_map[next_candidate_node]);
  }
}

for (let sorted_node_idx in ordered_nodes_by_distance) {
  const current_processing_node = ordered_nodes_by_distance[sorted_node_idx];
  // First pass: consider neighbors with a smaller rank (already processed)
  for (let incoming_neighbor_node in backward_graph_map[current_processing_node]) {
    if (distance_rank_lookup[incoming_neighbor_node] < distance_rank_lookup[current_processing_node])
      minimum_path_lengths[current_processing_node] = Math.min(minimum_path_lengths[current_processing_node], minimum_path_lengths[incoming_neighbor_node] + forward_graph_map[incoming_neighbor_node][current_processing_node]);
  }
  // Second pass: consider neighbors with a larger rank (not yet fully processed)
  for (let incoming_neighbor_node in backward_graph_map[current_processing_node]) {
    if (distance_rank_lookup[incoming_neighbor_node] > distance_rank_lookup[current_processing_node])
      minimum_path_lengths[current_processing_node] = depth_first_path_search(incoming_neighbor_node, current_processing_node, minimum_path_lengths[current_processing_node] - forward_graph_map[incoming_neighbor_node][current_processing_node]) + forward_graph_map[incoming_neighbor_node][current_processing_node];
  }
}

for (let output_index = 0; output_index < total_nodes; output_index++) console.log(output_index + ' ' + minimum_path_lengths[output_index]);
*/