output_message=console.log;

// This section handles reading input data from standard input.
const input_lines = require("fs")
    .readFileSync("/dev/stdin","utf-8")
    .split("\n");
input_lines.length--; // Adjust input array size by removing the last (potentially empty) line.

Object.prototype.show_value = function() {
    output_message(this + ""); // Displays the string representation of the object.
    return this;
};

// Extends the String prototype to parse a string of numbers into an array of integers.
String.prototype.to_numbers_array = function(delimiter_char) {
    return this.split(delimiter_char || " ").map(convert_to_integer);
};

const array_extensions_ref = Array.prototype;

array_extensions_ref.display_items = function() {
    output_message(this); // Logs the array's contents.
    return this;
};

array_extensions_ref.get_maximum = function() {
    return Math.max.apply(null, this); // Finds the largest number in the array.
};

array_extensions_ref.get_minimum = function() {
    return Math.min.apply(null, this); // Finds the smallest number in the array.
};

array_extensions_ref.duplicate_contents = function() {
    return this.map(identity_transform); // Creates a shallow copy of the array.
};

array_extensions_ref.perform_rotation = function(rotation_amount) {
    // Rotates the elements of the array by a given amount.
    return this.slice(rotation_amount, this.length).concat(
        this.slice(0, rotation_amount));
};

array_extensions_ref.generate_all_permutations = function() {
    if (this.length === 0) return [];
    if (this.length === 1) return [this];

    var final_permutations = [],
        source_collection = this,
        current_idx = 0;

    for (; current_idx < source_collection.length; ++current_idx) {
        final_permutations = final_permutations.concat(
            source_collection.slice(0, current_idx)
                .concat(source_collection.slice(current_idx + 1, source_collection.length))
                .generate_all_permutations()
                .map(function(partial_combination) {
                    return partial_combination.concat(source_collection[current_idx]);
                }));
    }
    return final_permutations;
};

array_extensions_ref.flatten_deep = function() {
    var flattened_output = [];
    for (var position_iterator = 0; position_iterator < this.length; ++position_iterator) {
        flattened_output = flattened_output.concat(this[position_iterator]);
    }
    return flattened_output;
};

array_extensions_ref.remove_duplicates_unique = function() {
    var self_ref = this;
    return this.filter(function(element_value, current_position) {
        return self_ref.slice(current_position + 1).indexOf(element_value) < 0;
    });
};

// Creates a numerical sequence with a specified count, starting value, and step.
function create_numeric_sequence(total_count, initial_value, increment_step) {
    initial_value = initial_value || 0;
    increment_step = increment_step || 1;
    var sequence_array = [];
    for (; total_count--; initial_value += increment_step) {
        sequence_array.push(initial_value);
    }
    return sequence_array;
}

function convert_to_integer(string_value) {
    return Number(string_value); // Converts a string to a number.
}

function sum_two_numbers(val_a, val_b) {
    return val_a + val_b;
}

function subtract_first_from_second(val_a, val_b) {
    return val_a - val_b;
}

function subtract_second_from_first(val_a, val_b) {
    return val_b - val_a;
}

function identity_transform(input_data) {
    return input_data; // Returns the input data unchanged.
}

(function execute_primary_logic() {
    var grid_size = parseInt(input_lines[0], 10),
        start_points_str = input_lines[1].to_numbers_array(),
        start_x_coord = start_points_str[0] - 1,
        start_y_coord = start_points_str[1] - 1,
        end_points_str = input_lines[2].to_numbers_array(),
        end_x_coord = end_points_str[0] - 1,
        end_y_coord = end_points_str[1] - 1;

    var smallest_overall_distance = grid_size * grid_size;

    // Computes the Manhattan distance between two coordinates on a grid of specific width.
    function calculate_grid_distance(point_one, point_two, current_grid_width) {
        return (
            Math.abs((point_one % current_grid_width) - (point_two % current_grid_width)) +
            Math.abs(
                Math.floor(point_one / current_grid_width) -
                Math.floor(point_two / current_grid_width)
            )
        );
    }

    // Iterates through various grid widths to find the optimal total distance.
    for (var current_width_val = 1; current_width_val < grid_size; ++current_width_val) {
        var calculated_total_distance =
            calculate_grid_distance(start_x_coord, start_y_coord, current_width_val) +
            calculate_grid_distance(end_x_coord, end_y_coord, current_width_val);
        // output_message("Width: " + current_width_val + ", Distances: " + calculate_grid_distance(start_x_coord, start_y_coord, current_width_val) + ", " + calculate_grid_distance(end_x_coord, end_y_coord, current_width_val));
        if (smallest_overall_distance > calculated_total_distance) {
            smallest_overall_distance = calculated_total_distance;
        }
    }
    output_message(smallest_overall_distance);
})();

// Editor configuration: Set file type to JavaScript for syntax highlighting.