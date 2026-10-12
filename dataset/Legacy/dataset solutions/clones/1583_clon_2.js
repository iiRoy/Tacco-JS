function main_logic(input_data) {
  // Remove any leading or trailing whitespace from the input string.
  input_data = input_data.trim();

  // Split the input string into an array of lines.
  let text_rows = input_data.split("\n");

  // Initialize an array to hold parsed segments from the input lines.
  let parsed_segments = [];
  // Initialize a 2D array to represent the game terrain.
  let terrain_grid = [];

  // Populate the parsed_segments array by splitting each line by space.
  for (let idx = 0; idx < text_rows.length; idx++) {
    parsed_segments[idx] = text_rows[idx].split(" ");
  }

  // Populate the terrain_grid array from the input lines, skipping the first three.
  for (let row_idx = 0; row_idx < text_rows.length - 3; row_idx++) {
    terrain_grid[row_idx] = text_rows[row_idx + 3].split("");
  }

  // Parse grid dimensions and start/goal coordinates.
  let grid_height = Number.parseInt(parsed_segments[0][0]);
  let grid_width = Number.parseInt(parsed_segments[0][1]);

  // Adjust coordinates to be 0-indexed.
  let current_y_pos = Number.parseInt(parsed_segments[1][0]) - 1; // Current Y position
  let current_x_pos = Number.parseInt(parsed_segments[1][1]) - 1; // Current X position

  let target_y_pos = Number.parseInt(parsed_segments[2][0]) - 1; // Goal Y position
  let target_x_pos = Number.parseInt(parsed_segments[2][1]) - 1; // Goal X position

  // Counter for "warp" or teleport actions.
  let teleport_count = 0;

  // Function to visualize the current state of the grid.
  function display_current_grid_state() {
    let grid_representation = "";
    // Create a deep copy of the terrain grid to mark current and goal positions.
    let copied_grid = JSON.parse(JSON.stringify(terrain_grid));

    // Mark the current position with '@' and the goal with 'G'.
    copied_grid[current_y_pos][current_x_pos] = "@";
    copied_grid[target_y_pos][target_x_pos] = "G";

    // Build the string representation of the grid.
    for (let row_index = 0; row_index < copied_grid.length; row_index++) {
      for (let col_index = 0; col_index < copied_grid[row_index].length; col_index++) {
        grid_representation += copied_grid[row_index][col_index];
      }
      grid_representation += "\n"; // Add a newline after each row.
    }
    // console.log(grid_representation); // Uncomment to see step-by-step grid updates.
  } // End of display_current_grid_state function.

  // Function to perform a single movement step.
  function perform_movement_step() {
    // Prioritize moving right if the goal is to the right and the path is clear.
    if (target_x_pos > current_x_pos && terrain_grid[current_y_pos][current_x_pos + 1] === ".") {
      current_x_pos++;
    }
    // Otherwise, prioritize moving down if the goal is below and the path is clear.
    else if (target_y_pos > current_y_pos && terrain_grid[current_y_pos + 1][current_x_pos] === ".") {
      current_y_pos++;
    }
    // If direct movement is blocked or not preferred, check for a "warp" condition.
    else if (Math.abs(target_y_pos - current_y_pos) <= 2 && Math.abs(target_x_pos - current_x_pos) <= 2) {
      // If within a 2x2 Manhattan distance, teleport directly to the goal.
      current_y_pos = target_y_pos;
      current_x_pos = target_x_pos;
      teleport_count++; // Increment the warp counter.
    }
    // After any movement, display the updated grid state.
    display_current_grid_state();
  } // End of perform_movement_step function.

  // Main simulation loop.
  // The loop continues as long as 'reached_destination' is 0 (false).
  for (let reached_destination = 0; reached_destination === 0;) {
    // Check if the current position matches the goal position.
    if (current_y_pos === target_y_pos && current_x_pos === target_x_pos) {
      // If at the goal, print the total number of teleports.
      console.log(teleport_count);
      // Set 'reached_destination' to 1 (true) to exit the loop.
      reached_destination = 1;
    } else {
      // If not at the goal, perform a movement step.
      perform_movement_step();
    }
  } // End of main simulation loop.
}

// Execute the main logic with input read from standard input.
main_logic(require("fs").readFileSync("/dev/stdin", "utf8"));
