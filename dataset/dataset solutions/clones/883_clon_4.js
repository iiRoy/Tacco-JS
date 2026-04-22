const stream_reader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let collected_lines = [];

stream_reader.on('line', (current_input_line) => {
    collected_lines.push(current_input_line);
});

stream_reader.on('close', () => {
    if (collected_lines.length === 0) {
        return;
    }
    const primary_text_source = collected_lines[0];
    const generated_output_script = process_text_to_commands(primary_text_source);
    console.log(generated_output_script);
});

function process_text_to_commands(source_data) {
    const character_numeric_values = Array.from(source_data, (ch) => ch.codePointAt(0));
    const command_size_threshold = 16;

    const processing_outcome = character_numeric_values.reduce((accumulator_state, current_char_code) => {
        const { last_observed_code, output_instruction_parts } = accumulator_state;
        const value_difference = current_char_code - last_observed_code;

        const instruction_segments = create_command_sequence(value_difference, command_size_threshold);

        output_instruction_parts.push(...instruction_segments);

        return { last_observed_code: current_char_code, output_instruction_parts: output_instruction_parts };
    }, { last_observed_code: 0, output_instruction_parts: [] });

    return processing_outcome.output_instruction_parts.join('');
}

function create_command_sequence(offset_from_previous, limit_constant) {
    const instruction_collection = [];

    if (offset_from_previous === 0) {
        instruction_collection.push('.');
    } else {
        const direction_symbol = offset_from_previous > 0 ? '+' : '-';
        const absolute_magnitude = Math.abs(offset_from_previous);

        if (absolute_magnitude < limit_constant) {
            instruction_collection.push(...Array(absolute_magnitude).fill(direction_symbol));
        } else {
            const integer_square_root = Math.floor(Math.sqrt(absolute_magnitude));
            const remainder_amount = absolute_magnitude - integer_square_root * integer_square_root;

            instruction_collection.push('>');
            instruction_collection.push(...Array(integer_square_root).fill('+'));
            instruction_collection.push('[<');
            instruction_collection.push(...Array(integer_square_root).fill(direction_symbol));
            instruction_collection.push('>-]<');
            instruction_collection.push(...Array(remainder_amount).fill(direction_symbol));
        }
        instruction_collection.push('.');
    }
    return instruction_collection;
}