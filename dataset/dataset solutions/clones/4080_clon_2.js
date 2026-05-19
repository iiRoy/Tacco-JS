function calculateGridColor(char_val, size_param, row_idx, col_idx) {
  // This function determines the color based on grid coordinates and a base character.
  // It checks if the given coordinates fall into specific regions defined by 'size_param'.
  if (0 <= row_idx && row_idx < size_param && 0 <= col_idx && col_idx < size_param) {
    // Region 1: Top-left square of size_param x size_param
    return char_val;
  } else if (size_param <= row_idx && row_idx < 2 * size_param && size_param <= col_idx && col_idx < 2 * size_param) {
    // Region 2: Middle-right square of size_param x size_param
    return char_val;
  } else if (2 * size_param <= row_idx && row_idx < 3 * size_param && 0 <= col_idx && col_idx < size_param) {
    // Region 3: Bottom-left square of size_param x size_param
    return char_val;
  }
  // If coordinates are outside these specific regions, the color is inverted.
  return char_val === "B" ? "W" : "B";
}

function ProcessInputData(input_data) {
  // The first line of input contains two space-separated integers: N and k.
  var first_line_parts = input_data[0].split(" ");
  var num_points = parseInt(first_line_parts[0], 10); // N: number of data points
  var grid_size = parseInt(first_line_parts[1], 10); // k: grid dimension parameter

  // An array to store the normalized and adjusted coordinates and colors.
  var processed_coords = [];

  // Iterate through each data point from the input.
  for (var point_idx = 1; point_idx <= num_points; point_idx++) {
    var current_point_str = input_data[point_idx].split(" ");
    var original_x = parseInt(current_point_str[0], 10); // Original X coordinate
    var original_y = parseInt(current_point_str[1], 10); // Original Y coordinate
    var original_char = current_point_str[2]; // Original color character ('B' or 'W')

    // Normalize coordinates to be within the primary grid cell (0 to k-1).
    var adjusted_x = original_x % grid_size;
    var adjusted_y = original_y % grid_size;

    // Determine if the color needs to be inverted based on the larger grid pattern.
    // This pattern is derived from the integer divisions of x and y by grid_size.
    var color_pattern = (
      ((original_x - adjusted_x) / grid_size) % 2 +
      ((original_y - adjusted_y) / grid_size) % 2
    ) % 2 === 1 ? "R" : "N"; // "R" for reversed, "N" for normal

    var adjusted_char = original_char;

    // Apply the color inversion if the pattern indicates it.
    if (color_pattern === "R") {
      adjusted_char = adjusted_char === "B" ? "W" : "B";
    }

    // If the adjusted character is 'W', convert it to 'B' and shift its x-coordinate.
    // This effectively maps all 'W' points to an equivalent 'B' point in an adjacent grid.
    if (adjusted_char === "W") {
      adjusted_char = "B";
      adjusted_x += grid_size;
    }

    // Store the final adjusted coordinates and character.
    processed_coords[point_idx - 1] = [];
    processed_coords[point_idx - 1][0] = adjusted_x;
    processed_coords[point_idx - 1][1] = adjusted_y;
    processed_coords[point_idx - 1][2] = adjusted_char;
  }

  var maximum_matches_found = 0; // Variable to track the highest number of matches.

  // Iterate through all possible 2k x 2k offsets for the grid.
  // This simulates shifting the entire grid pattern.
  for (var offset_row = 0; offset_row < 2 * grid_size; offset_row++) {
    for (var offset_col = 0; offset_col < 2 * grid_size; offset_col++) {

      var black_matches_count = 0; // Counter for points that match the 'B' pattern.

      // For each offset, check how many processed points match the grid's color.
      for (var data_entry_idx = 0; data_entry_idx < num_points; data_entry_idx++) {
        var current_x_coord = processed_coords[data_entry_idx][0];
        var current_y_coord = processed_coords[data_entry_idx][1];

        // Compare the stored character with the character determined by the grid function
        // using the current offset and point coordinates.
        if (processed_coords[data_entry_idx][2] === calculateGridColor("B", grid_size, offset_row + current_x_coord, offset_col + current_y_coord)) {
          black_matches_count++;
        }
      }

      // Update the maximum matches found if the current count is higher.
      if (maximum_matches_found < black_matches_count) {
        maximum_matches_found = black_matches_count;
      }

      // Optimization: If all points match, we can stop early.
      if (maximum_matches_found === num_points) {
        break;
      }
    }
    // Optimization: If all points match, we can stop early.
    if (maximum_matches_found === num_points) {
      break;
    }
  }

  // Output the final result, which is the maximum number of matching points found.
  console.log('%s', maximum_matches_found);
}

// Read input from standard input, decode as UTF-8, split by newlines, and pass to the main function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));
