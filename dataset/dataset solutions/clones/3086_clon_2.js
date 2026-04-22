let board_size_limit = 0;

/**
 * Adjusts the position of items within an array based on a given direction.
 * Items at the initial_pos are moved to a new position determined by movement_delta.
 * If the new position is out of bounds, the items are considered removed.
 * @param {Array<number>} item_quantities_array - The array representing item counts at various positions.
 * @param {number} initial_pos - The current index of the items to be moved.
 * @param {number} movement_delta - The amount and direction to move (e.g., 1 for right, -1 for left).
 */
function AdjustItemPosition(item_quantities_array, initial_pos, movement_delta) {
  // Determine the final destination index for the items.
  let final_destination = initial_pos + movement_delta;
  // Store the quantity of items currently at the initial position.
  let quantity_to_move = item_quantities_array[initial_pos];
  // Set the item count at the initial position to zero, as they are being moved.
  item_quantities_array[initial_pos] = 0;

  // Check if the calculated final destination is within the acceptable board limits.
  if (final_destination < 0 || final_destination >= board_size_limit) {
    return; // If out of bounds, items are removed and no further action is needed.
  }
  // If within bounds, add the quantity of moved items to the new position.
  item_quantities_array[final_destination] += quantity_to_move;
}

/*
 * This is the primary function that orchestrates the processing of input data
 * to simulate movements of various characters (items) on a virtual board.
 * It reads initial configurations and a series of movement instructions.
 * @param {string} rawData - The entire input string, typically sourced from standard input.
 */
function ProcessInputData(rawData) {
  // Split the raw input string into an array of individual lines.
  const line_segments = rawData.split('\n');

  // The first line contains parameters; parse its first component to set the board size limit.
  const first_line_parts = line_segments[0].split(' ');
  board_size_limit = parseInt(first_line_parts[0], 10); // Update the globally accessible board size.

  // An object to map each unique character to a list of its current positions on the board.
  const char_position_map = {};
  // An array representing the board, where each index holds the count of items at that position.
  let item_counts = [];

  // Iterate through the second line of input to initialize the board and character positions.
  // Each character in this line signifies an item at its corresponding index.
  for (let current_char_idx = 0; current_char_idx < line_segments[1].length; current_char_idx++) {
    let current_char_val = line_segments[1][current_char_idx];
    item_counts[current_char_idx] = 1; // Initially, each position occupied by a character holds one item.

    // If this character has not yet been registered in the position map, create an empty array for it.
    if (!char_position_map[current_char_val]) {
      char_position_map[current_char_val] = [];
    }
    // Add the current index to the list of positions for this specific character.
    char_position_map[current_char_val].push(current_char_idx);
  }

  // Loop through all subsequent lines, starting from the third line, which contain movement instructions.
  for (let instruction_line_idx = 2; instruction_line_idx < line_segments.length; instruction_line_idx++) {
    // Break down the current instruction line into its constituent parts.
    const instruction_parts = line_segments[instruction_line_idx].split(' ');
    let target_char = instruction_parts[0]; // The character type whose items are to be moved.
    let char_indices_list = char_position_map[target_char]; // Retrieve all current positions for this character.

    // If no items of the target character type are found on the board, skip this instruction.
    if (!char_indices_list) {
      continue;
    }

    let move_direction_char = instruction_parts[1]; // The specified direction for movement ('R' for right, 'L' for left).

    // Execute movements based on the direction.
    if (move_direction_char === "R") {
      // For moving right, it's crucial to process positions from right to left (highest index to lowest)
      // to prevent an item from being moved into a slot that has already been processed and cleared in the same iteration.
      for (let reverse_loop_idx = (char_indices_list.length - 1); reverse_loop_idx >= 0; reverse_loop_idx--) {
        AdjustItemPosition(item_counts, char_indices_list[reverse_loop_idx], 1); // Move one step to the right.
      }
    } else {
      // For moving left, processing positions from left to right (lowest index to highest) is appropriate.
      for (let forward_loop_idx = 0; forward_loop_idx < char_indices_list.length; forward_loop_idx++) {
        AdjustItemPosition(item_counts, char_indices_list[forward_loop_idx], -1); // Move one step to the left.
      }
    }
  }

  // After all movements are processed, calculate the total count of items remaining on the board.
  let total_items_count = 0;
  item_counts.forEach(item_quantity => total_items_count += item_quantity);

  // Output the final calculated total item count to the console.
  console.info(total_items_count);
}

// This is the entry point of the program: read input from standard input and pass it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));