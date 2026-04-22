'use strict';

function retrieve_segment_total(first_element_pos, last_element_pos, cumulative_totals_array) {
    return cumulative_totals_array[last_element_pos] - (first_element_pos > 0 ? cumulative_totals_array[first_element_pos - 1] : 0);
}

function generate_cumulative_sums(initial_values) {
    if (!initial_values || initial_values.length === 0) return [];
    let current_total_accumulator = 0;
    return initial_values.map(val => {
        current_total_accumulator += val;
        return current_total_accumulator;
    });
}

function determine_optimal_segmentation_cost(data_set_size, input_data_series) {
    const precomputed_sums = generate_cumulative_sums(input_data_series);
    const memoization_table = Array.from({ length: data_set_size }, () => Array(data_set_size).fill(null));

    function calculate_cost_recursively(start_idx, end_idx) {
        if (start_idx === end_idx) {
            return 0;
        }
        if (memoization_table[start_idx][end_idx] !== null) {
            return memoization_table[start_idx][end_idx];
        }

        let minimum_current_cost = Number.MAX_SAFE_INTEGER;

        for (let split_idx = start_idx; split_idx < end_idx; split_idx++) {
            const left_subproblem_cost = calculate_cost_recursively(start_idx, split_idx);
            const right_subproblem_cost = calculate_cost_recursively(split_idx + 1, end_idx);

            const merging_cost = retrieve_segment_total(start_idx, split_idx, precomputed_sums) +
                                 retrieve_segment_total(split_idx + 1, end_idx, precomputed_sums);

            minimum_current_cost = Math.min(
                minimum_current_cost,
                left_subproblem_cost + right_subproblem_cost + merging_cost
            );
        }
        memoization_table[start_idx][end_idx] = minimum_current_cost;
        return minimum_current_cost;
    }

    return calculate_cost_recursively(0, data_set_size - 1);
}

function process_input_data(source_text) {
    const text_lines = source_text.split("\n");
    const total_elements_count = Number(text_lines[0]);
    const numeric_sequence = text_lines[1].split(' ').map(val => Number(val));

    const calculated_outcome = determine_optimal_segmentation_cost(total_elements_count, numeric_sequence);
    console.log(calculated_outcome);
}

process_input_data(require('fs').readFileSync('/dev/stdin', 'utf8'));