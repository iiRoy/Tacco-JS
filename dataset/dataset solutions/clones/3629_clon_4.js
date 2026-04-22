const io_handler = require('readline');
const raw_input_lines = [];

const stream_reader = io_handler.createInterface({
    input: process.stdin,
    output: process.stdout,
});

stream_reader.on('line', (current_content) => {
    raw_input_lines.push(current_content);
});

stream_reader.on('close', () => {
    const first_line_parts = raw_input_lines[0].split(" ");
    const array_size = parseInt(first_line_parts[0], 10);
    const divisor_value = parseInt(first_line_parts[1], 10);

    const source_elements = raw_input_lines[1].split(" ").map(element_val => parseInt(element_val, 10));

    const cumulative_remainders = source_elements.reduce((accumulator_list, current_element) => {
        const last_remainder = accumulator_list[accumulator_list.length - 1];
        const next_remainder = (last_remainder + current_element) % divisor_value;
        accumulator_list.push(next_remainder);
        return accumulator_list;
    }, [0]);

    const remainder_occurrences = new Map();
    for (const remainder_val of cumulative_remainders) {
        remainder_occurrences.set(remainder_val, (remainder_occurrences.get(remainder_val) || 0) + 1);
    }

    let segment_count = 0;
    for (const count of remainder_occurrences.values()) {
        segment_count += (count * (count - 1)) / 2;
    }

    console.log(segment_count);
});