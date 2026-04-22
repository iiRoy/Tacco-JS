const input_stream_handler = require('readline');
const data_interface = input_stream_handler.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let collected_lines = [];
let total_test_cases = 0;

data_interface.on('line', (individual_input_line) => {
    collected_lines.push(individual_input_line);
});

data_interface.on('close', () => {
    total_test_cases = Number(collected_lines[0]);
    process_all_scenarios(collected_lines.slice(1));
});

const generate_power_of_ten = (magnitude_exponent) => {
    if (magnitude_exponent === 0) return 1;
    return Number('1' + '0'.repeat(magnitude_exponent));
};

const identify_matching_sequences = (first_number_digits, second_number_digits) => {
    const valid_results = [];

    const start_first_number = generate_power_of_ten(first_number_digits - 1);
    const end_first_number = generate_power_of_ten(first_number_digits) - 1;

    const start_second_number = generate_power_of_ten(second_number_digits - 1);
    const end_second_number = generate_power_of_ten(second_number_digits) - 1;

    Array.from({ length: end_first_number - start_first_number + 1 }, (_, first_idx) => start_first_number + first_idx)
        .forEach(current_first_value => {
            Array.from({ length: end_second_number - start_second_number + 1 }, (_, second_idx) => start_second_number + second_idx)
                .forEach(current_second_value => {
                    const series_summation = (current_first_value + current_second_value) * (current_second_value - current_first_value + 1) / 2;
                    const combined_numeric_representation = Number(`${current_first_value}${current_second_value}`);

                    if (series_summation === combined_numeric_representation) {
                        valid_results.push(`${current_first_value} ${current_second_value}`);
                    }
                });
        });

    return valid_results;
};

const process_all_scenarios = (scenario_inputs) => {
    scenario_inputs.forEach((scenario_text, scenario_index) => {
        const [digit_count_x, digit_count_y] = scenario_text.split(' ').map(Number);
        const discovered_matches = identify_matching_sequences(digit_count_x, digit_count_y);

        if (discovered_matches.length > 0) {
            discovered_matches.forEach(match_string => process.stdout.write(match_string + '\n'));
        } else {
            process.stdout.write('No cats.\n');
        }
    });
};