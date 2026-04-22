function extract_first_number(text_blob_source) {
  const all_lines_data = text_blob_source.split('\n');
  if (all_lines_data.length === 0) return 0;
  const first_line_elements = all_lines_data[0].split(' ');
  if (first_line_elements.length === 0) return 0;
  return Number(first_line_elements[0]);
}

function locate_sequence_length_recursively(current_index, cumulative_summation, modulo_divisor) {
  const next_summation_value = cumulative_summation + current_index;

  if (next_summation_value % modulo_divisor === 0 && current_index !== 1) {
    return current_index;
  } else {
    return locate_sequence_length_recursively(current_index + 1, next_summation_value, modulo_divisor);
  }
}

function process_input_and_calculate(raw_input_content) {
  const target_number = extract_first_number(raw_input_content);
  const final_result_count = locate_sequence_length_recursively(1, 0, target_number);
  console.log(final_result_count);
}

process_input_and_calculate(require("fs").readFileSync("/dev/stdin", "utf8"));