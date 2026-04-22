function execute_process() {
    // Acquire the initial raw input stream for processing.
    var initial_data = raw_input_stream;

    /*
     * Initialize a two-dimensional array (matrix) to represent
     * a grid or field. It's a 14x14 matrix, filled with zero values.
     * These zeros will be incremented based on input data.
     */
    var grid_matrix = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];


    // Determine the effective length for iteration, adjusting for zero-based indexing.
    var data_length = initial_data.length - 1;

    // Iterate backwards through the input data segments.
    for (; data_length--;) {
        var current_line_segment = initial_data[data_length];

        // Parse coordinates from the current segment, adding an offset.
        var x_coordinate = parseInt(current_line_segment[0]) + 2;
        var y_coordinate = parseInt(current_line_segment[2]) + 2;

        // Apply modifications to the grid_matrix based on a specific character in the segment.
        switch (current_line_segment[4]) {
            case '3': // This case falls through to the next one.
                grid_matrix[y_coordinate + 2][x_coordinate]++;
                grid_matrix[y_coordinate - 2][x_coordinate]++;
                grid_matrix[y_coordinate][x_coordinate - 2]++;
                grid_matrix[y_coordinate][x_coordinate + 2]++;
            case '2': // This case also falls through.
                grid_matrix[y_coordinate + 1][x_coordinate - 1]++;
                grid_matrix[y_coordinate + 1][x_coordinate + 1]++;
                grid_matrix[y_coordinate - 1][x_coordinate - 1]++;
                grid_matrix[y_coordinate - 1][x_coordinate + 1]++;
            case '1': // This is the final case for increments.
                grid_matrix[y_coordinate + 1][x_coordinate]++;
                grid_matrix[y_coordinate][x_coordinate - 1]++;
                grid_matrix[y_coordinate][x_coordinate]++;
                grid_matrix[y_coordinate][x_coordinate + 1]++;
                grid_matrix[y_coordinate - 1][x_coordinate]++;
                break; // Exit switch after case '1' operations.
        }
    }

    // Initialize counters for analysis.
    var empty_cells_count = 0; // Counts cells with zero impact.
    var max_impact_value = 0; // Stores the highest impact recorded.

    // Iterate through a specific 10x10 sub-section of the grid_matrix.
    var row_index_iterator = 10;
    for (; row_index_iterator--;) {
        var col_index_iterator = 10;
        for (; col_index_iterator--;) {
            // Check if the cell at the adjusted coordinates has zero impact.
            empty_cells_count += !(grid_matrix[row_index_iterator + 2][col_index_iterator + 2]);
            // Update the maximum impact value found so far.
            max_impact_value = find_maximum(grid_matrix[row_index_iterator + 2][col_index_iterator + 2], max_impact_value);
        }
    }

    // Output the calculated results to the console.
    console.log(empty_cells_count);
    console.log(max_impact_value);
}

// Custom function to determine the maximum of two numbers using bitwise operations.
function find_maximum(val_a, val_b) {
    var temp_difference = (val_a - val_b);
    // This trick uses the sign bit of the difference to avoid branching (if/else).
    // If val_a > val_b, temp_difference is positive, (temp_difference >> 31) is 0.
    // If val_a <= val_b, temp_difference is negative, (temp_difference >> 31) is -1.
    return val_a - (temp_difference & (temp_difference >> 31));
}

// Global variable to accumulate incoming data.
var raw_input_stream = '';

// Set up event listeners for standard input.
process.stdin.resume(); // Ensure the stdin stream stays open.
process.stdin.setEncoding('utf8'); // Specify character encoding.

// Event listener for incoming data chunks.
process.stdin.on('data', function (data_segment) {
    raw_input_stream += data_segment;
});

// Event listener for the end of the input stream.
process.stdin.on('end', function () {
    // Split the accumulated input into lines.
    raw_input_stream = raw_input_stream.split('\n');
    // Commence the main processing logic.
    execute_process();
});