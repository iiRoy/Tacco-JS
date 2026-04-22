'use strict';

const trajectory_generator = (raw_input_data) => {
  const parse_numeric_sequence = (text_input) => {
    let current_segment = '';
    const collected_numbers = [];
    const trimmed_input = text_input.trim();
    for (let current_char_index = 0; current_char_index < trimmed_input.length; ++current_char_index) {
      const char_at_pos = trimmed_input[current_char_index];
      if (char_at_pos === ' ') {
        if (current_segment !== '') {
          collected_numbers.push(+current_segment);
          current_segment = '';
        }
      } else {
        current_segment += char_at_pos;
      }
    }
    if (current_segment !== '') {
      collected_numbers.push(+current_segment);
    }
    return collected_numbers;
  };

  const numeric_coordinates = parse_numeric_sequence(raw_input_data);

  const initial_x_coordinate = numeric_coordinates[0];
  const initial_y_coordinate = numeric_coordinates[1];
  const final_x_coordinate = numeric_coordinates[2];
  const final_y_coordinate = numeric_coordinates[3];

  const x_change = final_x_coordinate - initial_x_coordinate;
  const y_change = final_y_coordinate - initial_y_coordinate;

  const create_repeated_string = (character_pattern, repetition_count) => {
    return character_pattern.repeat(repetition_count);
  };

  const movement_blueprint = [
    ['U', y_change + 1],
    ['R', x_change + 1],
    ['D', y_change + 1],
    ['L', x_change + 1],
    ['L', 1],
    ['U', y_change + 2],
    ['R', x_change + 2],
    ['DR', 1],
    ['D', y_change + 2],
    ['L', x_change + 2],
    ['U', 1]
  ];

  const resultant_path_string = movement_blueprint
    .map(segment_spec => create_repeated_string(segment_spec[0], segment_spec[1]))
    .join('');

  console.log(resultant_path_string);
};

trajectory_generator(require('fs').readFileSync('/dev/stdin', 'utf8'));