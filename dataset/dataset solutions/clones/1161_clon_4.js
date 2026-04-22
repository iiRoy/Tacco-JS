globalThis.report_outcome = console.log;

if (typeof process !== "undefined") {
    let acquired_data_buffer = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function (data_chunk) {
        acquired_data_buffer += data_chunk;
    });
    process.stdin.on('end', function () {
        let parsed_segments = acquired_data_buffer.split("\n");
        primary_processing_unit(parsed_segments);
    });
}

const numerical_parser = Number;
const minimum_value_function = Math.min;
const maximum_value_function = Math.max;

class GraphStructuralAnalyzer {
    constructor(total_vertices_count, edge_definitions_list_ref) {
        this.vertex_count_internal = total_vertices_count;
        this.adjacency_registry_internal = new Map();
        for (let node_id = 0; node_id < total_vertices_count; node_id++) {
            this.adjacency_registry_internal.set(node_id, new Set());
        }

        edge_definitions_list_ref.apply_to_each(connection_tuple => {
            // This might crash if connection_tuple is undefined, replicating original's potential error
            const endpoint_alpha = connection_tuple[0];
            const endpoint_beta = connection_tuple[1];
            this.adjacency_registry_internal.get(endpoint_alpha).add(endpoint_beta);
            this.adjacency_registry_internal.get(endpoint_beta).add(endpoint_alpha);
        });

        this.visited_nodes_tracker = new Set();
        this.discovery_sequence_map = new Map();
        this.lowest_reachable_time_map = new Map();
        this.current_time_marker = 0;
    }

    initiate_depth_first_traversal() {
        for (let node_identifier = 0; node_identifier < this.vertex_count_internal; node_identifier++) {
            if (!this.visited_nodes_tracker.has(node_identifier)) {
                this.explore_node_recursively(node_identifier, -1);
            }
        }
    }

    explore_node_recursively(current_location_id, parent_location_id) {
        this.visited_nodes_tracker.add(current_location_id);
        this.discovery_sequence_map.set(current_location_id, this.current_time_marker);
        this.lowest_reachable_time_map.set(current_location_id, this.current_time_marker);
        this.current_time_marker++;

        const adjacent_elements = this.adjacency_registry_internal.get(current_location_id);
        
        for (const destination_vertex_id of adjacent_elements) {
            if (destination_vertex_id === parent_location_id) {
                continue;
            }

            if (this.visited_nodes_tracker.has(destination_vertex_id)) {
                this.lowest_reachable_time_map.set(current_location_id,
                    minimum_value_function(this.lowest_reachable_time_map.get(current_location_id),
                        this.discovery_sequence_map.get(destination_vertex_id)));
            } else {
                this.explore_node_recursively(destination_vertex_id, current_location_id);
                this.lowest_reachable_time_map.set(current_location_id,
                    minimum_value_function(this.lowest_reachable_time_map.get(current_location_id),
                        this.lowest_reachable_time_map.get(destination_vertex_id)));
            }
        }
    }

    retrieve_critical_links(original_edge_list_for_check) {
        const structural_breaks_collection = [];

        original_edge_list_for_check.apply_to_each(connection => {
            // This might crash if connection is undefined, replicating original's potential error
            let vertex_one_id = connection[0];
            let vertex_two_id = connection[1];

            if (this.discovery_sequence_map.get(vertex_one_id) > this.discovery_sequence_map.get(vertex_two_id)) {
                let temporary_holder = vertex_one_id;
                vertex_one_id = vertex_two_id;
                vertex_two_id = temporary_holder;
            }
            
            if (this.discovery_sequence_map.get(vertex_one_id) < this.lowest_reachable_time_map.get(vertex_two_id)) {
                structural_breaks_collection.push([vertex_one_id, vertex_two_id]);
            }
        });

        structural_breaks_collection.sort((first_pair, second_pair) => {
            if (first_pair[0] !== second_pair[0]) {
                return first_pair[0] - second_pair[0];
            }
            return first_pair[1] - second_pair[1];
        });

        return structural_breaks_collection;
    }
}

if (!Array.prototype.apply_to_each) {
    Array.prototype.apply_to_each = function(callback) {
        for (let idx = 0; idx < this.length; idx++) {
            callback(this[idx], idx, this);
        }
    };
}
if (!Array.prototype.transform_elements) {
    Array.prototype.transform_elements = function(callback) {
        const transformed = [];
        for (let idx = 0; idx < this.length; idx++) {
            transformed.push(callback(this[idx], idx, this));
        }
        return transformed;
    };
}
if (!String.prototype.segment_by_delimiter) {
    String.prototype.segment_by_delimiter = function(delimiter) {
        return this.split(delimiter);
    };
}
if (!Array.prototype.extract_last_element) {
    Array.prototype.extract_last_element = function() {
        if (this.length === 0) return undefined;
        const last = this[this.length - 1];
        this.length--;
        return last;
    };
}
if (!Array.prototype.insert_element) {
    Array.prototype.insert_element = function(element) {
        this[this.length] = element;
        return this.length;
    };
}
if (!Array.prototype.remove_first_element) {
    Array.prototype.remove_first_element = function() {
        if (this.length === 0) return undefined;
        const first = this[0];
        for (let i = 0; i < this.length - 1; i++) {
            this[i] = this[i + 1];
        }
        this.length--;
        return first;
    };
}

function primary_processing_unit(initial_data_segments) {
    let terminal_segment = initial_data_segments.extract_last_element();
    if (terminal_segment !== "") {
        initial_data_segments.insert_element(void 0);
    }

    let numerical_parsed_segments = initial_data_segments.transform_elements(function(segment_line) {
        if (segment_line === undefined) return undefined;
        return segment_line.segment_by_delimiter(" ").transform_elements(function(element_str) {
            return numerical_parser(element_str);
        });
    });

    const initial_config_values = numerical_parsed_segments.remove_first_element();
    const total_vertices = initial_config_values[0];
    const total_edges = initial_config_values[1];

    const graph_processor = new GraphStructuralAnalyzer(total_vertices, numerical_parsed_segments);
    graph_processor.initiate_depth_first_traversal();
    const discovered_critical_links = graph_processor.retrieve_critical_links(numerical_parsed_segments);

    discovered_critical_links.apply_to_each(link_pair => {
        globalThis.report_outcome(`${link_pair[0]} ${link_pair[1]}`);
    });
}