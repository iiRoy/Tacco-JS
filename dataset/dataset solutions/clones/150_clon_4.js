((input_text_content) => {

    const parse_input_to_matrix = (text_data) => {
        return text_data.trim().split('\n').map(line_str =>
            Array.from(line_str).map(char_val => parseInt(char_val, 10))
        );
    };

    const is_passage_clear = (map_data, col_idx, row_idx) => {
        if (row_idx < 0 || row_idx >= map_data.length) {
            return false;
        }
        if (col_idx < 0 || col_idx >= map_data[row_idx].length) {
            return false;
        }
        return map_data[row_idx][col_idx] === 1;
    };

    const movement_patterns = {
        'R': [ // Current direction: Right
            { delta_x: 1, delta_y: -1, next_facing: 'U', path_symbol: 'U', requires_open_cell: true },
            { delta_x: 1, delta_y: 0, next_facing: 'R', path_symbol: 'R', requires_open_cell: true },
            { delta_x: 1, delta_y: 1, next_facing: 'D', path_symbol: 'D', requires_open_cell: true },
            { delta_x: 0, delta_y: 0, next_facing: 'L', path_symbol: 'L', requires_open_cell: false }
        ],
        'L': [ // Current direction: Left
            { delta_x: 0, delta_y: 1, next_facing: 'D', path_symbol: 'D', requires_open_cell: true },
            { delta_x: -1, delta_y: 0, next_facing: 'L', path_symbol: 'L', requires_open_cell: true },
            { delta_x: 0, delta_y: -1, next_facing: 'U', path_symbol: 'U', requires_open_cell: true },
            { delta_x: 0, delta_y: 0, next_facing: 'R', path_symbol: 'R', requires_open_cell: false }
        ],
        'D': [ // Current direction: Down
            { delta_x: 0, delta_y: 1, next_facing: 'R', path_symbol: 'R', requires_open_cell: true },
            { delta_x: 0, delta_y: 2, next_facing: 'D', path_symbol: 'D', requires_open_cell: true },
            { delta_x: -1, delta_y: 1, next_facing: 'L', path_symbol: 'L', requires_open_cell: true },
            { delta_x: 0, delta_y: 0, next_facing: 'U', path_symbol: 'U', requires_open_cell: false }
        ],
        'U': [ // Current direction: Up
            { delta_x: -1, delta_y: -1, next_facing: 'L', path_symbol: 'L', requires_open_cell: true },
            { delta_x: 0, delta_y: -2, next_facing: 'U', path_symbol: 'U', requires_open_cell: true },
            { delta_x: 0, delta_y: -1, next_facing: 'R', path_symbol: 'R', requires_open_cell: true },
            { delta_x: 0, delta_y: 0, next_facing: 'D', path_symbol: 'D', requires_open_cell: false }
        ]
    };

    const explore_route = (current_location_state, map_data) => {
        if (current_location_state.col === 0 && current_location_state.row === 0 && current_location_state.dir === 'L') {
            return '';
        }

        const possible_actions = movement_patterns[current_location_state.dir];

        for (const action of possible_actions) {
            const potential_col = current_location_state.col + action.delta_x;
            const potential_row = current_location_state.row + action.delta_y;

            let is_action_valid = false;
            if (action.requires_open_cell) {
                is_action_valid = is_passage_clear(map_data, potential_col, potential_row);
            } else {
                is_action_valid = true;
            }

            if (is_action_valid) {
                const next_state = {
                    col: potential_col,
                    row: potential_row,
                    dir: action.next_facing
                };
                return action.path_symbol + explore_route(next_state, map_data);
            }
        }
        return '';
    };

    const grid_layout = parse_input_to_matrix(input_text_content);
    const starting_point = { col: 0, row: 0, dir: 'R' };
    const generated_path = explore_route(starting_point, grid_layout);
    console.log('R' + generated_path);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));