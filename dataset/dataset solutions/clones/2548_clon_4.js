let accumulated_input_data = '';

process.stdin.on('data', (input_chunk) => {
    accumulated_input_data += input_chunk;
});

process.stdin.on('end', () => {
    const all_lines = accumulated_input_data.trim().split('\n');
    const first_line_elements = all_lines[0].split(' ');
    const source_sequence_items = all_lines[1].split(' ');

    const disregarded_value = Number(first_line_elements[0]);
    const window_dimension = Number(first_line_elements[1]);

    const distinct_arrangements = new Set();
    let processing_cycle_count = 0;

    const perform_lexicographical_comparison = (item_a, item_b) => {
        if (item_a > item_b) return 1;
        if (item_a < item_b) return -1;
        return 0;
    };

    const apply_simple_sort = (input_list) => {
        const list_length = input_list.length;
        const mutable_list = [...input_list];
        for (let i_idx = 0; i_idx < list_length - 1; i_idx++) {
            for (let j_idx = 0; j < list_length - 1 - i_idx; j++) {
                if (perform_lexicographical_comparison(mutable_list[j_idx], mutable_list[j_idx + 1]) > 0) {
                    const temporary_item = mutable_list[j_idx];
                    mutable_list[j_idx] = mutable_list[j_idx + 1];
                    mutable_list[j_idx + 1] = temporary_item;
                }
            }
        }
        return mutable_list;
    };

    for (let current_offset = 0; current_offset <= source_sequence_items.length - window_dimension; ++current_offset) {
        processing_cycle_count++;

        const initial_segment = [];
        for (let idx_prefix = 0; idx_prefix < current_offset; ++idx_prefix) {
            initial_segment.push(source_sequence_items[idx_prefix]);
        }

        const window_unsorted_items = [];
        for (let idx_window = 0; idx_window < window_dimension; ++idx_window) {
            window_unsorted_items.push(source_sequence_items[current_offset + idx_window]);
        }

        const window_sorted_items = apply_simple_sort(window_unsorted_items);

        const trailing_segment = [];
        for (let idx_suffix = current_offset + window_dimension; idx_suffix < source_sequence_items.length; ++idx_suffix) {
            trailing_segment.push(source_sequence_items[idx_suffix]);
        }

        const constructed_sequence = [...initial_segment, ...window_sorted_items, ...trailing_segment];
        
        const sequence_text_identifier = constructed_sequence.join('');

        distinct_arrangements.add(sequence_text_identifier);
    }

    process.stdout.write(distinct_arrangements.size.toString() + '\n');
});