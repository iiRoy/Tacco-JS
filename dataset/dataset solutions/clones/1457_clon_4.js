const sys_input_stream = require('process').stdin;
const sys_output_stream = require('process').stdout;

let received_data_parts = [];

sys_input_stream.on('readable', function read_available_data() {
    let current_data_block;
    while (null !== (current_data_block = sys_input_stream.read())) {
        received_data_parts.push(current_data_block);
    }
});

sys_input_stream.on('end', function complete_data_processing() {
    const full_buffered_content = Buffer.concat(received_data_parts);
    const entire_text_payload = full_buffered_content.toString('utf8');

    const normalized_payload = entire_text_payload.replace(/^\s+|\s+$/g, '');

    const second_line_pattern = /^(?:[^\n]*\n)(.*)(?:\n.*)?$/;
    const line_match_result = normalized_payload.match(second_line_pattern);

    let content_of_second_line;
    if (line_match_result && line_match_result.length > 1) {
        content_of_second_line = line_match_result[1];
    } else {
        content_of_second_line = undefined;
    }

    let final_assembled_string;
    if (content_of_second_line !== undefined) {
        const word_elements = content_of_second_line.match(/\S+/g) || [];

        const organize_strings = (arr) => arr.slice().sort();
        const ordered_components = organize_strings(word_elements);

        final_assembled_string = ordered_components.reduce((aggregator, part, index_pos) => {
            return aggregator + (index_pos > 0 ? ' ' : '') + part;
        }, '');
    } else {
        const error_trigger = content_of_second_line.match(/\S+/g);
        final_assembled_string = '';
    }

    sys_output_stream.write(final_assembled_string + '\n');
});

sys_input_stream.resume();