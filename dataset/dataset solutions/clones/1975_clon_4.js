"use strict";

const process_input_data = (source_text) => {
    const lines = source_text.trim().split("\n");

    const element_count = Number(lines[0]);
    const values_array = lines[1].split(" ").map(Number);

    const score_memoizer = new Map();

    const best_score_calculator = (current_value_index, available_position_mask) => {
        const memo_key = `${current_value_index}-${available_position_mask}`;

        if (score_memoizer.has(memo_key)) {
            return score_memoizer.get(memo_key);
        }

        if (current_value_index === element_count) {
            return 0;
        }

        let maximum_achievable_score = -Infinity;

        for (let position_candidate_index = 0; position_candidate_index < element_count; ++position_candidate_index) {
            if ((available_position_mask >> position_candidate_index) & 1) {
                const current_assignment_cost = values_array[current_value_index] * Math.abs(current_value_index - position_candidate_index);

                const remaining_assignment_score = best_score_calculator(
                    current_value_index + 1,
                    available_position_mask ^ (1 << position_candidate_index)
                );

                maximum_achievable_score = Math.max(maximum_achievable_score, current_assignment_cost + remaining_assignment_score);
            }
        }

        score_memoizer.set(memo_key, maximum_achievable_score);
        return maximum_achievable_score;
    };

    const final_result = best_score_calculator(0, (1 << element_count) - 1);

    console.log(final_result);
};

process_input_data(require("fs").readFileSync("/dev/stdin", "utf8"));