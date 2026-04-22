const input_processor_factory = (source_text_content) => {
    let raw_text_lines = source_text_content.trim().split("\n");
    let current_line_pointer = 0;
    let line_token_buffer = null;

    const read_next_item = (return_as_string_flag) => {
        if (line_token_buffer === null || line_token_buffer.length === 0) {
            if (current_line_pointer >= raw_text_lines.length) {
                return undefined;
            }
            line_token_buffer = raw_text_lines[current_line_pointer].split(" ");
            current_line_pointer++;
        }
        const extracted_token = line_token_buffer.shift();
        return return_as_string_flag ? extracted_token : Number(extracted_token);
    };

    const scan_line_items = (return_as_string_flag) => {
        if (current_line_pointer >= raw_text_lines.length) {
            return [];
        }
        const current_row_data = raw_text_lines[current_line_pointer++];
        const row_elements = current_row_data.split(" ");
        return return_as_string_flag ? row_elements : row_elements.map(Number);
    };

    const extract_block_items = (number_of_rows, return_as_string_flag) => {
        const accumulated_rows = [];
        for (let i = 0; i < number_of_rows; i++) {
            if (current_line_pointer >= raw_text_lines.length) break;
            const current_row_data = raw_text_lines[current_line_pointer++];
            const row_elements = current_row_data.split(" ");
            accumulated_rows.push(return_as_string_flag ? row_elements : row_elements.map(Number));
        }
        return accumulated_rows;
    };

    const obtain_line_segments = (segment_count_limit, return_as_string_flag) => {
        const segments_collection = [];
        for (let i = 0; i < segment_count_limit; i++) {
            if (current_line_pointer >= raw_text_lines.length) break;
            const current_line_data = raw_text_lines[current_line_pointer++];
            segments_collection.push(return_as_string_flag ? current_line_data : Number(current_line_data));
        }
        return segments_collection;
    };

    return {
        read_next_item,
        scan_line_items,
        extract_block_items,
        obtain_line_segments,
    };
};

const construct_value_list = (base_value_producer, list_item_count) => {
    return Array.from({ length: list_item_count }, base_value_producer);
};

const determine_trailing_binary_zeros_plus_one = (numeric_expression) => {
    let zero_count = 0;
    while ((numeric_expression & 1) === 0) {
        numeric_expression >>= 1;
        zero_count++;
    }
    return zero_count + 1;
};

const process_data_stream = () => {
    const input_reader_instance = input_processor_factory(require("fs").readFileSync("/dev/stdin", "utf8"));
    const matrix_dimension = input_reader_instance.read_next_item();

    const final_result_grid = Array.from({ length: matrix_dimension - 1 }, (_, row_index) => {
        return Array.from({ length: matrix_dimension - 1 - row_index }, (_, column_offset) => {
            const actual_column_index = row_index + 1 + column_offset;
            const bitwise_xor_result = row_index ^ actual_column_index;
            return determine_trailing_binary_zeros_plus_one(bitwise_xor_result);
        });
    });

    return final_result_grid.map(row_data => row_data.join(" ")).join("\n");
};

console.log(process_data_stream());