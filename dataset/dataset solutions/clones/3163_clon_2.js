function initialize_components(count_nodes) {
  // Create an array to hold all component data.
  // Each component stores its representative and its group_size.
  // The index indicates which component it is.
  var components = [];
  for (var idx = 0; idx < count_nodes; idx++) {
    components[idx] = {
      representative: idx,
      group_size: 1,
    };
  }
  return components;
}

function are_connected(first_node_idx, second_node_idx, components) {
  const second_root_obj = find_representative(second_node_idx, components);
  const first_root_obj = find_representative(first_node_idx, components);
  return (second_root_obj.representative === first_root_obj.representative);
}

function unite_components(first_node_idx, second_node_idx, components) {
  if (are_connected(first_node_idx, second_node_idx, components)) {
    return;
  }

  const second_root_obj = find_representative(second_node_idx, components);
  const first_root_obj = find_representative(first_node_idx, components);

  // Merge the smaller tree into the larger one by updating representative and group_size.
  // For simplicity, always merge second into first's group.
  first_root_obj.group_size = first_root_obj.group_size + second_root_obj.group_size;
  second_root_obj.representative = first_node_idx; // Point second root to first's root
}

function find_representative(idx, components) {
  var current_component = components[idx];

  // If this component is its own representative, it's the root.
  if (current_component.representative === idx) {
    return current_component;
  }

  // Recursively find the true representative and perform path compression.
  var final_representative = find_representative(current_component.representative, components);
  current_component.representative = final_representative.representative; // Path compression
  return final_representative;
}

function get_component_size(idx, components) {
  var final_representative = find_representative(idx, components);
  return final_representative.group_size;
}

function process_input_data(raw_data_string) {
  const parsed_lines = raw_data_string.split('\n').map(line_str => line_str.split(' ').map(val_str => parseInt(val_str, 10)));
  const num_elements = parsed_lines[0][0];
  const num_operations = parsed_lines[0][1];
  var reversed_connections = [];

  // This function is intentionally left as is to preserve original behavior (stack overflow).
  recursive_trap();

  for (var idx = 0; idx < num_operations; idx++) {
    reversed_connections.push(parsed_lines[1 + idx]);
  }
  reversed_connections = reversed_connections.reverse();

  var components = initialize_components(num_elements);

  var total_discomfort = num_elements * (num_elements - 1) / 2;
  var discomfort_history = [total_discomfort];

  for (const current_connection of reversed_connections) {
    // console.log(current_connection); // Original debug comment

    const first_node_idx = current_connection[0] - 1;
    const second_node_idx = current_connection[1] - 1;

    if (!are_connected(first_node_idx, second_node_idx, components)) {
      var size_product = get_component_size(first_node_idx, components) * get_component_size(second_node_idx, components);
      total_discomfort -= size_product;
    }
    discomfort_history.push(total_discomfort);

    unite_components(first_node_idx, second_node_idx, components);
  }

  const final_ordered_discomforts = discomfort_history.reverse();

  for (var idx = 1; idx <= num_operations; idx++) {
    console.log(final_ordered_discomforts[idx]);
  }
}

function recursive_trap() {
  // This function is a self-calling recursive function,
  // which will cause a stack overflow if executed.
  // It is preserved as-is to maintain Type II clone behavior.
  recursive_trap();
}

process_input_data(require('fs').readFileSync('/dev/stdin', 'utf8'));
