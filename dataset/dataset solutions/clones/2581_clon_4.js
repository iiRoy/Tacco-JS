const derive_window_magnitude = (origin_index, data_series) => {
  return data_series
    .slice(origin_index, origin_index + 3)
    .reduce((accumulated_total, current_element) => accumulated_total + Math.abs(current_element), 0);
};

const evaluate_wellbeing = (value_array) => {
  return value_array.reduce((aggregate, element_value) => aggregate + element_value, 0) - value_array.length;
};

const extract_sections = (source_string, current_position = 0, collected_sections = []) => {
  if (current_position >= source_string.length) {
    return collected_sections;
  }
  const starting_character = source_string[current_position];
  let scan_position = current_position;
  while (scan_position < source_string.length && source_string[scan_position] === starting_character) {
    scan_position++;
  }
  const section_length = scan_position - current_position;
  return extract_sections(source_string, scan_position, [...collected_sections, section_length]);
};

const perform_transformations = (current_state_array, remaining_iterations, total_N_value) => {
  if (remaining_iterations === 0) {
    return current_state_array;
  }

  const magnitude_at_initial = derive_window_magnitude(0, current_state_array);
  const magnitude_at_second = derive_window_magnitude(1, current_state_array);

  let selected_origin_index = 0;
  let computed_magnitude = magnitude_at_initial;

  if (current_state_array.length > 1 && magnitude_at_second > magnitude_at_initial) {
    selected_origin_index = 1;
    computed_magnitude = magnitude_at_second;
  }

  const next_state_array = [
    ...current_state_array.slice(0, selected_origin_index),
    computed_magnitude,
    ...current_state_array.slice(selected_origin_index + 3),
  ];

  if (total_N_value - 1 === evaluate_wellbeing(next_state_array)) {
    return next_state_array;
  }

  return perform_transformations(next_state_array, remaining_iterations - 1, total_N_value);
};

const process_happiness_puzzle = (system_input) => {
  const line_data = system_input.split("\n");
  const first_line_components = line_data[0].split(" ");
  const total_elements_N = Number.parseInt(first_line_components[0], 10);
  const transformation_steps_K = Number.parseInt(first_line_components[1], 10);
  const input_sequence_S = line_data[1].split(" ")[0];

  let initial_section_lengths = extract_sections(input_sequence_S);

  let final_result_value;

  if (initial_section_lengths.length <= 2) {
    final_result_value = total_elements_N - 1;
  } else {
    const processed_section_lengths = perform_transformations(
      initial_section_lengths,
      transformation_steps_K,
      total_elements_N
    );
    final_result_value = evaluate_wellbeing(processed_section_lengths);
  }

  console.log(final_result_value);
};

process_happiness_puzzle(require("fs").readFileSync("/dev/stdin", "utf8"));