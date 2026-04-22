const BOARD_DIMENSION = 8;
const PLAYER_ONE_VALUE = 1;
const PLAYER_TWO_VALUE = -1;
const EMPTY_CELL_VALUE = 0;

const PLAYER_ONE_SYMBOL = 'o';
const PLAYER_TWO_SYMBOL = 'x';
const EMPTY_CELL_SYMBOL = '.';

// Delta values for traversing 8 directions (row, column)
// Original order: (1,1), (1,0), (1,-1), (0,1), (0,-1), (-1,1), (-1,0), (-1,-1)
const ROW_DELTAS = [1, 1, 1, 0, 0, -1, -1, -1];
const COL_DELTAS = [1, 0, -1, 1, -1, 1, 0, -1];

/**
 * Checks if a given row and column coordinate is within the valid board boundaries (1-indexed).
 * @param {number} r - The row index.
 * @param {number} c - The column index.
 * @returns {boolean} True if the coordinates are valid, false otherwise.
 */
function isValidBoardCoordinate(r, c) {
    return r >= 1 && r <= BOARD_DIMENSION && c >= 1 && c <= BOARD_DIMENSION;
}

/**
 * Calculates the total number of opponent pieces that would be flipped if the active player
 * places a piece at the specified target coordinates.
 *
 * @param {Array<Array<number>>} board_matrix - The current state of the game board.
 * @param {number} active_player_id - The ID of the current player (1 or -1).
 * @param {number} target_row - The 1-indexed row where the piece is to be placed.
 * @param {number} target_col - The 1-indexed column where the piece is to be placed.
 * @returns {number} The total count of opponent pieces that would be captured.
 */
function evaluateMoveOpportunity(board_matrix, active_player_id, target_row, target_col) {
    let total_captured_discs = 0;
    const opponent_player_id = active_player_id * -1; // Pre-calculate opponent's ID

    // Guard clause: a piece can only be placed on an empty cell.
    if (board_matrix[target_row][target_col] !== EMPTY_CELL_VALUE) {
        return 0;
    }

    // Iterate through all 8 possible directions
    for (let direction_idx = 0; direction_idx < 8; direction_idx++) {
        let discs_in_line = 0; // Counter for consecutive opponent pieces in the current line
        let current_row = target_row + ROW_DELTAS[direction_idx];
        let current_col = target_col + COL_DELTAS[direction_idx];

        // Traverse in the current direction as long as we are within board bounds
        while (isValidBoardCoordinate(current_row, current_col)) {
            const cell_value = board_matrix[current_row][current_col];

            if (cell_value === opponent_player_id) {
                // Found an opponent's piece, increment counter
                discs_in_line++;
            } else if (cell_value === active_player_id) {
                // Found player's own piece, indicating a valid capture line
                total_captured_discs += discs_in_line;
                break; // Exit inner while loop, move to next direction
            } else { // cell_value === EMPTY_CELL_VALUE or unexpected
                // Found an empty cell or an invalid piece, no capture possible in this direction
                break; // Exit inner while loop
            }
            // Move to the next cell in the current direction
            current_row += ROW_DELTAS[direction_idx];
            current_col += COL_DELTAS[direction_idx];
        }
    }
    return total_captured_discs;
}

/**
 * Executes a player's move by placing a piece and flipping all captured opponent pieces.
 *
 * @param {Array<Array<number>>} board_matrix - The current state of the game board.
 * @param {number} active_player_id - The ID of the current player (1 or -1).
 * @param {number} target_row - The 1-indexed row where the piece is to be placed.
 * @param {number} target_col - The 1-indexed column where the piece is to be placed.
 */
function applyPlayerAction(board_matrix, active_player_id, target_row, target_col) {
    // Place the current player's piece at the chosen location.
    // This assumes the cell is empty, as validated by evaluateMoveOpportunity.
    board_matrix[target_row][target_col] = active_player_id;

    const opponent_player_id = active_player_id * -1;

    // Iterate through all 8 directions to identify and flip pieces
    for (let direction_idx = 0; direction_idx < 8; direction_idx++) {
        const discs_to_flip_coords = []; // Store coordinates of opponent pieces to be flipped
        let current_row = target_row + ROW_DELTAS[direction_idx];
        let current_col = target_col + COL_DELTAS[direction_idx];
        let line_terminates_with_player_piece = false; // Flag to confirm a valid capture line

        // Traverse in the current direction, collecting opponent pieces
        while (isValidBoardCoordinate(current_row, current_col)) {
            const cell_value = board_matrix[current_row][current_col];

            if (cell_value === opponent_player_id) {
                discs_to_flip_coords.push({ r: current_row, c: current_col });
            } else if (cell_value === active_player_id) {
                line_terminates_with_player_piece = true; // Found player's own piece, line is valid
                break;
            } else { // Empty cell or unexpected value
                break; // No capture possible in this direction
            }
            current_row += ROW_DELTAS[direction_idx];
            current_col += COL_DELTAS[direction_idx];
        }

        // If a valid capture line was found and there are pieces to flip, perform the flips
        if (line_terminates_with_player_piece && discs_to_flip_coords.length > 0) {
            for (const coord of discs_to_flip_coords) {
                board_matrix[coord.r][coord.c] = active_player_id;
            }
        }
    }
}

