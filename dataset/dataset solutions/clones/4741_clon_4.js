const data_source = require('node:fs');
const content_payload = data_source.readFileSync('/dev/stdin', 'utf8');

const text_segments = content_payload.split('\n');
const numeric_string = text_segments.shift();
const prime_value = parseInt(numeric_string, 10);

const compute_final_score = (input_integer) => {
    const eleven_unit_count = (input_integer / 11) | 0;
    const residual_amount = input_integer % 11;
    const residual_increment = ((residual_amount + 5) / 6) | 0;
    return (eleven_unit_count * 2) + residual_increment;
};

const final_computation_output = compute_final_score(prime_value);
console.log(final_computation_output);