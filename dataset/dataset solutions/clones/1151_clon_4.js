var output_writer = console.log;
if (typeof process != "undefined") {
    var accumulated_input = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(data_chunk) {
        accumulated_input += data_chunk;
    });
    process.stdin.on('end', function() {
        var all_lines = accumulated_input.split("\n");
        process_grid(all_lines);
    });
}

function compute_max_rectangle_in_histogram(bar_heights_array) {
    let largest_area_found = 0;
    let stack_for_indices = []; 

    for (let current_position = 0; current_position < bar_heights_array.length; current_position++) {
        while (stack_for_indices.length > 0 && bar_heights_array[stack_for_indices[stack_for_indices.length - 1]] >= bar_heights_array[current_position]) {
            let popped_index = stack_for_indices.pop();
            let height_at_index = bar_heights_array[popped_index];
            let width_of_rectangle = stack_for_indices.length === 0 ? current_position : current_position - stack_for_indices[stack_for_indices.length - 1] - 1;
            largest_area_found = Math.max(largest_area_found, height_at_index * width_of_rectangle);
        }
        stack_for_indices.push(current_position);
    }

    while (stack_for_indices.length > 0) {
        let popped_index = stack_for_indices.pop();
        let height_at_index = bar_heights_array[popped_index];
        let width_of_rectangle = stack_for_indices.length === 0 ? bar_heights_array.length : bar_heights_array.length - stack_for_indices[stack_for_indices.length - 1] - 1;
        largest_area_found = Math.max(largest_area_found, height_at_index * width_of_rectangle);
    }
    return largest_area_found;
}

function process_grid(input_lines_collection) {
    const numeric_grid_rows = input_lines_collection.map(row_string => row_string.split(" ").map(Number));
    const size_specification = numeric_grid_rows.shift();
    const grid_rows_count = size_specification[0];
    const grid_columns_count = size_specification[1];
    const actual_grid_content = numeric_grid_rows; 

    let overall_maximum_area = 0;
    let column_consecutive_zeros_heights = new Array(grid_columns_count).fill(0);

    for (let current_row_index = 0; current_row_index < grid_rows_count; current_row_index++) {
        for (let current_column_index = 0; current_column_index < grid_columns_count; current_column_index++) {
            if (actual_grid_content[current_row_index][current_column_index] === 0) {
                column_consecutive_zeros_heights[current_column_index]++;
            } else {
                column_consecutive_zeros_heights[current_column_index] = 0;
            }
        }
        overall_maximum_area = Math.max(overall_maximum_area, compute_max_rectangle_in_histogram(column_consecutive_zeros_heights));
    }
    output_writer(overall_maximum_area);
}