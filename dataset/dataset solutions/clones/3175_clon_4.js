function compute_optimal_cost(goal_a, goal_b, goal_c, segment_values, segment_count) {
  let overall_min_cost = Number.MAX_SAFE_INTEGER;

  const total_possibilities = Math.pow(4, segment_count);

  for (let iteration_index = 0; iteration_index < total_possibilities; ++iteration_index) {
    let sum_target_a = 0;
    let sum_target_b = 0;
    let sum_target_c = 0;
    let current_assignment_cost = 0;
    let flag_a_satisfied = false;
    let flag_b_satisfied = false;
    let flag_c_satisfied = false;

    let temp_iteration_val = iteration_index;

    for (let k = 0; k < segment_count; ++k) {
      const assignment_choice = temp_iteration_val % 4;
      const length_value = segment_values[k];

      if (assignment_choice === 1) { // Assign to A
        sum_target_a += length_value;
        flag_a_satisfied = true;
        current_assignment_cost += 10;
      } else if (assignment_choice === 2) { // Assign to B
        sum_target_b += length_value;
        flag_b_satisfied = true;
        current_assignment_cost += 10;
      } else if (assignment_choice === 3) { // Assign to C
        sum_target_c += length_value;
        flag_c_satisfied = true;
        current_assignment_cost += 10;
      }
      // assignment_choice === 0: Don't use, no cost, no sum change

      temp_iteration_val = Math.floor(temp_iteration_val / 4);
    }

    if (flag_a_satisfied && flag_b_satisfied && flag_c_satisfied) {
      let combination_total_cost = current_assignment_cost;
      combination_total_cost += Math.abs(goal_a - sum_target_a);
      combination_total_cost += Math.abs(goal_b - sum_target_b);
      combination_total_cost += Math.abs(goal_c - sum_target_c);
      combination_total_cost -= 30; // Fixed penalty

      overall_min_cost = Math.min(overall_min_cost, combination_total_cost);
    }
  }

  return overall_min_cost;
}

function process_input_and_output(input_data) {
  const input_lines = input_data.split('\n');
  const first_line_elements = input_lines[0].split(' ').map(val_str => parseInt(val_str, 10));

  const segment_count = first_line_elements[0];
  const goal_a = first_line_elements[1];
  const goal_b = first_line_elements[2];
  const goal_c = first_line_elements[3];

  const segment_values = input_lines.slice(1).map(val_str => parseInt(val_str, 10));

  const outcome = compute_optimal_cost(goal_a, goal_b, goal_c, segment_values, segment_count);
  console.log(outcome);
}

process_input_and_output(require('fs').readFileSync('/dev/stdin', 'utf8'));