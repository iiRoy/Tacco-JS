const raw_input_data = require("fs").readFileSync("/dev/stdin", "utf8").split('\n')
let [dimension_size, maximum_jumps] = raw_input_data[0].split(' ').map(Number)
const next_position_map = [null, ...raw_input_data[1].split(' ').map(Number)]
const score_values = [null, ...raw_input_data[2].split(' ').map(Number)]

function* path_traversal_generator(start_node_id, max_allowed_jumps) {
    let current_focus_node = start_node_id
    let total_accumulated_score = 0
    let highest_score_achieved = -Infinity
    let jumps_performed = 0

    const visited_jump_occurrence = new Map()

    visited_jump_occurrence.set(current_focus_node, 0)

    while (jumps_performed < max_allowed_jumps) {
        current_focus_node = next_position_map[current_focus_node]
        total_accumulated_score += score_values[current_focus_node]
        highest_score_achieved = Math.max(highest_score_achieved, total_accumulated_score)
        jumps_performed++

        if (visited_jump_occurrence.has(current_focus_node)) {
            yield {
                current_node_location: current_focus_node,
                total_score_sum: total_accumulated_score,
                peak_score_value: highest_score_achieved,
                jumps_taken_count: jumps_performed,
                loop_entry_jump_index: visited_jump_occurrence.get(current_focus_node)
            }
            return
        }
        visited_jump_occurrence.set(current_focus_node, jumps_performed)

        yield {
            current_node_location: current_focus_node,
            total_score_sum: total_accumulated_score,
            peak_score_value: highest_score_achieved,
            jumps_taken_count: jumps_performed,
            loop_entry_jump_index: -1
        }
    }
    yield {
        current_node_location: current_focus_node,
        total_score_sum: total_accumulated_score,
        peak_score_value: highest_score_achieved,
        jumps_taken_count: jumps_performed,
        loop_entry_jump_index: -1
    }
}

const evaluate_trajectory_score = (starting_point) => {
    let final_trajectory_state
    let loop_was_found = false

    for (const state_snapshot of path_traversal_generator(starting_point, maximum_jumps)) {
        final_trajectory_state = state_snapshot
        if (state_snapshot.loop_entry_jump_index !== -1) {
            loop_was_found = true
            break
        }
    }

    const segment_cumulative_score = final_trajectory_state.total_score_sum
    const segment_maximum_score = final_trajectory_state.peak_score_value
    const segment_jumps_completed = final_trajectory_state.jumps_taken_count

    if (!loop_was_found) {
        return segment_maximum_score
    }

    if (segment_cumulative_score < 0) {
        return segment_maximum_score
    }

    const full_segment_count_base = Math.floor(maximum_jumps / segment_jumps_completed)
    const effective_full_segment_multiplier = (maximum_jumps % segment_jumps_completed === 0)
        ? (full_segment_count_base - 1)
        : full_segment_count_base

    let remainder_segment_max_score = -Infinity
    let current_remainder_path_score = 0
    let remainder_path_current_node = starting_point

    const num_remaining_jumps_in_last_segment = maximum_jumps % segment_jumps_completed

    const scores_from_remainder_path = Array.from({ length: num_remaining_jumps_in_last_segment }).reduce((score_list, _, idx) => {
        remainder_path_current_node = next_position_map[remainder_path_current_node]
        current_remainder_path_score += score_values[remainder_path_current_node]
        score_list.push(current_remainder_path_score)
        return score_list
    }, [])

    remainder_segment_max_score = scores_from_remainder_path.length > 0
        ? Math.max(...scores_from_remainder_path)
        : -Infinity

    const option_a_score = segment_cumulative_score * (effective_full_segment_multiplier - 1) + segment_maximum_score
    const option_b_score = segment_cumulative_score * effective_full_segment_multiplier + remainder_segment_max_score

    return Math.max(option_a_score, option_b_score)
}

let overall_highest_score = -Infinity
for (let starting_point_idx = 1; starting_point_idx <= dimension_size; starting_point_idx++) {
    overall_highest_score = Math.max(overall_highest_score, evaluate_trajectory_score(starting_point_idx))
}
console.log(overall_highest_score)