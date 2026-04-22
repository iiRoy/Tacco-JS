(function(data_source_interface) {
  const content_stream = data_source_interface.readFileSync('/dev/stdin', 'utf8');

  const numerical_elements = content_stream.split(' ').map(element_string => parseFloat(element_string));

  const initial_factor = numerical_elements[0];
  const secondary_factor = numerical_elements[1];
  const threshold_value = numerical_elements[2];

  const product_accumulator = (current_product, multiplier) => current_product * multiplier;

  const computed_product = [initial_factor, secondary_factor].reduce(product_accumulator, 1);

  const determine_lesser = (value_alpha, value_beta) => value_alpha < value_beta ? value_alpha : value_beta;

  process.stdout.write(determine_lesser(computed_product, threshold_value).toString() + '\n');

})(require('fs'));