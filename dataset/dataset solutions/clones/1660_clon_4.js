const g_file_system_util = require("fs");

function* make_string_iterator(raw_input_line) {
    const word_segments = raw_input_line.split(/\s+/);
    for (const segment of word_segments) {
        yield segment;
    }
}

function create_numeric_parser(input_string_line) {
    const string_source_iterator = make_string_iterator(input_string_line);
    return () => parseInt(string_source_iterator.next().value, 10);
}

const NO_SELECTION = 0;
const X_COORD_SELECTION = 1;
const Y_COORD_SELECTION = 2;

function compute_current_expense(
    total_locations_count,
    original_location_data,
    selection_plan,
    horizontally_sorted_locations,
    vertically_sorted_locations
) {
    const individual_location_expenses = new Array(total_locations_count);

    original_location_data.forEach(location => {
        const [x_val, y_val, price_val, current_idx] = location;
        individual_location_expenses[current_idx] = Math.min(Math.abs(x_val), Math.abs(y_val)) * price_val;
    });

    let last_y_anchor_ref = null;
    for (const loc_entry of horizontally_sorted_locations) {
        const [x_val, y_val, price_val, current_idx] = loc_entry;
        if (selection_plan[current_idx] === Y_COORD_SELECTION) {
            last_y_anchor_ref = loc_entry;
            individual_location_expenses[current_idx] = 0;
        } else if (last_y_anchor_ref !== null) {
            const [anchor_x_val] = last_y_anchor_ref;
            individual_location_expenses[current_idx] = Math.min(
                Math.abs(x_val - anchor_x_val) * price_val,
                individual_location_expenses[current_idx]
            );
        }
    }

    last_y_anchor_ref = null;
    for (let i = horizontally_sorted_locations.length - 1; i >= 0; --i) {
        const loc_entry = horizontally_sorted_locations[i];
        const [x_val, y_val, price_val, current_idx] = loc_entry;
        if (selection_plan[current_idx] === Y_COORD_SELECTION) {
            last_y_anchor_ref = loc_entry;
            individual_location_expenses[current_idx] = 0;
        } else if (last_y_anchor_ref !== null) {
            const [anchor_x_val] = last_y_anchor_ref;
            individual_location_expenses[current_idx] = Math.min(
                Math.abs(x_val - anchor_x_val) * price_val,
                individual_location_expenses[current_idx]
            );
        }
    }

    let last_x_anchor_ref = null;
    for (const loc_entry of vertically_sorted_locations) {
        const [x_val, y_val, price_val, current_idx] = loc_entry;
        if (selection_plan[current_idx] === X_COORD_SELECTION) {
            last_x_anchor_ref = loc_entry;
            individual_location_expenses[current_idx] = 0;
        } else if (last_x_anchor_ref !== null) {
            const [, anchor_y_val] = last_x_anchor_ref;
            individual_location_expenses[current_idx] = Math.min(
                Math.abs(y_val - anchor_y_val) * price_val,
                individual_location_expenses[current_idx]
            );
        }
    }

    last_x_anchor_ref = null;
    for (let i = vertically_sorted_locations.length - 1; i >= 0; --i) {
        const loc_entry = vertically_sorted_locations[i];
        const [x_val, y_val, price_val, current_idx] = loc_entry;
        if (selection_plan[current_idx] === X_COORD_SELECTION) {
            last_x_anchor_ref = loc_entry;
            individual_location_expenses[current_idx] = 0;
        } else if (last_x_anchor_ref !== null) {
            const [, anchor_y_val] = last_x_anchor_ref;
            individual_location_expenses[current_idx] = Math.min(
                Math.abs(y_val - anchor_y_val) * price_val,
                individual_location_expenses[current_idx]
            );
        }
    }

    return individual_location_expenses.reduce((total, expense) => total + expense, 0);
}

function determine_minimum_costs(location_count, point_records) {
    const best_aggregate_costs = new Array(location_count + 1).fill(Number.MAX_SAFE_INTEGER);

    const points_by_x = [...point_records].sort((a, b) => a[0] - b[0]);
    const points_by_y = [...point_records].sort((a, b) => a[1] - b[1]);

    for (let current_config_id = 0; current_config_id < Math.pow(3, location_count); ++current_config_id) {
        const current_assignment = new Array(location_count);
        let active_anchor_count = 0;
        let temp_id_for_config = current_config_id;

        for (let j = 0; j < location_count; ++j) {
            const choice_type = temp_id_for_config % 3;
            current_assignment[j] = choice_type;
            if (choice_type !== NO_SELECTION) {
                active_anchor_count++;
            }
            temp_id_for_config = Math.floor(temp_id_for_config / 3);
        }

        const calculated_total_expense = compute_current_expense(
            location_count,
            point_records,
            current_assignment,
            points_by_x,
            points_by_y
        );
        best_aggregate_costs[active_anchor_count] = Math.min(
            best_aggregate_costs[active_anchor_count],
            calculated_total_expense
        );
    }

    return best_aggregate_costs;
}

function process_input_data(input_text_lines) {
    const get_next_integer = create_numeric_parser(input_text_lines);
    const num_points = get_next_integer();
    const all_points_storage = [];

    for (let k = 0; k < num_points; ++k) {
        const p_x = get_next_integer();
        const p_y = get_next_integer();
        const p_price = get_next_integer();
        all_points_storage.push([p_x, p_y, p_price, k]);
    }

    console.log(determine_minimum_costs(num_points, all_points_storage).join('\n'));
}

const input_line_from_stdin = g_file_system_util.readFileSync("/dev/stdin", "utf8");
process_input_data(input_line_from_stdin);