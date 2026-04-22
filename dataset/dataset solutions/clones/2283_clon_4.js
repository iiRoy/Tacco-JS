const get_factorials_array = (upper_limit) => {
    let current_factorials = [1];
    for (let i = 1; i <= upper_limit; ++i) {
        current_factorials[i] = current_factorials[i - 1] * i;
    }
    return current_factorials;
};

const determine_lex_rank = (input_sequence, sorted_alphabet, known_factorials) => {
    let rank_value = 0;
    let sequence_length = input_sequence.length;
    let available_symbols = [...sorted_alphabet];

    for (let i = 0; i < sequence_length; ++i) {
        let current_symbol = input_sequence[i];
        let symbol_position_in_available = available_symbols.indexOf(current_symbol);

        rank_value += symbol_position_in_available * known_factorials[sequence_length - 1 - i];

        available_symbols.splice(symbol_position_in_available, 1);
    }
    return rank_value;
};

const orchestrate_process = () => {
    const raw_input_data = require('fs').readFileSync('/dev/stdin', 'utf8');
    const processed_lines = raw_input_data.trim().split('\n');

    const first_sequence_parts = processed_lines[1].split(' ');
    const second_sequence_parts = processed_lines[2].split(' ');

    const permutation_size = first_sequence_parts.length;

    const unique_elements_set = new Set(first_sequence_parts);
    const sorted_element_alphabet = Array.from(unique_elements_set).sort();

    const precomputed_factorial_values = get_factorials_array(permutation_size);

    const rank_for_first = determine_lex_rank(first_sequence_parts, sorted_element_alphabet, precomputed_factorial_values);
    const rank_for_second = determine_lex_rank(second_sequence_parts, sorted_element_alphabet, precomputed_factorial_values);

    console.log(Math.abs(rank_for_first - rank_for_second));
};

orchestrate_process();