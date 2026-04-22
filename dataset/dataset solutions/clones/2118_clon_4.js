const FAILURE_SIGNAL = -1;
const file_system_operations = require('fs');
const standard_input_path = '/dev/stdin';
const encoding_format = 'utf8';

const parse_numeric_value = (text_item) => parseInt(text_item, 10);

const solution_orchestrator = (raw_data_stream) => {
    const data_segments = raw_data_stream.split('\n');

    const [digit_quantity, condition_count] = data_segments.shift()
        .split(' ')
        .map(parse_numeric_value);

    const initial_digit_arrangement = Array.from({ length: digit_quantity }, () => null);

    const conditions_list = data_segments
        .slice(0, condition_count)
        .map(line => line.split(' ').map(parse_numeric_value));

    const constrained_sequence = conditions_list.reduce((current_sequence, [position_index, digit_value]) => {
        if (current_sequence === FAILURE_SIGNAL) {
            return FAILURE_SIGNAL;
        }

        const array_position = position_index - 1;

        if (current_sequence[array_position] !== null && current_sequence[array_position] !== digit_value) {
            return FAILURE_SIGNAL;
        }

        return [
            ...current_sequence.slice(0, array_position),
            digit_value,
            ...current_sequence.slice(array_position + 1)
        ];
    }, initial_digit_arrangement);

    if (constrained_sequence === FAILURE_SIGNAL) {
        process.stdout.write(String(FAILURE_SIGNAL));
        return;
    }

    const finalize_sequence = (sequence, num_digits) => {
        if (num_digits > 1) {
            if (sequence[0] === 0 || sequence[0] === null) {
                return FAILURE_SIGNAL;
            }
            return sequence.map(d => d === null ? 0 : d);
        } else {
            return sequence.map(d => d === null ? 0 : d);
        }
    };

    const final_digit_result = finalize_sequence(constrained_sequence, digit_quantity);

    if (final_digit_result === FAILURE_SIGNAL) {
        process.stdout.write(String(FAILURE_SIGNAL));
    } else {
        process.stdout.write(final_digit_result.join(''));
    }
};

solution_orchestrator(file_system_operations.readFileSync(standard_input_path, encoding_format));