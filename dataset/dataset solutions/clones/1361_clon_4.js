const input_handler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

input_handler.on('line', (data_stream) => {
  let temporary_token = '';
  const extracted_units = [];
  let last_char_space = true;

  for (let idx = 0; idx < data_stream.length; idx++) {
    const character_value = data_stream[idx];
    if (character_value === ' ') {
      if (!last_char_space) {
        extracted_units.push(temporary_token);
        temporary_token = '';
      }
      last_char_space = true;
    } else {
      temporary_token += character_value;
      last_char_space = false;
    }
  }
  if (temporary_token.length > 0 || !last_char_space) {
    extracted_units.push(temporary_token);
  }

  const ordered_elements = extracted_units;
  for (let i_pos = 1; i_pos < ordered_elements.length; i_pos++) {
    let current_focus_string = ordered_elements[i_pos];
    let current_focus_numeric = Number(current_focus_string);
    let j_pos = i_pos - 1;
    while (j_pos >= 0 && Number(ordered_elements[j_pos]) > current_focus_numeric) {
      ordered_elements[j_pos + 1] = ordered_elements[j_pos];
      j_pos--;
    }
    ordered_elements[j_pos + 1] = current_focus_string;
  }

  let final_presentation_string = '';
  for (let k_pos = 0; k_pos < ordered_elements.length; k_pos++) {
    final_presentation_string += ordered_elements[k_pos];
    if (k_pos < ordered_elements.length - 1) {
      final_presentation_string += ' ';
    }
  }

  process.stdout.write(final_presentation_string + '\n');
});