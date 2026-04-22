function obtain_input_content() {
    const file_system_utility = require('fs');
    return file_system_utility.readFileSync("/dev/stdin", "utf8");
}

function create_token_extractor(source_data) {
    let current_pos = 0;
    const available_tokens = source_data.split(/\s+/).filter(Boolean);
    return function acquire_next_unit() {
        if (current_pos < available_tokens.length) {
            return available_tokens[current_pos++];
        }
        return null;
    };
}

function determine_alternating_path_count(grid_dimension_h, grid_dimension_w, grid_map_data) {
    let overall_total = 0;
    const visited_tracker = Array(grid_dimension_h).fill(0).map(() => Array(grid_dimension_w).fill(false));
    const movement_offsets = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    function explore_component_iterative(start_r, start_c, collected_cells) {
        const processing_stack = [[start_r, start_c]];
        visited_tracker[start_r][start_c] = true;

        while (processing_stack.length > 0) {
            const [current_r, current_c] = processing_stack.pop();
            collected_cells.push([current_r, current_c]);

            for (const [delta_r, delta_c] of movement_offsets) {
                const next_r = current_r + delta_r;
                const next_c = current_c + delta_c;

                if (next_r >= 0 && next_r < grid_dimension_h &&
                    next_c >= 0 && next_c < grid_dimension_w &&
                    !visited_tracker[next_r][next_c]) {
                    if (grid_map_data[current_r][current_c] !== grid_map_data[next_r][next_c]) {
                        visited_tracker[next_r][next_c] = true;
                        processing_stack.push([next_r, next_c]);
                    }
                }
            }
        }
    }

    for (let r_coord = 0; r_coord < grid_dimension_h; r_coord++) {
        for (let c_coord = 0; c_coord < grid_dimension_w; c_coord++) {
            if (!visited_tracker[r_coord][c_coord]) {
                const current_component_elements = [];
                explore_component_iterative(r_coord, c_coord, current_component_elements);

                let dark_spots = 0;
                let light_spots = 0;
                for (const [comp_r, comp_c] of current_component_elements) {
                    if (grid_map_data[comp_r][comp_c] === '#') {
                        dark_spots++;
                    } else {
                        light_spots++;
                    }
                }
                overall_total += dark_spots * light_spots;
            }
        }
    }
    return overall_total;
}

function initiate_processing(input_text_lines) {
    const get_next_item = create_token_extractor(input_text_lines);

    const puzzle_height = parseInt(get_next_item());
    const puzzle_width = parseInt(get_next_item());

    const puzzle_grid = [];
    for (let i = 0; i < puzzle_height; i++) {
        puzzle_grid.push(get_next_item());
    }

    console.log(determine_alternating_path_count(puzzle_height, puzzle_width, puzzle_grid));
}

const raw_input_data = obtain_input_content();
initiate_processing(raw_input_data);