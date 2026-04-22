function createPriorityQueue() {
    const registry = [];
    return {
        add_element(item_data) {
            registry.push(item_data);
            registry.sort((a, b) => a[0] - b[0]);
        },
        retrieve_lowest() {
            return registry.shift();
        },
        is_empty() {
            return registry.length === 0;
        }
    };
}

function process_grid_challenge(incoming_text_stream) {
    incoming_text_stream = incoming_text_stream.trim();
    const parsed_lines = incoming_text_stream.split('\n');

    const first_dimension_values = parsed_lines[0].split(' ');
    const total_rows = parseInt(first_dimension_values[0]);
    const total_columns = parseInt(first_dimension_values[1]);

    const final_row_index = total_rows - 1;
    const final_column_index = total_columns - 1;

    const geographical_layout = parsed_lines.slice(1).map(current_line => current_line.split(''));

    const expense_matrix = Array(total_rows).fill(null).map(() => Array(total_columns).fill(Infinity));
    const ordered_queue = createPriorityQueue();

    const initial_charge = (geographical_layout[0][0] === '#') ? 1 : 0;
    expense_matrix[0][0] = initial_charge;
    ordered_queue.add_element([initial_charge, 0, 0]);

    while (!ordered_queue.is_empty()) {
        const [current_charge, current_row, current_col] = ordered_queue.retrieve_lowest();

        if (current_charge > expense_matrix[current_row][current_col]) {
            continue;
        }

        let can_move_right = false;
        let can_move_down = false;

        if (current_row === final_row_index) {
            can_move_right = true;
        } else if (current_col === final_column_index) {
            can_move_down = true;
        } else {
            const right_adjacent_feature = geographical_layout[current_row][current_col + 1];
            const down_adjacent_feature = geographical_layout[current_row + 1][current_col];

            if (right_adjacent_feature === '#' && down_adjacent_feature === '.') {
                can_move_down = true;
            } else if (right_adjacent_feature === '.' && down_adjacent_feature === '#') {
                can_move_right = true;
            } else {
                can_move_right = true;
                can_move_down = true;
            }
        }

        if (can_move_right && current_col + 1 < total_columns) {
            const next_col = current_col + 1;
            const next_row = current_row;
            const movement_cost = (geographical_layout[next_row][next_col] === '#') ? 1 : 0;
            const cumulative_cost = current_charge + movement_cost;

            if (cumulative_cost < expense_matrix[next_row][next_col]) {
                expense_matrix[next_row][next_col] = cumulative_cost;
                ordered_queue.add_element([cumulative_cost, next_row, next_col]);
            }
        }

        if (can_move_down && current_row + 1 < total_rows) {
            const next_col = current_col;
            const next_row = current_row + 1;
            const movement_cost = (geographical_layout[next_row][next_col] === '#') ? 1 : 0;
            const cumulative_cost = current_charge + movement_cost;

            if (cumulative_cost < expense_matrix[next_row][next_col]) {
                expense_matrix[next_row][next_col] = cumulative_cost;
                ordered_queue.add_element([cumulative_cost, next_row, next_col]);
            }
        }
    }

    console.log(expense_matrix[final_row_index][final_column_index]);
}

process_grid_challenge(require("fs").readFileSync("/dev/stdin", "utf8"));