process.stdin.resume();
process.stdin.setEncoding('utf8');

var input_lines_buffer = [];
var input_reader_instance = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
input_reader_instance.on('line', (current_line_data) => {
  input_lines_buffer.push(current_line_data);
});
input_reader_instance.on('close', () => {
    const first_line_value_str = input_lines_buffer[0];
    const first_line_numeric = Number(first_line_value_str);

    const second_line_parts = input_lines_buffer[1].split(" ");
    const parsed_numbers_array = second_line_parts.map(str_num => parseInt(str_num, 10));

    const even_elements_count = parsed_numbers_array.reduce((accumulator, current_number) => {
        return accumulator + (current_number % 2 === 0 ? 1 : 0);
    }, 0);

    const power_of_three_term = Math.pow(3, first_line_numeric);
    const power_of_two_term = Math.pow(2, even_elements_count);

    console.log(power_of_three_term - power_of_two_term);
});
