"use strict";
var raw_input_data = require("fs").readFileSync("/dev/stdin", "utf8");
var token_array = raw_input_data.split(/ |\n/);
var token_index = 0;

function get_next_int() { return +token_array[token_index++]; }
function get_next_string() { return token_array[token_index++]; }
function get_next_bigint() { return BigInt(token_array[token_index++]); }
function get_multiple_ints(count, map_func) {
    return map_func ? token_array.slice(token_index, token_index += count) : token_array.slice(token_index, token_index += count).map(val => +val);
}
function get_sorted_ints(count, descending) {
    return token_array.slice(token_index, token_index += count).map(val => +val).sort((a, b) => descending ? b - a : a - b);
}
function get_matrix(height, width, as_strings) {
    var result_matrix = [], row_idx = 0;
    if (as_strings) {
        for (; row_idx < height; row_idx++) result_matrix.push(token_array.slice(token_index, token_index += width));
    } else {
        for (; row_idx < height; row_idx++) result_matrix.push(token_array.slice(token_index, token_index += width).map(val => +val));
    }
    return result_matrix;
}
function create_multi_dim_array(initial_value) {
    var args = arguments, num_dims = args.length, current_expr = "Array(args[" + --num_dims + "]).fill().map(x=>{return " + initial_value + ";})";
    while (--num_dims) current_expr = "Array(args[" + num_dims + "]).fill().map(x=>" + current_expr + ")";
    return eval(current_expr);
}

var output_buffer = [];
function add_to_output(content) { output_buffer.push(content); }

var default_value_for_tree = 0;

function MaxRangeTree(max_coord_val) {
    this.max_range_size = max_coord_val;
    this.tree_nodes = Array(4 * max_coord_val).fill(default_value_for_tree);
    this.pending_updates = Array(4 * max_coord_val).fill(default_value_for_tree);
}

MaxRangeTree.prototype = {
    propagate_down: function(node_idx, current_range_start, current_range_end) {
        this.tree_nodes[node_idx] = Math.max(this.tree_nodes[node_idx], this.pending_updates[node_idx]);

        if (current_range_end - current_range_start > 1) {
            this.pending_updates[2 * node_idx + 1] = Math.max(this.pending_updates[2 * node_idx + 1], this.pending_updates[node_idx]);
            this.pending_updates[2 * node_idx + 2] = Math.max(this.pending_updates[2 * node_idx + 2], this.pending_updates[node_idx]);
        }
        this.pending_updates[node_idx] = default_value_for_tree;
    },

    update_range_max: function(node_idx, current_range_start, current_range_end, target_range_start, target_range_end, new_max_val) {
        this.propagate_down(node_idx, current_range_start, current_range_end);

        if (current_range_start >= target_range_end || current_range_end <= target_range_start) {
            return;
        }

        if (current_range_start >= target_range_start && current_range_end <= target_range_end) {
            this.pending_updates[node_idx] = Math.max(this.pending_updates[node_idx], new_max_val);
            this.propagate_down(node_idx, current_range_start, current_range_end);
            return;
        }

        var mid_point = Math.floor((current_range_start + current_range_end) / 2);
        this.update_range_max(2 * node_idx + 1, current_range_start, mid_point, target_range_start, target_range_end, new_max_val);
        this.update_range_max(2 * node_idx + 2, mid_point, current_range_end, target_range_start, target_range_end, new_max_val);

        this.tree_nodes[node_idx] = Math.max(this.tree_nodes[2 * node_idx + 1], this.tree_nodes[2 * node_idx + 2]);
    },

    query_point_max: function(node_idx, current_range_start, current_range_end, target_idx) {
        this.propagate_down(node_idx, current_range_start, current_range_end);

        if (current_range_end - current_range_start === 1) {
            return this.tree_nodes[node_idx];
        }

        var mid_point = Math.floor((current_range_start + current_range_end) / 2);
        if (target_idx < mid_point) {
            return this.query_point_max(2 * node_idx + 1, current_range_start, mid_point, target_idx);
        } else {
            return this.query_point_max(2 * node_idx + 2, mid_point, current_range_end, target_idx);
        }
    },

    query_range_max: function(node_idx, current_range_start, current_range_end, target_range_start, target_range_end) {
        this.propagate_down(node_idx, current_range_start, current_range_end);

        if (current_range_start >= target_range_end || current_range_end <= target_range_start) {
            return default_value_for_tree;
        }

        if (current_range_start >= target_range_start && current_range_end <= target_range_end) {
            return this.tree_nodes[node_idx];
        }

        var mid_point = Math.floor((current_range_start + current_range_end) / 2);
        var left_max = this.query_range_max(2 * node_idx + 1, current_range_start, mid_point, target_range_start, target_range_end);
        var right_max = this.query_range_max(2 * node_idx + 2, mid_point, current_range_end, target_range_start, target_range_end);
        return Math.max(left_max, right_max);
    }
};

var program_output = execute_main_logic();
if (program_output !== undefined) console.log(String(program_output));
if (output_buffer.length) console.log(output_buffer.join("\n"));

function execute_main_logic() {
    var [total_elements, range_param] = get_multiple_ints(2);
    var input_sequence = get_multiple_ints(total_elements);

    var max_coordinate = 300001;
    var max_tree_instance = new MaxRangeTree(max_coordinate);

    for (var current_idx = 0; current_idx < total_elements; current_idx++) {
        var lower_bound = Math.max(0, input_sequence[current_idx] - range_param);
        var upper_bound = Math.min(max_coordinate - 1, input_sequence[current_idx] + range_param);

        var current_max_len = max_tree_instance.query_point_max(0, 0, max_tree_instance.max_range_size, input_sequence[current_idx]);

        max_tree_instance.update_range_max(0, 0, max_tree_instance.max_range_size, lower_bound, upper_bound + 1, current_max_len + 1);
    }

    var final_result = max_tree_instance.query_range_max(0, 0, max_tree_instance.max_range_size, 0, max_tree_instance.max_range_size);
    
    return final_result;
}
