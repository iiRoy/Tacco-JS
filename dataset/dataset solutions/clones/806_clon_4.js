const external_resource_handler = require('fs');
const read_content_synchronously = external_resource_handler.readFileSync;
const standard_input_path = '/dev/stdin';

const string_ops_prototype = String.prototype;
const array_ops_prototype = Array.prototype;
const map_constructor = Map;
const numeric_converter = Number;

const print_to_console = console.log;

const object_constructor = Object;

const wall_symbol = '#';
const empty_space_symbol = '.';
const target_symbol = '*';

const up_direction_symbol = '^';
const down_direction_symbol = 'v';
const left_direction_symbol = '<';
const right_direction_symbol = '>';

const up_command_char = 'U';
const down_command_char = 'D';
const left_command_char = 'L';
const right_command_char = 'R';
const shoot_command_char = 'S';

const coordinate_delimiter = ':';
const grid_row_delimiter = '\n';

const initial_padding_line_template = "############################################################"; // Sufficiently long

const remove_outer_whitespace = (source_str) => string_ops_prototype.trim.call(source_str);
const split_by_delimiter = (source_str, delimiter) => string_ops_prototype.split.call(source_str, delimiter);

const convert_elements_to_numbers = (source_arr) => array_ops_prototype.map.call(source_arr, numeric_converter);
const pull_first_element = (source_arr) => array_ops_prototype.shift.call(source_arr);
const add_element_to_front = (source_arr, element) => array_ops_prototype.unshift.call(source_arr, element);
const add_element_to_end = (source_arr, element) => array_ops_prototype.push.call(source_arr, element);
const process_each_element = (source_arr, callback) => array_ops_prototype.forEach.call(source_arr, callback);
const combine_elements_with_separator = (source_arr, separator) => array_ops_prototype.join.call(source_arr, separator);

const get_cell_content = (current_grid, r_coord, c_coord) => {
    const key = `${r_coord}${coordinate_delimiter}${c_coord}`;
    const content = current_grid.get(key);
    return content === undefined ? wall_symbol : content;
};

const set_cell_content = (current_grid, r_coord, c_coord, value_to_set) => {
    const new_grid = new map_constructor(current_grid);
    new_grid.set(`${r_coord}${coordinate_delimiter}${c_coord}`, value_to_set);
    return new_grid;
};

const adjust_craft_position = (current_grid, current_craft, row_increment, col_increment, new_facing_symbol) => {
    const target_row = current_craft.r_pos + row_increment;
    const target_col = current_craft.c_pos + col_increment;
    const current_craft_row = current_craft.r_pos;
    const current_craft_col = current_craft.c_pos;

    const target_cell_content = get_cell_content(current_grid, target_row, target_col);

    let updated_grid = current_grid;
    let updated_craft = object_constructor.assign({}, current_craft);

    if (target_cell_content === empty_space_symbol) {
        updated_grid = set_cell_content(updated_grid, target_row, target_col, new_facing_symbol);
        updated_grid = set_cell_content(updated_grid, current_craft_row, current_craft_col, empty_space_symbol);
        updated_craft.r_pos = target_row;
        updated_craft.c_pos = target_col;
        updated_craft.symbol = new_facing_symbol;
    } else {
        updated_grid = set_cell_content(updated_grid, current_craft_row, current_craft_col, new_facing_symbol);
        updated_craft.symbol = new_facing_symbol;
    }

    return { grid_state: updated_grid, craft_state: updated_craft };
};

const recursively_trace_projectile = (current_grid_state, start_r, start_c, r_step, c_step) => {
    const next_r = start_r + r_step;
    const next_c = start_c + c_step;

    const cell_material = get_cell_content(current_grid_state, next_r, next_c);

    if (cell_material === wall_symbol) {
        return current_grid_state;
    } else if (cell_material === target_symbol) {
        return set_cell_content(current_grid_state, next_r, next_c, empty_space_symbol);
    } else {
        return recursively_trace_projectile(current_grid_state, next_r, next_c, r_step, c_step);
    }
};

