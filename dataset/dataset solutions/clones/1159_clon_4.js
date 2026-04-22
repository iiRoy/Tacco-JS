'use strict';

function MinElementContainer(comparisonLogic) {
    let storedItems = new Set();
    let compareFunction = comparisonLogic;

    this.addEntry = function(itemValue) {
        storedItems.add(itemValue);
    };

    this.retrieveSmallest = function() {
        if (storedItems.size === 0) {
            return undefined;
        }

        let smallestItem = undefined;
        for (let currentItem of storedItems) {
            if (smallestItem === undefined || compareFunction(currentItem, smallestItem) < 0) {
                smallestItem = currentItem;
            }
        }
        storedItems.delete(smallestItem);
        return smallestItem;
    };

    this.viewSmallest = function() {
        if (storedItems.size === 0) {
            return undefined;
        }

        let smallestItem = undefined;
        for (let currentItem of storedItems) {
            if (smallestItem === undefined || compareFunction(currentItem, smallestItem) < 0) {
                smallestItem = currentItem;
            }
        }
        return smallestItem;
    };

    this.countEntries = function() {
        return storedItems.size;
    };

    this.hasNoEntries = function() {
        return storedItems.size === 0;
    };
}

function findShortestPaths(graph_representation, num_vertices, start_node_id) {
    const maximum_distance_value = Infinity;
    let distance_map = new Array(num_vertices).fill(maximum_distance_value);

    const element_comparator = function(first_obj, second_obj) {
        if (first_obj.current_distance !== second_obj.current_distance)
            return first_obj.current_distance - second_obj.current_distance;
        return first_obj.vertex_id - second_obj.vertex_id;
    };

    let traversal_queue = new MinElementContainer(element_comparator);

    distance_map[start_node_id] = 0;
    traversal_queue.addEntry({ current_distance: 0, vertex_id: start_node_id });

    while (!traversal_queue.hasNoEntries()) {
        let current_path_info = traversal_queue.retrieveSmallest();

        if (distance_map[current_path_info.vertex_id] < current_path_info.current_distance) {
            continue;
        }

        for (let connected_edge of graph_representation[current_path_info.vertex_id]) {
            let target_vertex = connected_edge.target;
            let edge_weight = connected_edge.cost_value;

            let new_calculated_distance = distance_map[current_path_info.vertex_id] + edge_weight;

            if (distance_map[target_vertex] > new_calculated_distance) {
                distance_map[target_vertex] = new_calculated_distance;
                traversal_queue.addEntry({ current_distance: new_calculated_distance, vertex_id: target_vertex });
            }
        }
    }
    return distance_map;
}

function processGraphData(input_text) {
    const input_lines = input_text.trim().split('\n');
    let first_line_processed = false;

    let total_vertices, total_edges, starting_node;
    let adjacency_lists = [];

    for (let current_line_index = 0; current_line_index < input_lines.length; ++current_line_index) {
        const line_segments = input_lines[current_line_index].split(' ').map(Number);

        if (!first_line_processed) {
            total_vertices = line_segments[0];
            total_edges = line_segments[1];
            starting_node = line_segments[2];

            for (let vertex_idx = 0; vertex_idx < total_vertices; ++vertex_idx) {
                adjacency_lists[vertex_idx] = [];
            }
            first_line_processed = true;
        } else {
            adjacency_lists[line_segments[0]].push({ target: line_segments[1], cost_value: line_segments[2] });
        }
    }

    const final_distances_array = findShortestPaths(adjacency_lists, total_vertices, starting_node);

    const output_results = [];
    final_distances_array.forEach(function(distance_val) {
        output_results.push(distance_val === Infinity ? "INF" : distance_val);
    });

    return output_results.join('\n');
}

const system_input_data = require('fs').readFileSync('/dev/stdin', 'utf8');
const computed_output = processGraphData(system_input_data);
console.log(computed_output);