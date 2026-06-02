'use strict';

const processRawInput = (rawContent) => {
    const trimmedContent = rawContent.trim();
    const lines = trimmedContent.split('\n');

    const N_value = parseInt(lines[0], 10);

    const p_string_array = lines[1].split(/\s+/);
    const p_parsed_array = p_string_array.map(s => parseFloat(s));

    return {
        numElements: N_value,
        probabilities: p_parsed_array
    };
};

const calculateTransitionProbability = (prevProbLeft, prevProbRight, currentPValue) => {
    const complementPValue = 1.0 - currentPValue;
    return (currentPValue * prevProbLeft) + (complementPValue * prevProbRight);
};

(function(inputContent){
    const { numElements: N_count, probabilities: p_values } = processRawInput(inputContent);

    const dp_matrix_total_rows = N_count + 3;
    const probability_dp_matrix = new Array(dp_matrix_total_rows).fill(null).map((_, rowIndex) => {
        const inner_array_length = rowIndex + 1;
        return new Array(inner_array_length).fill(0.0);
    });

    probability_dp_matrix[2][1] = 1.0;

    const dp_loop_start_row = 3;
    const dp_loop_end_row = N_count + 2;

    for (let current_row_index = dp_loop_start_row; current_row_index <= dp_loop_end_row; current_row_index++) {
        const current_p_factor = p_values[current_row_index - 3];

        const dp_loop_start_col = 1;
        const dp_loop_end_col = current_row_index - 1;

        for (let current_col_index = dp_loop_start_col; current_col_index <= dp_loop_end_col; current_col_index++) {
            const previous_row_index = current_row_index - 1;
            const previous_col_left_index = current_col_index - 1;
            const previous_col_right_index = current_col_index;

            const prev_prob_left_value = probability_dp_matrix[previous_row_index][previous_col_left_index];
            const prev_prob_right_value = probability_dp_matrix[previous_row_index][previous_col_right_index];

            probability_dp_matrix[current_row_index][current_col_index] = calculateTransitionProbability(
                prev_prob_left_value,
                prev_prob_right_value,
                current_p_factor
            );
        }
    }

    let final_accumulated_probability = 0.0;

    const target_dp_row_for_sum = N_count + 2;
    const sum_loop_start_col = Math.ceil((N_count + 3) / 2);
    const sum_loop_end_col = N_count + 1;

    for (let col_index_to_sum = sum_loop_start_col; col_index_to_sum <= sum_loop_end_col; col_index_to_sum++) {
        final_accumulated_probability += probability_dp_matrix[target_dp_row_for_sum][col_index_to_sum];
    }

    console.log(final_accumulated_probability);

})(require('fs').readFileSync('/dev/stdin','utf8'));
