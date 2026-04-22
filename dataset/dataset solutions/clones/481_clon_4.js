const lib_io = require('fs');

const standard_input_descriptor = 0;
const raw_data_buffer = lib_io.readFileSync(standard_input_descriptor);
const data_lines_raw = raw_data_buffer.toString('utf8').split('\n');

let line_pointer = 0;
const get_next_line = () => {
  if (line_pointer < data_lines_raw.length) {
    return data_lines_raw[line_pointer++];
  }
  return null;
};

function check_circuit(node_count, connections_map, start_node_idx) {
  const traversal_stack = [];
  
  traversal_stack.push({
    current_vertex: start_node_idx,
    visited_vertices_set: new Set([start_node_idx]),
    current_path_array: [start_node_idx]
  });

  while (traversal_stack.length > 0) {
    const { current_vertex, visited_vertices_set, current_path_array } = traversal_stack.pop();

    if (current_path_array.length === node_count) {
      const potential_return_edges = connections_map.get(current_vertex);
      if (potential_return_edges && potential_return_edges.has(start_node_idx)) {
        return true;
      }
      continue;
    }

    const successors = connections_map.get(current_vertex);
    if (successors) {
      const sorted_successors = Array.from(successors).sort((a, b) => b - a); // Process smaller indices last (pushed first)
      for (const next_vertex of sorted_successors) {
        if (!visited_vertices_set.has(next_vertex)) {
          const next_visited_set = new Set(visited_vertices_set);
          next_visited_set.add(next_vertex);
          const next_path = current_path_array.concat(next_vertex);
          traversal_stack.push({
            current_vertex: next_vertex,
            visited_vertices_set: next_visited_set,
            current_path_array: next_path
          });
        }
      }
    }
  }

  return false;
}

(function process_all_datasets() {
  let node_count_str;
  while ((node_count_str = get_next_line()) !== null && node_count_str.trim() !== '0') {
    const node_count = parseInt(node_count_str.trim(), 10);
    if (isNaN(node_count) || node_count < 1) {
        continue;
    }

    const vertex_strings = [];
    for (let node_iterator = 0; node_iterator < node_count; node_iterator++) {
      const line = get_next_line();
      if (line === null) {
          console.error("Error: Unexpected end of input while reading vertex strings.");
          return;
      }
      vertex_strings.push(line.trim());
    }

    const connections_map = new Map();
    for (let node_iterator = 0; node_iterator < node_count; node_iterator++) {
      const current_string_val = vertex_strings[node_iterator];
      const final_char = current_string_val[current_string_val.length - 1];
      
      if (!connections_map.has(node_iterator)) {
        connections_map.set(node_iterator, new Set());
      }

      for (let second_iterator = 0; second_iterator < node_count; second_iterator++) {
        if (node_iterator === second_iterator) {
          continue;
        }
        const target_string_val = vertex_strings[second_iterator];
        if (final_char === target_string_val[0]) {
          connections_map.get(node_iterator).add(second_iterator);
        }
      }
    }
    
    const initial_node = 0;
    const cycle_found = check_circuit(node_count, connections_map, initial_node);
    
    console.log(cycle_found ? 'OK' : 'NG');
  }
})();