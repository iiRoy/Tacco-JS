const greatest_common_divisor = (param_a, param_b) => {
  let first_val = param_a;
  let second_val = param_b;
  while (second_val !== 0) {
    let temp_val = second_val;
    second_val = first_val % second_val;
    first_val = temp_val;
  }
  return first_val;
};

const parse_numeric_list_item = (str_item) => Number(str_item);

const process_input_data_set = (all_input_lines) => {
  const number_of_entries = parseInt(all_input_lines[0], 10);
  const source_numbers = all_input_lines[1].split(' ').map(parse_numeric_list_item);

  if (number_of_entries < 2) {
    console.log(0);
    return;
  }

  const all_possible_gcds = Array.from({ length: number_of_entries }, (_, excluded_position) => {
    const subset_values = source_numbers.filter((_, current_position) => current_position !== excluded_position);

    const current_subset_gcd = subset_values.reduce((accumulator_value, current_value_in_subset) =>
      greatest_common_divisor(accumulator_value, current_value_in_subset)
    );
    return current_subset_gcd;
  });

  const overall_maximum_gcd = Math.max(...all_possible_gcds);
  console.log(overall_maximum_gcd);
};

const read_data_from_source = require("fs").readFileSync("/dev/stdin", "utf8");
const parsed_lines_from_input = read_data_from_source.trim().split(/\n/);
process_input_data_set(parsed_lines_from_input);