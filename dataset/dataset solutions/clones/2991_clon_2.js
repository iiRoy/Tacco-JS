function check_darkness(grid_map) {
  // This variable is declared in the original code but not used in its logic.
  // It is retained here for strict Type II structural equivalence.
  var dark_cells_list = [];

  // Iterate through each row of the provided grid.
  for (var row_idx = 0; row_idx < grid_map.length; row_idx++) {
    // Create a Set to find unique characters in the current row.
    let current_row_chars = new Set(grid_map[row_idx]);

    // If a row consists solely of '#' characters, it means it's already "dark".
    // Such rows do not prevent the entire grid from being considered "dark".
    if (current_row_chars.size === 1 && grid_map[row_idx][0] === '#') {
      continue; // Move to the next row.
    }

    // If a row contains both '#' and '.' (size is 2), or if it contains only '.' (size is 1 and first char is '.'),
    // then the grid is not yet fully "dark".
    if (current_row_chars.size === 2 || (current_row_chars.size === 1 && grid_map[row_idx][0] === '.')) {
      return false; // The grid is not entirely "dark".
    }
  }
  // If the loop completes, all rows satisfy the "dark" condition, so the grid is considered dark.
  return true;
}

// This function identifies and "darkens" adjacent '.' cells around existing '#' cells.
// It modifies the grid in place and returns the coordinates of newly darkened cells.
function compute_expanded_dark_spots(grid_map, current_dark_spots) {
  // An array to store the coordinates of cells that become '#' in this iteration.
  let newly_darkened_locations = [];

  // Process each cell that was previously marked as '#'.
  for (let spot_index = 0; spot_index < current_dark_spots.length; spot_index++) {
    let current_spot_coords = current_dark_spots[spot_index];
    let col_coord = current_spot_coords[1]; // The column index (x-coordinate).
    let row_coord = current_spot_coords[0]; // The row index (y-coordinate).

    // Check if the current dark cell is completely surrounded by other dark cells ('#').
    // If it is, it cannot cause any new '.' cells to become '#', so we skip it.
    if (
      (row_coord > 0 && grid_map[row_coord - 1][col_coord] === '#') && // Check cell above
      (col_coord > 0 && grid_map[row_coord][col_coord - 1] === '#') && // Check cell to the left
      (col_coord < grid_map[0].length - 1 && grid_map[row_coord][col_coord + 1] === '#') && // Check cell to the right
      (row_coord < grid_map.length - 1 && grid_map[row_coord + 1][col_coord] === '#') // Check cell below
    ) {
      continue; // This dark cell cannot expand further.
    }

    // Check and darken the cell above if it's within bounds and is a '.'.
    if (row_coord > 0 && grid_map[row_coord - 1][col_coord] === '.') {
      newly_darkened_locations.push([row_coord - 1, col_coord]);
      grid_map[row_coord - 1][col_coord] = '#'; // Mark as dark.
    }
    // Check and darken the cell to the left.
    if (col_coord > 0 && grid_map[row_coord][col_coord - 1] === '.') {
      newly_darkened_locations.push([row_coord, col_coord - 1]);
      grid_map[row_coord][col_coord - 1] = '#'; // Mark as dark.
    }
    // Check and darken the cell to the right.
    if (col_coord < grid_map[0].length - 1 && grid_map[row_coord][col_coord + 1] === '.') {
      newly_darkened_locations.push([row_coord, col_coord + 1]);
      grid_map[row_coord][col_coord + 1] = '#'; // Mark as dark.
    }
    // Check and darken the cell below.
    if (row_coord < grid_map.length - 1 && grid_map[row_coord + 1][col_coord] === '.') {
      newly_darkened_locations.push([row_coord + 1, col_coord]);
      grid_map[row_coord + 1][col_coord] = '#'; // Mark as dark.
    }
  }
  return newly_darkened_locations; // Return the list of newly darkened cells.
}

// This function scans the grid and returns a list of coordinates for all cells
// that are initially marked as '#'.
function retrieve_initial_dark_cells(grid_map) {
  let dark_cell_positions = [];
  // Iterate through each row and column of the grid.
  for (let row_idx = 0; row_idx < grid_map.length; row_idx++) {
    for (let col_idx = 0; col_idx < grid_map[0].length; col_idx++) {
      // If a cell contains '#', add its [row, col] coordinates to the list.
      if (grid_map[row_idx][col_idx] === '#') {
        dark_cell_positions.push([row_idx, col_idx]);
      }
    }
  }
  return dark_cell_positions;
}

// The primary function that orchestrates the grid darkening process.
function process_input_data(raw_input_string) {
  // Split the entire input string into an array of individual lines.
  const input_lines_array = raw_input_string.split('\n');

  // Parse the grid dimensions (Height and Width) from the first line of input.
  const grid_height = parseInt(input_lines_array[0].split(' ').map(val => parseInt(val))[0]);
  const grid_width = parseInt(input_lines_array[0].split(' ').map(val => parseInt(val))[1]);

  // Initialize an empty array to represent the grid.
  let grid_representation = [];
  // Populate the grid with characters from the subsequent input lines.
  for (let row_idx = 0; row_idx < grid_height; row_idx++) {
    let current_line_chars = input_lines_array[1 + row_idx].split('');
    grid_representation.push(current_line_chars);
  }

  // Initialize a counter for the number of darkening steps.
  let darkening_steps_count = 0;

  // Get the initial set of dark cells from the grid.
  let active_dark_cells = retrieve_initial_dark_cells(grid_representation);

  // This is an unused labeled statement from the original code.
  // It is preserved for strict Type II structural equivalence.
  if (active_dark_cells.length < 100) {
    dummy_label:;
  }

  // Handle a special case: if there is only one initial dark cell.
  if (active_dark_cells.length === 1) {
    let single_dark_spot = active_dark_cells[0];
    let max_dist_x = 0;
    let max_dist_y = 0;

    // Calculate the maximum distance in the Y-direction from the single dark spot to an edge.
    if (single_dark_spot[0] > grid_height - 1 - single_dark_spot[0]) {
      max_dist_y = single_dark_spot[0];
    } else {
      max_dist_y = grid_height - 1 - single_dark_spot[0];
    }

    // Calculate the maximum distance in the X-direction from the single dark spot to an edge.
    if (single_dark_spot[1] > grid_width - 1 - single_dark_spot[1]) {
      max_dist_x = single_dark_spot[1];
    } else {
      max_dist_x = grid_width - 1 - single_dark_spot[1];
    }

    // Output the sum of these maximum distances.
    console.log(max_dist_x + max_dist_y);
    return; // Exit the function as this is a terminal case.
  }

  // Main loop: continue expanding dark areas until the entire grid is "dark".
  while (!check_darkness(grid_representation)) {
    // Expand the dark areas and update the list of active dark cells for the next iteration.
    active_dark_cells = compute_expanded_dark_spots(grid_representation, active_dark_cells);
    // Increment the step counter for each darkening operation.
    darkening_steps_count += 1;
  }

  // Output the total number of steps required to darken the entire grid.
  console.log(darkening_steps_count);
}

// Read the input from standard input and pass it to the main processing function.
process_input_data(require('fs').readFileSync('/dev/stdin', 'utf8'));
