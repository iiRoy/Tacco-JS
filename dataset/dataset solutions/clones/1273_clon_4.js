var _native_input_source = process.stdin;
var _native_output_sink = process.stdout;

var data_accumulator_storage = '';

var io_controller_unit = {
    standard_input_pipe: {
        activate: function() { _native_input_source.resume(); },
        set_encoding_format: function(format_specifier) { _native_input_source.setEncoding(format_specifier); },
        on_event: function(event_label, event_handler_function) {
            _native_input_source.on(event_label, event_handler_function);
        }
    },
    standard_output_pipe: {
        emit_message: function(content_string) {
            _native_output_sink.write(content_string);
        }
    }
};

function execute_processing_sequence() {
    var raw_line_segments = data_accumulator_storage.split('\n');
    var target_string_for_reversal = raw_line_segments[1];

    var parsed_string_components = [];
    var last_space_position = -1;
    var total_string_length = target_string_for_reversal.length;

    for (var current_char_index = 0; current_char_index < total_string_length; current_char_index++) {
        if (target_string_for_reversal.charAt(current_char_index) === ' ') {
            var extracted_component = target_string_for_reversal.substring(last_space_position + 1, current_char_index);
            parsed_string_components.push(extracted_component);
            last_space_position = current_char_index;
        }
    }
    parsed_string_components.push(target_string_for_reversal.substring(last_space_position + 1, total_string_length));

    var reordered_components = [];
    var component_count = parsed_string_components.length;
    for (var idx_rev = 0; idx_rev < component_count; idx_rev++) {
        reordered_components.push(parsed_string_components[component_count - 1 - idx_rev]);
    }

    var final_result_string = '';
    for (var idx_join = 0; idx_join < component_count; idx_join++) {
        final_result_string += reordered_components[idx_join];
        if (idx_join < component_count - 1) {
            final_result_string += ' ';
        }
    }

    io_controller_unit.standard_output_pipe.emit_message(final_result_string + '\n');
}

io_controller_unit.standard_input_pipe.activate();
io_controller_unit.standard_input_pipe.set_encoding_format('utf8');
io_controller_unit.standard_input_pipe.on_event('data', function(incoming_data_portion) {
    data_accumulator_storage += incoming_data_portion;
});
io_controller_unit.standard_input_pipe.on_event('end', function() {
    execute_processing_sequence();
});