const get_input_processor = (input_content) => {
    let source_lines = input_content.trim().split("\n");
    let line_pointer = 0;
    let current_line_elements_buffer = [];

    const extract_token = (as_string_flag = false) => {
        if (current_line_elements_buffer.length === 0) {
            if (line_pointer >= source_lines.length) {
                return undefined;
            }
            current_line_elements_buffer = source_lines[line_pointer].split(" ").reverse();
            line_pointer++;
        }
        const extracted_value = current_line_elements_buffer.pop();
        return as_string_flag ? extracted_value : Number(extracted_value);
    };

    const read_line_elements = (as_strings_flag = false) => {
        if (line_pointer >= source_lines.length) {
            return undefined;
        }
        const current_row_text = source_lines[line_pointer];
        line_pointer++;
        const elements_array = current_row_text.split(" ");
        return as_strings_flag ? elements_array : elements_array.map(Number);
    };

    const get_matrix_data = (rows_count, as_strings_flag = false) => {
        const collected_rows = [];
        for (let idx = 0; idx < rows_count; idx++) {
            if (line_pointer >= source_lines.length) {
                break;
            }
            const row_data = source_lines[line_pointer].split(" ");
            collected_rows.push(row_data);
            line_pointer++;
        }
        return as_strings_flag ? collected_rows : collected_rows.map(row => row.map(Number));
    };

    const fetch_raw_line_segment = (segment_length, as_strings_flag = false) => {
        const segment_data = [];
        for (let idx = 0; idx < segment_length; idx++) {
            if (line_pointer >= source_lines.length) {
                break;
            }
            const line_item = source_lines[line_pointer];
            segment_data.push(line_item);
            line_pointer++;
        }
        return as_strings_flag ? segment_data : segment_data.map(Number);
    };

    return {
        fetch_item: extract_token,
        fetch_row: read_line_elements,
        fetch_table: get_matrix_data,
        fetch_sequence: fetch_raw_line_segment
    };
};

const input_source_accessor = get_input_processor(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(solve_path_problem());

function solve_path_problem() {
    const height_dimension = input_source_accessor.fetch_item();
    const width_dimension = input_source_accessor.fetch_item();
    const block_quantity = input_source_accessor.fetch_item();

    const occupied_columns_by_row = Array.from({ length: height_dimension + 1 }, () => new Set());

    for (let current_row_index = 0; current_row_index <= height_dimension; current_row_index++) {
        occupied_columns_by_row[current_row_index].add(width_dimension + 1);
    }

    for (let k = 0; k < block_quantity; k++) {
        const block_coordinates = input_source_accessor.fetch_row();
        occupied_columns_by_row[block_coordinates[1]].add(block_coordinates[0]);
    }

    let current_min_width_limit = width_dimension;
    let rightmost_clear_path_pos = 2;

    for (let row_number = 2; row_number <= height_dimension; row_number++) {
        while (occupied_columns_by_row[row_number].has(rightmost_clear_path_pos)) {
            rightmost_clear_path_pos++;
        }

        if (rightmost_clear_path_pos > current_min_width_limit) {
            break;
        }

        const sorted_obstacles_in_current_row = Array.from(occupied_columns_by_row[row_number]).sort((a, b) => a - b);

        for (const obstacle_column of sorted_obstacles_in_current_row) {
            if (rightmost_clear_path_pos > obstacle_column) {
                continue;
            }
            if (obstacle_column - 1 < current_min_width_limit) {
                current_min_width_limit = obstacle_column - 1;
            }
            break;
        }

        rightmost_clear_path_pos++;
    }

    return current_min_width_limit;
}