const command_action_dispatch = new map_constructor([
    [up_command_char, (g, c) => adjust_craft_position(g, c, -1, 0, up_direction_symbol)],
    [down_command_char, (g, c) => adjust_craft_position(g, c, 1, 0, down_direction_symbol)],
    [left_command_char, (g, c) => adjust_craft_position(g, c, 0, -1, left_direction_symbol)],
    [right_command_char, (g, c) => adjust_craft_position(g, c, 0, 1, right_direction_symbol)],
    [shoot_command_char, (g, c) => {
        let shot_r_step = 0;
        let shot_c_step = 0;
        const current_craft_facing = c.symbol;

        const direction_vectors = new map_constructor([
            [up_direction_symbol, { r: -1, c: 0 }],
            [down_direction_symbol, { r: 1, c: 0 }],
            [left_direction_symbol, { r: 0, c: -1 }],
            [right_direction_symbol, { r: 0, c: 1 }]
        ]);
        const vector = direction_vectors.get(current_craft_facing);
        if (vector) {
            shot_r_step = vector.r;
            shot_c_step = vector.c;
        }

        const new_grid_after_shot = recursively_trace_projectile(g, c.r_pos, c.c_pos, shot_r_step, shot_c_step);
        return { grid_state: new_grid_after_shot, craft_state: c };
    }]
]);

const process_game_challenge = (challenge_data_lines) => {
    const dimensions_raw = pull_first_element(challenge_data_lines);
    const dimensions_parsed = convert_elements_to_numbers(split_by_delimiter(dimensions_raw, ' '));
    const map_height = dimensions_parsed[0];
    const map_width = dimensions_parsed[1];

    let current_grid_map = new map_constructor();
    let player_craft_object = { r_pos: 0, c_pos: 0, symbol: '' };

    const initial_padded_row_chars = split_by_delimiter(initial_padding_line_template.substring(0, map_width + 2), '');
    process_each_element(initial_padded_row_chars, (char_val, col_idx) => {
        current_grid_map.set(`${0}${coordinate_delimiter}${col_idx}`, char_val);
    });

    for (let r_idx = 0; r_idx < map_height; ++r_idx) {
        let current_map_line_chars = split_by_delimiter(pull_first_element(challenge_data_lines), '');
        add_element_to_front(current_map_line_chars, wall_symbol);
        add_element_to_end(current_map_line_chars, wall_symbol);

        process_each_element(current_map_line_chars, (char_val, c_idx) => {
            current_grid_map.set(`${r_idx + 1}${coordinate_delimiter}${c_idx}`, char_val);
            if (char_val === up_direction_symbol || char_val === down_direction_symbol ||
                char_val === left_direction_symbol || char_val === right_direction_symbol) {
                player_craft_object.r_pos = r_idx + 1;
                player_craft_object.c_pos = c_idx;
                player_craft_object.symbol = char_val;
            }
        });
    }

    const final_padded_row_chars = split_by_delimiter(initial_padding_line_template.substring(0, map_width + 2), '');
    process_each_element(final_padded_row_chars, (char_val, col_idx) => {
        current_grid_map.set(`${map_height + 1}${coordinate_delimiter}${col_idx}`, char_val);
    });

    pull_first_element(challenge_data_lines);
    const commands_raw = pull_first_element(challenge_data_lines);
    const command_characters = split_by_delimiter(commands_raw, '');

    process_each_element(command_characters, (single_command_char) => {
        const handler = command_action_dispatch.get(single_command_char);
        if (handler) {
            const result = handler(current_grid_map, player_craft_object);
            current_grid_map = result.grid_state;
            player_craft_object = result.craft_state;
        }
    });

    const reconstructed_output_rows = [];
    for (let r_idx = 1; r_idx <= map_height; ++r_idx) {
        let row_chars = [];
        for (let c_idx = 1; c_idx <= map_width; ++c_idx) {
            add_element_to_end(row_chars, get_cell_content(current_grid_map, r_idx, c_idx));
        }
        add_element_to_end(reconstructed_output_rows, combine_elements_with_separator(row_chars, ''));
    }

    return combine_elements_with_separator(reconstructed_output_rows, grid_row_delimiter);
};

const incoming_data_payload = read_content_synchronously(standard_input_path, 'utf8');
const processed_data_sections_raw = remove_outer_whitespace(incoming_data_payload);
let processed_data_sections = split_by_delimiter(processed_data_sections_raw, grid_row_delimiter);

const challenge_iterations_count = numeric_converter(pull_first_element(processed_data_sections));

const handle_challenges_recursively = (remaining_count, current_data_lines, results_accumulator) => {
    if (remaining_count === 0) {
        return results_accumulator;
    }

    const current_challenge_result = process_game_challenge(current_data_lines);
    add_element_to_end(results_accumulator, current_challenge_result);

    return handle_challenges_recursively(remaining_count - 1, current_data_lines, results_accumulator);
};

const all_challenge_results = handle_challenges_recursively(challenge_iterations_count, processed_data_sections, []);

process_each_element(all_challenge_results, (result_string, idx) => {
    if (idx !== 0) {
        print_to_console('');
    }
    print_to_console(result_string);
});