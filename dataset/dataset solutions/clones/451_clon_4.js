const input_source_manager = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let collected_numerical_tuples = [];

function evaluate_and_display_sequences(tuple_array) {
  for (const current_tuple of tuple_array) {
    const component_a = current_tuple[0];
    const component_b = current_tuple[1];

    if (component_a === 0 && component_b === 0) {
      break;
    }

    const smaller_component = Math.min(component_a, component_b);
    const larger_component = Math.max(component_a, component_b);

    console.log(`${smaller_component} ${larger_component}`);
  }
}

input_source_manager.on('line', (input_line_content) => {
  const string_parts = input_line_content.split(' ');
  const val_one = parseInt(string_parts[0], 10);
  const val_two = parseInt(string_parts[1], 10);

  collected_numerical_tuples.push([val_one, val_two]);

  if (val_one === 0 && val_two === 0) {
    evaluate_and_display_sequences(collected_numerical_tuples);
    input_source_manager.close();
  }
});