let captured_input = '';
let input_pointer = 0;
let parsed_data = [];

function obtain_value() {
    return +parsed_data[input_pointer++];
}

function display_outcome(value_to_show) {
    console.log(value_to_show);
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunk) {
    captured_input += chunk;
});

process.stdin.on('end', function() {
    parsed_data = captured_input.split(/\s+/).filter(Boolean);
    process_scenario();
});

function extract_min_from_collection(elements_list) {
    if (elements_list.length === 0) {
        return undefined;
    }

    let min_value_index = 0;
    for (let j = 1; j < elements_list.length; j++) {
        if (elements_list[j][0] < elements_list[min_value_index][0]) {
            min_value_index = j;
        }
    }

    const item_to_return = elements_list[min_value_index];
    elements_list.splice(min_value_index, 1);
    return item_to_return;
}

function process_scenario() {
    const total_nodes = obtain_value();
    const total_edges = obtain_value();
    const starting_point = obtain_value();

    const adjacency_structure = new Map();
    for (let node_id = 0; node_id < total_nodes; ++node_id) {
        adjacency_structure.set(node_id, []);
    }

    for (let edge_count = 0; edge_count < total_edges; ++edge_count) {
        const source_node = obtain_value();
        const target_node = obtain_value();
        const weight_val = obtain_value();
        adjacency_structure.get(source_node).push({ endpoint: target_node, cost: weight_val });
    }

    const shortest_paths_record = new Map();
    for (let node_id = 0; node_id < total_nodes; ++node_id) {
        shortest_paths_record.set(node_id, Number.POSITIVE_INFINITY);
    }

    shortest_paths_record.set(starting_point, 0);

    const pending_discoveries = [];
    pending_discoveries.push([0, starting_point]);

    while (pending_discoveries.length > 0) {
        const current_entry = extract_min_from_collection(pending_discoveries);
        const current_distance = current_entry[0];
        const current_vertex = current_entry[1];

        if (current_distance > shortest_paths_record.get(current_vertex)) {
            continue;
        }

        const neighbors_of_current = adjacency_structure.get(current_vertex);
        if (neighbors_of_current) {
            for (const connection of neighbors_of_current) {
                const neighbor_vertex = connection.endpoint;
                const edge_cost = connection.cost;

                const potential_new_distance = current_distance + edge_cost;

                if (potential_new_distance < shortest_paths_record.get(neighbor_vertex)) {
                    shortest_paths_record.set(neighbor_vertex, potential_new_distance);
                    pending_discoveries.push([potential_new_distance, neighbor_vertex]);
                }
            }
        }
    }

    for (let node_id = 0; node_id < total_nodes; ++node_id) {
        const final_distance = shortest_paths_record.get(node_id);
        display_outcome(final_distance !== Number.POSITIVE_INFINITY ? final_distance : 'INF');
    }
}