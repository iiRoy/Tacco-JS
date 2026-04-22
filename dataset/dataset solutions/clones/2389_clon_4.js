const { createInterface: makeInputEngine } = require('readline');
const standardInput = process.stdin;
const standardOutput = process.stdout;

standardInput.resume();
standardInput.setEncoding('utf8');

let input_segments = [];
let input_engine = makeInputEngine({
  input: standardInput,
  output: standardOutput
});

input_engine.on('line', (current_segment) => {
  input_segments.push(current_segment);
});

input_engine.on('close', () => {
  const cipher_key_str = input_segments[0];
  const cipher_key = Number(cipher_key_str);
  const text_data = input_segments[1];

  const character_transformer = (single_char) => {
    const base_ascii_A = 'A'.charCodeAt(0);
    const base_ascii_Z = 'Z'.charCodeAt(0);
    const char_val = single_char.charCodeAt(0);

    const is_upper_alpha = (char_val >= base_ascii_A && char_val <= base_ascii_Z);

    if (is_upper_alpha) {
      const relative_offset = char_val - base_ascii_A;
      const shifted_offset = (relative_offset + cipher_key) % 26;
      const normalized_shifted_offset = (shifted_offset + 26) % 26; // Ensure positive modulo result
      return String.fromCharCode(base_ascii_A + normalized_shifted_offset);
    } else {
      if (cipher_key === 0) {
        return undefined; // Replicates original 'undefined' behavior for non-alpha with 0 shift
      }
      let effective_base_index = -1 + cipher_key; // Replicates `idx = -1` for non-alpha
      let final_computed_index;
      if (effective_base_index > 25) {
        final_computed_index = effective_base_index - 26;
      } else {
        final_computed_index = effective_base_index;
      }
      return String.fromCharCode(base_ascii_A + final_computed_index);
    }
  };

  const transformed_chars = [...text_data].map(character_transformer);
  const final_output_buffer = transformed_chars.join('');

  standardOutput.write(final_output_buffer + '\n');
});