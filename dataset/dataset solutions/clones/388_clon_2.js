function detonate(row_idx, col_idx, direction_code) {
    // This recursive function explores a grid path, marking visited cells.
    // It changes direction when hitting boundaries or already visited path segments.

    // If the current cell is not marked as an unvisited path candidate,
    // then this path segment is invalid or already processed.
    if (grid_matrix[row_idx][col_idx] !== "+") {
        return;
    }

    // Define movement offsets for row coordinates: North, East, South, West
    var row_offsets = [-1, 0, 1, 0];

    // Define movement offsets for column coordinates: North, East, South, West
    var col_offsets = [0, 1, 0, -1];

    // Calculate the coordinates for the next potential step in the current direction.
    var next_row = row_idx + row_offsets[direction_code];
    var next_col = col_idx + col_offsets[direction_code];

    // Check if the calculated next position is outside the grid boundaries.
    if (next_row < 0 || next_col < 0 || next_row >= grid_size || next_col >= grid_size) {
        // If out of bounds, rotate the direction clockwise (0 -> 1, 1 -> 2, etc.)
        direction_code = (direction_code + 1) % 4;
        // Re-call the function from the current position with the new direction.
        detonate(row_idx, col_idx, direction_code);
    } else {
        // If the next position is within bounds, check its content.
        if (grid_matrix[next_row][next_col] === "#") {
            // If the next cell is already part of the path ('#'),
            // it means we've hit a previously drawn segment.
            // Mark the cell *before* the current one as unvisited ('+') to backtrack.
            grid_matrix[next_row - row_offsets[direction_code]][next_col - col_offsets[direction_code]] = "+";

            // Based on the current direction, perform a specific recursive call
            // to continue path generation from a new, adjusted starting point.
            if (direction_code === 3) { // West
                detonate(next_row - 2 * row_offsets[direction_code] - 1, next_col - 2 * col_offsets[direction_code], 0);
            } else if (direction_code === 0) { // North
                detonate(next_row - 2 * row_offsets[direction_code], next_col - 2 * col_offsets[direction_code] + 1, 1);
            } else if (direction_code === 1) { // East
                detonate(next_row - 2 * row_offsets[direction_code] + 1, next_col - 2 * col_offsets[direction_code], 2);
            } else if (direction_code === 2) { // South
                detonate(next_row - 2 * row_offsets[direction_code], next_col - 2 * col_offsets[direction_code] - 1, 3);
            }
        } else {
            // If the next cell is not a boundary and not an existing path segment,
            // mark the current cell as part of the path ('#').
            grid_matrix[row_idx][col_idx] = "#";
            // Store the current cell's coordinates as the last visited position.
            final_position = [row_idx, col_idx];
            // Recursively call the function to move to the next cell in the same direction.
            detonate(next_row, next_col, direction_code);
        }
    }
}

// Read input from standard input stream.
var data_stream = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim whitespace, split by newlines, and convert each part to a number.
var numeric_data = data_stream.trim().split("\n").map(Number);

// The first number in the input is the count of test cases.
var test_cases_count = numeric_data.shift();

// Loop through each test case until all are processed.
while (test_cases_count--) {

    // For each test case, the next number is the size of the square grid.
    var grid_size = numeric_data.shift();

    // Handle the special case where the grid size is 1x1.
    if (grid_size === 1) {
        console.log("#"); // A 1x1 grid simply outputs a single '#' character.
        continue; // Skip to the next test case.
    }

    // Initialize a 2D array (matrix) to represent the grid.
    var grid_matrix = [];

    // Populate the grid_matrix with initial values.
    // Each cell starts with a '+' character, indicating it's unvisited.
    for (var outer_idx = 0; outer_idx < grid_size; outer_idx++) {
        grid_matrix[outer_idx] = []; // Initialize each row.
        for (var inner_idx = 0; inner_idx < grid_size; inner_idx++) {
            grid_matrix[outer_idx][inner_idx] = "+"; // Fill cell with placeholder.
        }
    }

    // Initialize an array to keep track of the last modified position by the recursive function.
    var final_position = [];

    // Start the recursive path generation.
    // The path begins at the bottom-left corner (grid_size - 1, 0)
    // and initially moves North (direction_code 0).
    detonate(grid_size - 1, 0, 0);

    // If the grid size is an even number, a specific adjustment is made:
    // the cell at the final_position is reset to '+'.
    if (grid_size % 2 === 0) {
        grid_matrix[final_position[0]][final_position[1]] = "+";
    }

    // Format the final grid for output:
    // 1. Join rows with newline characters.
    // 2. Remove any commas introduced by array joining.
    // 3. Replace all '+' characters with spaces.
    console.log(grid_matrix.join("\n").replace(/,/g, "").replace(/\+/g, " "));
}