/* This function evaluates the longest sequence of identical player markers
   in all 26 possible 3D directions starting from a given coordinate. */
function calculate_line_score( active_player_id, start_coord_x, start_coord_y, start_coord_z ) {
    // Define the 26 possible directional vectors in 3D space.
    // These vectors are constructed by concatenating arrays.
    let offset_x_values = [ -1, 0, 1, -1 ];
    let offset_y_values = [ -1, -1, -1, 0 ];
    let offset_z_values = [ 0, 0, 0, 0 ];

    offset_y_values = offset_y_values.concat( [ -1, 0, 1, -1 ] );
    offset_z_values = offset_z_values.concat( [ -1, -1, -1, 0 ] );
    offset_x_values = offset_x_values.concat( [ 0, 0, 0, 0 ] );
    offset_z_values = offset_z_values.concat( [ -1, 0, 1, -1 ] );
    offset_x_values = offset_x_values.concat( [ -1, -1, -1, 0 ] );
    offset_y_values = offset_y_values.concat( [ 0, 0, 0, 0 ] );
    offset_x_values = offset_x_values.concat( [ 1, -1, 1, -1 ] );
    offset_y_values = offset_y_values.concat( [ -1, -1, -1, -1 ] );
    offset_z_values = offset_z_values.concat( [ -1, -1, 1, 1 ] );

    let highest_sequence_count = 0; // Tracks the maximum consecutive markers found.

    // Iterate through each of the 26 directions.
    for ( let direction_vector_index = 0; direction_vector_index < offset_x_values.length; direction_vector_index++ ) {

        let current_point_x = start_coord_x; // Initialize X coordinate for this direction.
        let current_point_y = start_coord_y; // Initialize Y coordinate for this direction.
        let current_point_z = start_coord_z; // Initialize Z coordinate for this direction.

        // First loop: Move backwards from the starting point until out of bounds.
        while ( true ) {
            current_point_x -= offset_x_values[ direction_vector_index ];
            current_point_y -= offset_y_values[ direction_vector_index ];
            current_point_z -= offset_z_values[ direction_vector_index ];

            // If coordinates go out of grid boundaries, stop.
            if ( current_point_x < 0 || current_point_y < 0 || current_point_z < 0 ) {
                break;
            }
            if ( current_point_x >= grid_dimension_n || current_point_y >= grid_dimension_n || current_point_z >= grid_dimension_p ) {
                break;
            }
        }

        let current_run_length = 0; // Counter for the current consecutive markers in this direction.

        // Second loop: Move forwards from the (now adjusted) starting point, counting markers.
        while ( true ) {
            current_point_x += offset_x_values[ direction_vector_index ];
            current_point_y += offset_y_values[ direction_vector_index ];
            current_point_z += offset_z_values[ direction_vector_index ];

            // If coordinates go out of grid boundaries, stop.
            if ( current_point_x < 0 || current_point_y < 0 || current_point_z < 0 ) {
                break;
            }
            if ( current_point_x >= grid_dimension_n || current_point_y >= grid_dimension_n || current_point_z >= grid_dimension_p ) {
                break;
            }

            // Check if the current cell contains the active player's marker.
            if ( game_board_state[ current_point_x ][ current_point_y ][ current_point_z ] == active_player_id ) {
                current_run_length++; // Increment if it matches.
            } else {
                current_run_length = 0; // Reset if it doesn't match.
            }

            // Update the overall maximum sequence found.
            highest_sequence_count = Math.max( highest_sequence_count, current_run_length );
        }
    }
    return highest_sequence_count; // Return the maximum streak.
}

// Import the Node.js file system module.
const file_system_module = require( 'fs' );

// Read all input from standard input, decode as UTF-8.
const raw_file_content = file_system_module.readFileSync( '/dev/stdin', 'utf8' );

// Process the input: trim whitespace and split into individual lines.
let input_line_segments = raw_file_content.trim().split( "\n" );

// Global variables for grid dimensions and game board state.
let grid_dimension_n;
let winning_line_length;
let grid_dimension_p;
let game_board_state;

// Main game loop: processes multiple game scenarios.
while ( true ) {
    // Get the first line of dimensions for the current game.
    let grid_config_str = input_line_segments.shift();

    // If the line is "0 0 0", it signifies the end of input.
    if ( grid_config_str === "0 0 0" ) {
        break;
    }

    // Parse the dimension string into numerical values.
    const dimensions_parsed = grid_config_str.split( " " ).map( Number );
    grid_dimension_n = dimensions_parsed[ 0 ]; // N x N grid base.
    winning_line_length = dimensions_parsed[ 1 ]; // M: required length for a win.
    grid_dimension_p = dimensions_parsed[ 2 ]; // P: max height/depth.

    // Initialize the 3D game board with zeroes (empty cells).
    game_board_state = [];
    for ( let row_index = 0; row_index < grid_dimension_n; row_index++ ) {
        game_board_state[ row_index ] = [];
        for ( let column_index = 0; column_index < grid_dimension_n; column_index++ ) {
            game_board_state[ row_index ][ column_index ] = [];
            for ( let depth_index = 0; depth_index < grid_dimension_p; depth_index++ ) {
                game_board_state[ row_index ][ column_index ][ depth_index ] = 0;
            }
        }
    }

    // Read all player moves for this game.
    const player_moves_list = [];
    for ( let move_index = 0; move_index < grid_dimension_p; move_index++ ) {
        player_moves_list.push( input_line_segments.shift().split( " " ).map( Number ) );
    }

    let current_player_marker = 1; // Player 1 starts (e.g., Black).
    let is_game_drawn = true; // Flag to track if the game ends in a draw.

    // Process each player's move.
    for ( let move_index = 0; move_index < grid_dimension_p; move_index++ ) {
        const single_move_coords = player_moves_list[ move_index ];
        // Adjust coordinates to be 0-indexed.
        const placed_x_coord = single_move_coords[ 0 ] - 1;
        const placed_y_coord = single_move_coords[ 1 ] - 1;

        let stack_level_indicator = 0; // Determines where the piece lands in the Z dimension.
        // Find the lowest available slot in the current (x, y) column.
        while ( true ) {
            if ( game_board_state[ placed_x_coord ][ placed_y_coord ][ stack_level_indicator ] !== 0 ) {
                stack_level_indicator++;
            } else {
                break;
            }
        }

        // Place the current player's marker on the board.
        game_board_state[ placed_x_coord ][ placed_y_coord ][ stack_level_indicator ] = current_player_marker;

        // Check if placing this piece resulted in a winning line.
        if ( calculate_line_score( current_player_marker, placed_x_coord, placed_y_coord, stack_level_indicator ) >= winning_line_length ) {
            // Announce the winner based on the marker.
            console.log( ( current_player_marker === 2 ) ? "White" : "Black", move_index + 1 );
            is_game_drawn = false; // Game is not a draw.
            break; // End the game loop.
        }

        // Switch player: 1 -> 2, 2 -> 1.
        current_player_marker = 2 / current_player_marker;
    }

    // If the loop finished without a winner, it's a draw.
    if ( is_game_drawn ) {
        console.log( "Draw" );
    }
}