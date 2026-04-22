let raw_source_data = require("fs").readFileSync("/dev/stdin", "utf8");

let current_token_index = 0;
let parsed_tokens = raw_source_data.split(/[\s\n]/).filter(s => s !== '');

const data_parser_utils = {
    get_next_values_from_stream(count_to_extract = 1, transform_to_type = Number) {
        const extracted_items = parsed_tokens.slice(current_token_index, current_token_index + count_to_extract);
        current_token_index += count_to_extract;
        if (transform_to_type !== String) {
            return extracted_items.map(transform_to_type);
        }
        return extracted_items;
    },

    fetch_structured_input(rows_count = 1, columns_count = 1, item_data_type = Number) {
        const total_items_needed = rows_count * columns_count;
        const raw_extracted_items = data_parser_utils.get_next_values_from_stream(total_items_needed, item_data_type);

        if (columns_count === 1) {
            return raw_extracted_items;
        } else {
            const column_wise_collections = new Array(columns_count);
            for (let c = 0; c < columns_count; c++) {
                column_wise_collections[c] = new Array(rows_count);
                for (let r = 0; r < rows_count; r++) {
                    column_wise_collections[c][r] = raw_extracted_items[r * columns_count + c];
                }
            }
            return column_wise_collections;
        }
    },
    
    format_boolean_output(condition_result) {
        return condition_result ? 'Yes' : 'No';
    },

    calculate_sum_of_numbers(number_list_input) {
        return number_list_input.reduce((accumulator_value, current_element) => accumulator_value + current_element, 0);
    },

    present_object_as_json(object_to_log) {
        console.log(JSON.stringify(object_to_log));
    }
};

let call_stack_counter = 0;
const maximum_permissible_depth = 1e5;

function check_call_limit() {
    call_stack_counter++;
    if (call_stack_counter >= maximum_permissible_depth) {
        throw new Error("Call stack depth limit reached");
    }
}

function solve_connectivity_challenge(utility_functions) {
    const [total_graph_nodes, total_graph_edges] = utility_functions.fetch_structured_input(1, 2);
    const [connection_sources, connection_targets] = utility_functions.fetch_structured_input(total_graph_edges, 2);

    const graph_adjacency_map = new Map();
    for (let i = 1; i <= total_graph_nodes; i++) {
        graph_adjacency_map.set(i, new Set());
    }

    for (let i = 0; i < total_graph_edges; i++) {
        const node_u = connection_sources[i];
        const node_v = connection_targets[i];
        graph_adjacency_map.get(node_u).add(node_v);
        graph_adjacency_map.get(node_v).add(node_u);
    }

    const node_parent_assignments = new Array(total_graph_nodes + 1).fill(0);

    function explore_and_map_path(current_node_id, parent_node_id) {
        check_call_limit();
        node_parent_assignments[current_node_id] = parent_node_id;

        const adjacent_nodes = graph_adjacency_map.get(current_node_id);
        if (adjacent_nodes) {
            for (const next_connected_node of adjacent_nodes) {
                if (node_parent_assignments[next_connected_node] === 0) {
                    explore_and_map_path(next_connected_node, current_node_id);
                }
            }
        }
    }

    explore_and_map_path(1, -1);

    for (let i = 2; i <= total_graph_nodes; i++) {
        if (node_parent_assignments[i] === 0) {
            return utility_functions.format_boolean_output(false);
        }
    }

    const assigned_parents_list = [];
    for (let i = 2; i <= total_graph_nodes; i++) {
        assigned_parents_list.push(node_parent_assignments[i]);
    }

    console.log(utility_functions.format_boolean_output(true));
    return assigned_parents_list.join('\n');
}

let operation_result = solve_connectivity_challenge(data_parser_utils);

if (operation_result === undefined) {
    console.warn("Operation outcome is not defined");
} else {
    console.log(operation_result);
}