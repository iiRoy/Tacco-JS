const raw_data_buffer = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const lines_array = raw_data_buffer.split('\n').filter(Boolean);

const count_of_items = Number(lines_array[0]);

let initial_aggregate = 0;
for (let p_idx = 1; p_idx <= count_of_items; ++p_idx) {
  let current_sub_sum = 0;
  for (let q_idx = 1; q_idx <= p_idx; ++q_idx) {
    current_sub_sum += q_idx;
  }
  initial_aggregate += current_sub_sum;
}

const constraint_strings = lines_array.slice(1);

const final_computed_value = constraint_strings.reduce((current_total, constraint_line) => {
  const parts = constraint_line.split(' ').map(s => Number(s));
  let point_one = parts[0];
  let point_two = parts[1];

  const lower_bound = Math.min(point_one, point_two);
  const upper_bound = Math.max(point_one, point_two);

  return current_total - (lower_bound * (count_of_items - upper_bound + 1));
}, initial_aggregate);

console.log(final_computed_value);