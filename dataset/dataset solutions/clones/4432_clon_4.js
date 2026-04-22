const file_system_module = require('node:fs');

const complete_input_stream_content = file_system_module.readFileSync('/dev/stdin', 'utf8');

const primary_input_segment = complete_input_stream_content.split('\n')[0];

const first_delimiter_index = primary_input_segment.indexOf(' ');
const first_extracted_portion = (first_delimiter_index === -1) ? primary_input_segment : primary_input_segment.substring(0, first_delimiter_index);

const subsequent_segment = (first_delimiter_index === -1) ? '' : primary_input_segment.substring(first_delimiter_index + 1);

const second_delimiter_index = subsequent_segment.indexOf(' ');
const second_extracted_portion = (second_delimiter_index === -1) ? subsequent_segment : subsequent_segment.substring(0, second_delimiter_index);

const first_numerical_element = Number(first_extracted_portion);
const second_numerical_element = Number(second_extracted_portion);

const process_arithmetic_operation = (val_one, val_two) => {
    return (val_one - 1) * (val_two - 1);
};

const final_computation_result_value = process_arithmetic_operation(first_numerical_element, second_numerical_element);

process.stdout.write(String(final_computation_result_value) + '\n');