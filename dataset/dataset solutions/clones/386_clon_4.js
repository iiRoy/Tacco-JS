const source_content = require('fs').readFileSync('/dev/stdin', 'utf8');
const numeric_data = source_content.trim().split("\n").map(Number);

let test_counter = numeric_data.shift();

while (test_counter--) {
    const dimension_size = numeric_data.shift();

    if (dimension_size === 0) {
        console.log("");
        continue;
    }
    if (dimension_size === 1) {
        console.log("#");
        continue;
    }
    if (dimension_size === 2) {
        const two_by_two_pattern = "##\n# ";
        console.log(two_by_two_pattern);
        continue;
    }

    const weave_pattern = (extent) => {
        let matrix_data = Array(extent).fill(null).map(() => Array(extent).fill('+'));
        let row_position = extent - 1;
        let col_position = 0;
        let motion_vector_idx = 0; // 0: up, 1: right, 2: down, 3: left

        const row_shifts = [-1, 0, 1, 0];
        const col_shifts = [0, 1, 0, -1];

        // Defines the [row_offset_from_next, col_offset_from_next, new_direction_index]
        // for the "jump" operation when a blocked path is encountered.
        // These offsets are relative to the 'adv_r', 'adv_c' (next cell)
        const jump_directives = [
            [2, 1, 1],  // Current dir 0 (Up) -> Jump to (adv_r+2, adv_c+1), new dir 1 (Right)
            [1, -2, 2], // Current dir 1 (Right) -> Jump to (adv_r+1, adv_c-2), new dir 2 (Down)
            [-2, -1, 3], // Current dir 2 (Down) -> Jump to (adv_r-2, adv_c-1), new dir 3 (Left)
            [-1, 2, 0]  // Current dir 3 (Left) -> Jump to (adv_r-1, adv_c+2), new dir 0 (Up)
        ];

        let terminal_coords = []; // Stores the last cell marked with '#'

        // Explicit stack to manage the path generation iteratively
        let path_segments = [[row_position, col_position, motion_vector_idx]];

        while (path_segments.length > 0) {
            let [curr_r, curr_c, curr_d] = path_segments.pop();

            // Check if current coordinates are valid and the cell is unvisited ('+')
            // This handles out-of-bounds initial calls and already visited cells.
            if (curr_r < 0 || curr_c < 0 || curr_r >= extent || curr_c >= extent || matrix_data[curr_r][curr_c] !== '+') {
                continue;
            }

            const adv_r = curr_r + row_shifts[curr_d];
            const adv_c = curr_c + col_shifts[curr_d];

            if (adv_r < 0 || adv_c < 0 || adv_r >= extent || adv_c >= extent) {
                // Next step is out of bounds, so turn by changing direction
                const rot_d = (curr_d + 1) % 4;
                path_segments.push([curr_r, curr_c, rot_d]); // Re-add current position with new direction
            } else {
                // Next step is within bounds
                if (matrix_data[adv_r][adv_c] === '#') {
                    // The cell ahead is already marked ('#'), indicating a collision
                    // Reset the current cell to '+' (it was implicitly '+' as it was never marked '#' on this path)
                    matrix_data[curr_r][curr_c] = '+';

                    // Execute the complex "jump" operation
                    const [dr_jump, dc_jump, next_jump_dir] = jump_directives[curr_d];
                    const skip_r = adv_r + dr_jump;
                    const skip_c = adv_c + dc_jump;
                    const skip_d = next_jump_dir;
                    path_segments.push([skip_r, skip_c, skip_d]);
                } else {
                    // The cell ahead is unvisited ('+')
                    matrix_data[curr_r][curr_c] = '#'; // Mark the current cell as visited
                    terminal_coords = [curr_r, curr_c]; // Update the last known visited cell
                    path_segments.push([adv_r, adv_c, curr_d]); // Continue moving in the same direction
                }
            }
        }

        // Final modification based on grid dimension parity
        if (extent % 2 === 0) {
            if (terminal_coords.length > 0) {
                matrix_data[terminal_coords[0]][terminal_coords[1]] = '+';
            }
        }

        // Format the output string
        return matrix_data.map(row => row.join('')).join('\n').replace(/\+/g, ' ');
    };

    console.log(weave_pattern(dimension_size));
}