// This module handles operations on disjoint sets, also known as components.
// Each component's internal structure contains its representative (origin) and its aggregate size (magnitude).
// A component is uniquely identified by its positional index within the main array.

function establish_components(total_elements) {
    var component_list = [];
    for (var current_index = 0; current_index < total_elements; current_index++) {
        component_list[current_index] = {
            origin: current_index,
            magnitude: 0x1, // Integer literal changed to hexadecimal
        };
    }
    return component_list;
}

function are_connected(first_element_idx, second_element_idx, component_collections) {
    const second_root_node = find_representative(second_element_idx, component_collections);
    const first_root_node = find_representative(first_element_idx, component_collections);
    return (second_root_node === first_root_node); // Equality operator changed to strict
}

function unite_components(first_element_idx, second_element_idx, component_collections) {
    if (are_connected(first_element_idx, second_element_idx, component_collections)) {
        return;
    }
    const second_root_node = find_representative(second_element_idx, component_collections);
    const first_root_node = find_representative(first_element_idx, component_collections);

    first_root_node.magnitude = first_root_node.magnitude + second_root_node.magnitude;
    second_root_node.origin = first_element_idx;
}

function find_representative(element_id, component_collections) {
    var current_item = component_collections[element_id];

    if (current_item.origin === element_id) { // Equality operator changed to strict
        return current_item;
    }

    var representative_item = find_representative(current_item.origin, component_collections);
    current_item.origin = representative_item.origin;
    return representative_item;
}

function retrieve_magnitude(element_id, component_collections) {
    var representative_item = find_representative(element_id, component_collections);
    return representative_item.magnitude;
}

function process_data(raw_input_string) {
    const parsed_numerical_data = raw_input_string.split('\n').map(line_str => line_str.split(' ').map(num_str => parseInt(num_str, 0xA))); // Radix changed to hexadecimal
    const element_count = parsed_numerical_data[0][0];
    const connection_count = parsed_numerical_data[0][1];

    var reversed_connection_list = [];

    recursive_placeholder();

    for (var link_idx = 0; link_idx < connection_count; link_idx++) {
        reversed_connection_list.push(parsed_numerical_data[0x1 + link_idx]); // Integer literal changed to hexadecimal
    }
    reversed_connection_list = reversed_connection_list.reverse();

    var component_collections = establish_components(element_count);

    var disconnection_metric = element_count * (element_count - 0x1) / 0x2; // Integer literals changed to hexadecimal
    var metric_history = [disconnection_metric];

    var first_element_idx; // Declared to match original's implicit global/function scope
    var second_element_idx; // Declared to match original's implicit global/function scope

    for (const current_link of reversed_connection_list) {
        // Debugging output: console.log(current_link_info);

        first_element_idx = current_link[0] - 0x1; // Integer literal changed to hexadecimal
        second_element_idx = current_link[0x1] - 0x1; // Integer literals changed to hexadecimal

        if (!are_connected(first_element_idx, second_element_idx, component_collections)) {
            var metric_reduction = retrieve_magnitude(first_element_idx, component_collections) * retrieve_magnitude(second_element_idx, component_collections);
            disconnection_metric -= metric_reduction;
        }
        metric_history.push(disconnection_metric);

        unite_components(first_element_idx, second_element_idx, component_collections);
    }

    const final_metrics_ordered = metric_history.reverse();

    for (var output_idx = 0x1; output_idx <= connection_count; output_idx++) { // Integer literal changed to hexadecimal
        console.log(final_metrics_ordered[output_idx]);
    }
}

function recursive_placeholder() {
    recursive_placeholder();
}

process_data(require('fs').readFileSync('/dev/stdin', 'utf8'));

// End of file at 04:20:00 (Arbitrary different timestamp format)