/**
 * Main function to run the Othello game simulation based on provided input.
 * @param {string} raw_input_data - The raw input string containing the initial board state.
 */
function processOthelloGame(raw_input_data) {
    const input_lines = raw_input_data.split("\n");
    // Initialize a 1-indexed board (size BOARD_DIMENSION+1)
    let game_board_state = Array(BOARD_DIMENSION + 1).fill(null).map(() => Array(BOARD_DIMENSION + 1).fill(EMPTY_CELL_VALUE));

    let current_occupied_cells_count = 0; // Tracks the number of pieces on the board

    // Parse the initial board configuration from input
    for (let r_parse = 1; r_parse <= BOARD_DIMENSION; r_parse++) {
        const line_content = input_lines[r_parse - 1]; // Input lines are 0-indexed
        for (let c_parse = 1; c_parse <= BOARD_DIMENSION; c_parse++) {
            const char_at_pos = line_content[c_parse - 1];
            if (char_at_pos === PLAYER_ONE_SYMBOL) {
                game_board_state[r_parse][c_parse] = PLAYER_ONE_VALUE;
                current_occupied_cells_count++;
            } else if (char_at_pos === PLAYER_TWO_SYMBOL) {
                game_board_state[r_parse][c_parse] = PLAYER_TWO_VALUE;
                current_occupied_cells_count++;
            } else {
                game_board_state[r_parse][c_parse] = EMPTY_CELL_VALUE;
            }
        }
    }

    let active_player = PLAYER_ONE_VALUE;
    let passed_last_turn = false; // Flag to detect consecutive passes, which ends the game

    // Main game loop: continues until the board is full or both players pass
    while (current_occupied_cells_count < BOARD_DIMENSION * BOARD_DIMENSION) {
        let max_flips_for_turn = 0;
        let best_move_row_candidate = -1;
        let best_move_col_candidate = -1;
        let found_any_valid_move = false; // Flag to indicate if the current player has any valid moves

        // Iterate through all empty cells to find the best possible move
        for (let r_iter = 1; r_iter <= BOARD_DIMENSION; r_iter++) {
            for (let c_iter = 1; c_iter <= BOARD_DIMENSION; c_iter++) {
                if (game_board_state[r_iter][c_iter] === EMPTY_CELL_VALUE) {
                    const current_cell_flips = evaluateMoveOpportunity(game_board_state, active_player, r_iter, c_iter);

                    if (current_cell_flips > 0) { // Only consider moves that result in flips
                        found_any_valid_move = true; // A valid move exists for the current player

                        // Apply original tie-breaking logic: Player 1 (o) uses strictly greater, Player 2 (x) uses greater or equal.
                        if (active_player === PLAYER_ONE_VALUE) {
                            if (current_cell_flips > max_flips_for_turn) {
                                max_flips_for_turn = current_cell_flips;
                                best_move_row_candidate = r_iter;
                                best_move_col_candidate = c_iter;
                            }
                        } else { // active_player === PLAYER_TWO_VALUE
                            if (current_cell_flips >= max_flips_for_turn) {
                                max_flips_for_turn = current_cell_flips;
                                best_move_row_candidate = r_iter;
                                best_move_col_candidate = c_iter;
                            }
                        }
                    }
                }
            }
        }

        if (found_any_valid_move && max_flips_for_turn > 0) {
            // A valid move was found and chosen
            passed_last_turn = false; // Reset the pass flag
            current_occupied_cells_count++; // Increment count for the newly placed piece
            applyPlayerAction(game_board_state, active_player, best_move_row_candidate, best_move_col_candidate);
        } else {
            // No valid moves for the current player
            if (passed_last_turn) {
                // Both players passed consecutively, game over
                break;
            }
            passed_last_turn = true; // Current player passes, set flag
        }
        active_player *= (-1); // Switch to the other player
    }

    // Output the final board state
    for (let r_output = 1; r_output <= BOARD_DIMENSION; r_output++) {
        let row_output_string = "";
        for (let c_output = 1; c_output <= BOARD_DIMENSION; c_output++) {
            const cell_value = game_board_state[r_output][c_output];
            if (cell_value === PLAYER_ONE_VALUE) {
                row_output_string += PLAYER_ONE_SYMBOL;
            } else if (cell_value === PLAYER_TWO_VALUE) {
                row_output_string += PLAYER_TWO_SYMBOL;
            } else {
                row_output_string += EMPTY_CELL_SYMBOL;
            }
        }
        console.log(row_output_string);
    }
}

// Execute the game with input from standard input
processOthelloGame(require("fs").readFileSync("/dev/stdin", "utf8"));