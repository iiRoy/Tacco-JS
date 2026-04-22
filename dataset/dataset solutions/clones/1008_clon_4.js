const m_system_io = require('node:fs');

const f_input_path_specifier = '/dev/stdin';

const p_obtain_data_lines = (p_source_location, p_encoding_scheme) =>
  m_system_io.readFileSync(p_source_location, p_encoding_scheme || 'utf8').split(/\r?\n/);

const p_extract_numeric_components = (p_text_stream) =>
  (p_text_stream.match(/-?\d+/g) || []).map(Number);

const p_arrange_collection_and_count_movements = (p_current_set, p_outer_loop_index, p_exchange_indicator) => {
  if (p_outer_loop_index >= p_current_set.length) {
    let output_fragments = [];
    let current_part_index = 0;
    while(current_part_index < p_current_set.length){
        output_fragments.push(String(p_current_set[current_part_index]));
        current_part_index++;
    }
    process.stdout.write(output_fragments.join(' ') + '\n');
    return p_exchange_indicator;
  }

  let initial_minimum_position = p_outer_loop_index;

  const p_find_local_minimum_position = (p_inner_scan_index, p_current_minimum_position) => {
    if (p_inner_scan_index >= p_current_set.length) {
      return p_current_minimum_position;
    }
    if (p_current_set[p_inner_scan_index] < p_current_set[p_current_minimum_position]) {
      p_current_minimum_position = p_inner_scan_index;
    }
    return p_find_local_minimum_position(p_inner_scan_index + 1, p_current_minimum_position);
  };

  initial_minimum_position = p_find_local_minimum_position(p_outer_loop_index + 1, p_outer_loop_index);

  if (p_outer_loop_index !== initial_minimum_position) {
    [p_current_set[p_outer_loop_index], p_current_set[initial_minimum_position]] =
      [p_current_set[initial_minimum_position], p_current_set[p_outer_loop_index]];
    p_exchange_indicator++;
  }

  return p_arrange_collection_and_count_movements(p_current_set, p_outer_loop_index + 1, p_exchange_indicator);
};

const l_all_data_segments = p_obtain_data_lines(f_input_path_specifier);
const l_target_values = p_extract_numeric_components(l_all_data_segments[1]);

const l_final_operation_count = p_arrange_collection_and_count_movements(l_target_values, 0, 0);

process.stdout.write(String(l_final_operation_count) + '\n');