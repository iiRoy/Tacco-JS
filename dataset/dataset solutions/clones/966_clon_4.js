const system_settings = { data_source: '/dev/stdin', line_break: '\n' };

const PUZZLE_DIM = 4;
const TOTAL_CELLS = PUZZLE_DIM * PUZZLE_DIM;
const EMPTY_TILE_VALUE = 0;

const generate_adjacency_map = (dim_val) => {
    const adj_map = Array.from({ length: dim_val * dim_val }, () => []);
    for (let r = 0; r < dim_val; r++) {
        for (let c = 0; c < dim_val; c++) {
            const current_idx = r * dim_val + c;
            if (r > 0) adj_map[current_idx].push(current_idx - dim_val);
            if (r < dim_val - 1) adj_map[current_idx].push(current_idx + dim_val);
            if (c > 0) adj_map[current_idx].push(current_idx - 1);
            if (c < dim_val - 1) adj_map[current_idx].push(current_idx + 1);
        }
    }
    return adj_map;
};
const cell_neighbors = generate_adjacency_map(PUZZLE_DIM);

const generate_manhattan_distances = (dim_val) => {
    const dist_matrix = Array.from({ length: dim_val * dim_val }, () =>
        Array(dim_val * dim_val).fill(0)
    );
    for (let i_cell = 0; i_cell < dim_val * dim_val; i_cell++) {
        for (let j_cell = 0; j_cell < dim_val * dim_val; j_cell++) {
            const r1 = Math.floor(i_cell / dim_val);
            const c1 = i_cell % dim_val;
            const r2 = Math.floor(j_cell / dim_val);
            const c2 = j_cell % dim_val;
            dist_matrix[i_cell][j_cell] = Math.abs(r1 - r2) + Math.abs(c1 - c2);
        }
    }
    return dist_matrix;
};
const cell_distance_lookup = generate_manhattan_distances(PUZZLE_DIM);

const raw_input_data = require('fs').readFileSync(system_settings.data_source, 'ascii');
const processed_input_lines = raw_input_data
    .trim()
    .split(system_settings.line_break);

const starting_arrangement = processed_input_lines.reduce((acc, line) => {
    return acc.concat(line.split(' ').map(val => parseInt(val, 10)));
}, []);

const final_arrangement = Array.from({ length: TOTAL_CELLS }, (_, k) => (k + 1) % TOTAL_CELLS);

const tile_goal_positions = new Map();
for (let i = 0; i < TOTAL_CELLS; i++) {
    tile_goal_positions.set(final_arrangement[i], i);
}

const evaluate_heuristic = (puzzle_state, dist_map, goal_pos_map) => {
    let h_val = 0;
    for (let current_idx = 0; current_idx < TOTAL_CELLS; current_idx++) {
        const tile_at_current_idx = puzzle_state[current_idx];
        if (tile_at_current_idx === EMPTY_TILE_VALUE) continue;
        const goal_idx_for_tile = goal_pos_map.get(tile_at_current_idx);
        h_val += dist_map[current_idx][goal_idx_for_tile];
    }
    return Math.floor(h_val / 2);
};

function perform_idls_iterative(initial_layout, current_depth_limit) {
    const path_tracker = [];
    const initial_gap_index = initial_layout.indexOf(EMPTY_TILE_VALUE);

    path_tracker.push({
        board_config: initial_layout,
        moves_made: 0,
        zero_tile_pos: initial_gap_index,
        next_adj_idx_to_try: 0
    });

    while (path_tracker.length > 0) {
        let current_frame = path_tracker[path_tracker.length - 1];

        if (current_frame.next_adj_idx_to_try >= cell_neighbors[current_frame.zero_tile_pos].length) {
            path_tracker.pop();
            continue;
        }

        if (current_frame.moves_made === current_depth_limit) {
            let solved_at_limit = true;
            for (let k = 0; k < TOTAL_CELLS; k++) {
                if (current_frame.board_config[k] !== final_arrangement[k]) {
                    solved_at_limit = false;
                    break;
                }
            }
            if (solved_at_limit) {
                return true;
            }
            path_tracker.pop();
            continue;
        }

        const current_h_val = evaluate_heuristic(current_frame.board_config, cell_distance_lookup, tile_goal_positions);
        if (current_frame.moves_made + current_h_val > current_depth_limit) {
            path_tracker.pop();
            continue;
        }

        const adjacent_options = cell_neighbors[current_frame.zero_tile_pos];
        const next_neighbor_idx = adjacent_options[current_frame.next_adj_idx_to_try];

        current_frame.next_adj_idx_to_try++;

        const new_layout_config = [...current_frame.board_config];
        const tile_to_shift = new_layout_config[next_neighbor_idx];
        new_layout_config[current_frame.zero_tile_pos] = tile_to_shift;
        new_layout_config[next_neighbor_idx] = EMPTY_TILE_VALUE;

        path_tracker.push({
            board_config: new_layout_config,
            moves_made: current_frame.moves_made + 1,
            zero_tile_pos: next_neighbor_idx,
            next_adj_idx_to_try: 0
        });
    }

    return false;
}

let solution_found_depth;
for (let search_depth = 0; search_depth <= 45; search_depth++) {
    if (perform_idls_iterative(starting_arrangement, search_depth)) {
        solution_found_depth = search_depth;
        break;
    }
}
console.log(solution_found_depth);