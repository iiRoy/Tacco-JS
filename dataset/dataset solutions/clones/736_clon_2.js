var x_dir_vec = [-1, 0, 1, -1]; // Initial X-axis displacement values
var y_dir_vec = [-1, -1, -1, 0]; // Initial Y-axis displacement values
var z_dir_vec = [0, 0, 0, 0];   // Initial Z-axis displacement values

// Concatenate additional displacement values to expand the direction vectors
y_dir_vec = y_dir_vec.concat([-1, 0, 1, -1]);
z_dir_vec = z_dir_vec.concat([-1, -1, -1, 0]);
x_dir_vec = x_dir_vec.concat([0, 0, 0, 0]);

z_dir_vec = z_dir_vec.concat([-1, 0, 1, -1]);
x_dir_vec = x_dir_vec.concat([-1, -1, -1, 0]);
y_dir_vec = y_dir_vec.concat([0, 0, 0, 0]);

x_dir_vec = x_dir_vec.concat([1, -1, 1, -1]);
y_dir_vec = y_dir_vec.concat([-1, -1, -1, -1]);
z_dir_vec = z_dir_vec.concat([-1, -1, 1, 1]);

/**
 * Checks for the longest continuous line of the current player's tokens
 * starting from a given position in all defined directions.
 * @param {number} current_player_token The identifier of the current player (e.g., 1 or 2).
 * @param {number} start_x_coord The X coordinate to start the line check from.
 * @param {number} start_y_coord The Y coordinate to start the line check from.
 * @param {number} start_z_coord The Z coordinate to start the line check from.
 * @returns {number} The maximum length of a continuous line found for the current player.
 */
function check_winning_line(current_player_token, start_x_coord, start_y_coord, start_z_coord) {
    let maximum_length = 0; // Stores the longest streak found so far.

    // Iterate through all possible 3D directions.
    for (let direction_idx = 0; direction_idx < x_dir_vec.length; direction_idx++) {
        let current_x_pos = start_x_coord;
        let current_y_pos = start_y_coord;
        let current_z_pos = start_z_coord;

        // Traverse backward along the current direction until out of bounds or an empty spot.
        while (true) {
            current_x_pos -= x_dir_vec[direction_idx];
            current_y_pos -= y_dir_vec[direction_idx];
            current_z_pos -= z_dir_vec[direction_idx];

            // Break if current position is outside the grid boundaries.
            if (current_x_pos < 0 || current_y_pos < 0 || current_z_pos < 0) break;
            if (current_x_pos >= grid_dim_x || current_y_pos >= grid_dim_x || current_z_pos >= total_moves) break;
        }

        let consecutive_count = 0; // Counts tokens in the current continuous line.

        // Traverse forward along the current direction, counting player tokens.
        while (true) {
            current_x_pos += x_dir_vec[direction_idx];
            current_y_pos += y_dir_vec[direction_idx];
            current_z_pos += z_dir_vec[direction_idx];

            // Break if current position is outside the grid boundaries.
            if (current_x_pos < 0 || current_y_pos < 0 || current_z_pos < 0) break;
            if (current_x_pos >= grid_dim_x || current_y_pos >= grid_dim_x || current_z_pos >= total_moves) break;

            // If the token matches the current player, increment count; otherwise, reset.
            if (game_board_matrix[current_x_pos][current_y_pos][current_z_pos] === current_player_token) {
                consecutive_count++;
            } else {
                consecutive_count = 0;
            }
            // Update the maximum length found.
            maximum_length = Math.max(maximum_length, consecutive_count);
        }
    }
    return maximum_length; // Return the longest streak.
}

// Read all input data from standard input.
const raw_input_content = require('fs').readFileSync('/dev/stdin', 'utf8');
// Split the input into an array of lines and remove leading/trailing whitespace.
let input_lines_array = raw_input_content.trim().split("\n");

// Main game loop: processes multiple game scenarios until a termination condition.
while (true) {
    // Extract the first line which contains game dimensions and required match length.
    let game_dimensions_line = input_lines_array.shift();
    // Check for termination condition "0 0 0".
    if (game_dimensions_line === "0 0 0") break;

    // Parse the game dimensions line into numbers.
    let parsed_dimensions = game_dimensions_line.split(" ").map(Number);
    let grid_dim_x = parsed_dimensions[0]; // N: Grid dimension (N x N base).
    let match_length_required = parsed_dimensions[1]; // M: Length of line needed to win.
    let total_moves = parsed_dimensions[2]; // P: Total number of moves in the game.

    // Initialize the 3D game board (N x N x P) with zeros (empty slots).
    let game_board_matrix = [];
    for (let row_index = 0; row_index < grid_dim_x; row_index++) {
        game_board_matrix[row_index] = [];
        for (let column_index = 0; column_index < grid_dim_x; column_index++) {
            game_board_matrix[row_index][column_index] = [];
            for (let depth_index = 0; depth_index < total_moves; depth_index++) {
                game_board_matrix[row_index][column_index][depth_index] = 0; // 0 indicates an empty slot.
            }
        }
    }

    // Read all P moves from the input and store them.
    let player_moves_list = [];
    for (let move_iterator = 0; move_iterator < total_moves; move_iterator++) {
        player_moves_list.push(input_lines_array.shift().split(" ").map(Number));
    }

    let current_player_identifier = 1; // Player 1 starts (e.g., Black).
    let game_is_draw = true; // Assume a draw until a winner is found.

    // Process each move in the game.
    for (let move_iterator = 0; move_iterator < total_moves; move_iterator++) {
        let current_move_coordinates = player_moves_list[move_iterator];
        let move_x_coord = current_move_coordinates[0] - 1; // Convert to 0-indexed.
        let move_y_coord = current_move_coordinates[1] - 1; // Convert to 0-indexed.

        let drop_layer_index = 0; // Determines the Z-coordinate (layer) where the token will drop.
        // Find the lowest available layer in the specified (x,y) column.
        while (true) {
            if (game_board_matrix[move_x_coord][move_y_coord][drop_layer_index] !== 0) {
                drop_layer_index++; // Move to the next layer if current is occupied.
            } else {
                break; // Found an empty layer.
            }
        }
        // Place the current player's token on the board.
        game_board_matrix[move_x_coord][move_y_coord][drop_layer_index] = current_player_identifier;

        // Check if the current move results in a win.
        if (check_winning_line(current_player_identifier, move_x_coord, move_y_coord, drop_layer_index) >= match_length_required) {
            // Output winner and move number.
            console.log((current_player_identifier === 2) ? "White" : "Black", move_iterator + 1);
            game_is_draw = false; // A winner has been found.
            break; // End the game loop for this scenario.
        }

        // Switch players for the next turn: 1 -> 2, 2 -> 1.
        current_player_identifier = 2 / current_player_identifier;
    }

    // If no winner was found after all moves, it's a draw.
    if (game_is_draw) {
        console.log("Draw");
    }
}