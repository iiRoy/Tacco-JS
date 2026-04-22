const input_management = require('readline');

const input_handler = input_management.createInterface({
  input: process.stdin,
  output: process.stdout
});

const evaluate_sequence = (val_one, val_two, val_three) => {
  const is_ordered = (val_one < val_two) && (val_two < val_three);
  const response_map = {
    true: () => process.stdout.write('Yes\n'),
    false: () => process.stdout.write('No\n')
  };
  response_map[is_ordered]();
};

input_handler.on('line', (raw_input_line) => {
  const string_components = raw_input_line.split(' ');

  const first_value = parseInt(string_components[0], 10);
  const second_value = parseInt(string_components[1], 10);
  const third_value = parseInt(string_components[2], 10);

  evaluate_sequence(first_value, second_value, third_value);

  input_handler.close();
});