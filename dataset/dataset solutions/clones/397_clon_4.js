const explore_sequence_recursively = (data_matrix, current_row_idx, current_col_idx, row_movement, col_movement, matrix_size) => {
    if (current_row_idx < 0 || current_col_idx < 0 || current_row_idx >= matrix_size || current_col_idx >= matrix_size) {
        return 0;
    }
    if (data_matrix[current_row_idx][current_col_idx] !== 1) {
        return 0;
    }

    return 1 + explore_sequence_recursively(
        data_matrix,
        current_row_idx + row_movement,
        current_col_idx + col_movement,
        row_movement,
        col_movement,
        matrix_size
    );
};

const evaluate_point_sequences = (data_matrix, start_row, start_col, matrix_size) => {
    const movement_patterns = [
        { r_step: 0, c_step: 1 },
        { r_step: 1, c_step: -1 },
        { r_step: 1, c_step: 0 },
        { r_step: 1, c_step: 1 }
    ];

    return movement_patterns.reduce((current_max_span, pattern) => {
        const span_in_direction = explore_sequence_recursively(
            data_matrix,
            start_row,
            start_col,
            pattern.r_step,
            pattern.c_step,
            matrix_size
        );
        return Math.max(current_max_span, span_in_direction);
    }, 0);
};

function* input_line_generator(text_input_blob) {
    const all_lines = text_input_blob.trim().split('\n');
    let line_cursor = 0;
    while (line_cursor < all_lines.length) {
        yield all_lines[line_cursor++];
    }
}

const process_grid_series = (raw_data_string) => {
    const input_stream = input_line_generator(raw_data_string);
    const output_results = [];

    let current_line_content;
    while ((current_line_content = input_stream.next().value) !== undefined) {
        const current_grid_dimension = parseInt(current_line_content, 10);

        if (current_grid_dimension === 0) {
            break;
        }

        const current_grid_structure = [];
        for (let r_coord = 0; r_coord < current_grid_dimension; r_coord++) {
            const row_string_representation = input_stream.next().value;
            current_grid_structure.push(row_string_representation.split('').map(Number));
        }

        let overall_grid_maximum_span = 0;

        const all_grid_points = Array.from({ length: current_grid_dimension * current_grid_dimension }, (_, global_index) => ({
            row: Math.floor(global_index / current_grid_dimension),
            col: global_index % current_grid_dimension
        }));

        overall_grid_maximum_span = all_grid_points.reduce((current_global_max, point_coords) => {
            if (current_grid_structure[point_coords.row][point_coords.col] === 1) {
                const point_max_span = evaluate_point_sequences(
                    current_grid_structure,
                    point_coords.row,
                    point_coords.col,
                    current_grid_dimension
                );
                return Math.max(current_global_max, point_max_span);
            }
            return current_global_max;
        }, 0);

        output_results.push(overall_grid_maximum_span);
    }
    return output_results.join('\n');
};

console.log(process_grid_series(input));