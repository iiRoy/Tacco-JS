const standard_input_stream = process.stdin;
const standard_output_stream = process.stdout;

let accumulated_content = '';

standard_input_stream.setEncoding('utf8');

standard_input_stream.on('data', function(chunk_of_data) {
    accumulated_content += chunk_of_data;
});

standard_input_stream.on('end', function() {
    const whitespace_trimmer_regex = /^\s+|\s+$/g;
    let altered_content = accumulated_content.replace(whitespace_trimmer_regex, '');

    const case_transformer_function = String.prototype.toUpperCase;
    let resultant_content = case_transformer_function.call(altered_content);

    standard_output_stream.write(resultant_content + '\n');
});