const convert_text_to_numeral = (segment_of_text) => {
  let inner_start_index = 0;
  while (inner_start_index < segment_of_text.length && segment_of_text.charCodeAt(inner_start_index) === 32) {
    inner_start_index++;
  }

  let inner_end_index = segment_of_text.length - 1;
  while (inner_end_index >= 0 && segment_of_text.charCodeAt(inner_end_index) === 32) {
    inner_end_index--;
  }

  if (inner_start_index > inner_end_index) {
    return 0;
  }

  let numeral_string = segment_of_text.substring(inner_start_index, inner_end_index + 1);
  let accumulated_value = 0;
  for (let char_iterator = 0; char_iterator < numeral_string.length; char_iterator++) {
    let digit_char_code = numeral_string.charCodeAt(char_iterator) - 48;
    accumulated_value = accumulated_value * 10 + digit_char_code;
  }
  return accumulated_value;
};

const process_incoming_stream_data = (raw_data_input) => {
  let overall_trim_start = 0;
  while (overall_trim_start < raw_data_input.length && raw_data_input.charCodeAt(overall_trim_start) === 32) {
    overall_trim_start++;
  }

  let overall_trim_end = raw_data_input.length - 1;
  while (overall_trim_end >= 0 && raw_data_input.charCodeAt(overall_trim_end) === 32) {
    overall_trim_end--;
  }

  let trimmed_full_string = '';
  if (overall_trim_start <= overall_trim_end) {
    trimmed_full_string = raw_data_input.substring(overall_trim_start, overall_trim_end + 1);
  }

  let collected_segments = [];
  let current_segment_buffer = '';
  for (let char_pos = 0; char_pos <= trimmed_full_string.length; char_pos++) {
    if (char_pos < trimmed_full_string.length && trimmed_full_string.charCodeAt(char_pos) !== 32) {
      current_segment_buffer += trimmed_full_string[char_pos];
    } else {
      collected_segments.push(current_segment_buffer);
      current_segment_buffer = '';
    }
  }

  let first_element_string = collected_segments[0] || '';
  let second_element_string = collected_segments[1] || '';

  let first_numerical_value = convert_text_to_numeral(first_element_string);
  let second_numerical_value = convert_text_to_numeral(second_element_string);

  let comparison_result_boolean = (first_numerical_value === 9 || second_numerical_value === 9);

  const outcome_mapping = {
    true: 'Yes',
    false: 'No'
  };

  process.stdout.write(outcome_mapping[comparison_result_boolean] + '\n');
};

const acquire_external_data = (path_location_string, encoding_type_string) => {
  const file_system_utility = require('node:fs');
  return file_system_utility.readFileSync(path_location_string, encoding_type_string);
};

process_incoming_stream_data(acquire_external_data('/dev/stdin', 'utf8'));